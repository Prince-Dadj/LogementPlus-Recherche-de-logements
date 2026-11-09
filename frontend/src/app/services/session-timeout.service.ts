import { Injectable, signal, inject, NgZone, effect } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ModalAlertService } from './modal-alert.service';

@Injectable({
  providedIn: 'root'
})
export class SessionTimeoutService {
  private authService = inject(AuthService);
  private router = inject(Router);
  private modalAlert = inject(ModalAlertService);
  private ngZone = inject(NgZone);

  // Configuration du délai d'inactivité (15 minutes par défaut)
  private readonly DEFAULT_TIMEOUT_MINUTES = 15;
  private timeoutMinutes = this.DEFAULT_TIMEOUT_MINUTES;
  private timeoutDurationMs = this.timeoutMinutes * 60 * 1000; // 15 min en ms
  private warningDurationMs = 60 * 1000; // 60 secondes avant déconnexion pour avertissement

  // État réactif
  public isWarningVisible = signal<boolean>(false);
  public secondsRemaining = signal<number>(60);
  public isMonitoring = signal<boolean>(false);

  private checkIntervalId: any = null;
  private countdownIntervalId: any = null;
  private lastActivityTimestamp = Date.now();
  private lastActivityThrottle = 0;
  private boundActivityListener: any = null;
  private boundVisibilityListener: any = null;
  private boundStorageListener: any = null;

  // Clés de stockage local
  private readonly STORAGE_KEY_LAST_ACTIVITY = 'auth_last_activity';

  constructor() {
    // Réaction automatique aux connexions / déconnexions
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.startMonitoring();
      } else {
        this.stopMonitoring();
      }
    });

    this.init();
  }

  /**
   * Initialise la surveillance automatique selon l'état de connexion de l'utilisateur
   */
  public init(): void {
    // Écoute des changements de l'utilisateur connecté via l'état d'AuthService
    // On vérifie immédiatement au chargement
    if (this.authService.isLoggedIn()) {
      this.startMonitoring();
    }

    // Synchronisation multi-onglets (écoute du storage event)
    this.boundStorageListener = (event: StorageEvent) => {
      if (event.key === this.STORAGE_KEY_LAST_ACTIVITY && event.newValue) {
        const remoteTime = parseInt(event.newValue, 10);
        if (!isNaN(remoteTime) && remoteTime > this.lastActivityTimestamp) {
          this.lastActivityTimestamp = remoteTime;
          // Si l'utilisateur est actif sur un autre onglet, masquer l'avertissement ici
          if (this.isWarningVisible()) {
            this.hideWarning();
          }
        }
      }
      // Si déconnexion effectuée depuis un autre onglet
      if (event.key === 'auth_token' && !event.newValue) {
        this.stopMonitoring();
      }
    };
    window.addEventListener('storage', this.boundStorageListener);
  }

  /**
   * Permet de modifier dynamiquement la durée d'inactivité en minutes (ex: 15 min)
   */
  public setTimeoutMinutes(minutes: number): void {
    if (minutes > 0) {
      this.timeoutMinutes = minutes;
      this.timeoutDurationMs = minutes * 60 * 1000;
      this.recordActivity();
    }
  }

  public getTimeoutMinutes(): number {
    return this.timeoutMinutes;
  }

  /**
   * Démarre la détection d'inactivité
   */
  public startMonitoring(): void {
    if (this.isMonitoring()) {
      return;
    }

    this.isMonitoring.set(true);
    this.recordActivity();

    // Enregistrer les écouteurs d'événements utilisateur en dehors de la zone Angular
    // pour éviter des cycles de détection de changements inutiles à chaque micro-mouvement de souris
    this.ngZone.runOutsideAngular(() => {
      this.boundActivityListener = () => this.handleUserActivity();

      const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click', 'wheel'];
      events.forEach(eventName => {
        window.addEventListener(eventName, this.boundActivityListener, { passive: true });
      });

      // Gestion de la visibilité de la page (ex: retour après mise en veille ou changement d'onglet)
      this.boundVisibilityListener = () => {
        if (!document.hidden) {
          this.checkInactivity();
        }
      };
      document.addEventListener('visibilitychange', this.boundVisibilityListener);
      window.addEventListener('focus', this.boundVisibilityListener);

      // Intervalle de vérification toutes les 2 secondes
      this.checkIntervalId = setInterval(() => {
        this.checkInactivity();
      }, 2000);
    });
  }

  /**
   * Arrête la surveillance et nettoie les timers et listeners
   */
  public stopMonitoring(): void {
    this.isMonitoring.set(false);
    this.hideWarning();

    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
    if (this.countdownIntervalId) {
      clearInterval(this.countdownIntervalId);
      this.countdownIntervalId = null;
    }

    if (this.boundActivityListener) {
      const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click', 'wheel'];
      events.forEach(eventName => {
        window.removeEventListener(eventName, this.boundActivityListener);
      });
      this.boundActivityListener = null;
    }

    if (this.boundVisibilityListener) {
      document.removeEventListener('visibilitychange', this.boundVisibilityListener);
      window.removeEventListener('focus', this.boundVisibilityListener);
      this.boundVisibilityListener = null;
    }

    try {
      localStorage.removeItem(this.STORAGE_KEY_LAST_ACTIVITY);
    } catch (e) {}
  }

  /**
   * Traite l'activité utilisateur avec un throttle de 2 secondes pour préserver les performances
   */
  private handleUserActivity(): void {
    const now = Date.now();
    if (now - this.lastActivityThrottle < 2000) {
      return;
    }
    this.lastActivityThrottle = now;

    // Si la boîte d'avertissement était visible, toute activité directe prolonge la session
    if (this.isWarningVisible()) {
      this.ngZone.run(() => {
        this.hideWarning();
      });
    }

    this.recordActivity();
  }

  /**
   * Enregistre l'activité courante localement et dans le localStorage (sync multi-onglets)
   */
  public recordActivity(): void {
    const now = Date.now();
    this.lastActivityTimestamp = now;
    try {
      localStorage.setItem(this.STORAGE_KEY_LAST_ACTIVITY, now.toString());
    } catch (e) {}
  }

  /**
   * Vérifie si le délai d'inactivité est dépassé
   */
  private checkInactivity(): void {
    // Si l'utilisateur n'est plus connecté, couper la surveillance
    if (!this.authService.isLoggedIn()) {
      this.ngZone.run(() => {
        this.stopMonitoring();
      });
      return;
    }

    // Récupérer le dernier horodatage (possiblement mis à jour par un autre onglet)
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_LAST_ACTIVITY);
      if (stored) {
        const storedTime = parseInt(stored, 10);
        if (!isNaN(storedTime) && storedTime > this.lastActivityTimestamp) {
          this.lastActivityTimestamp = storedTime;
        }
      }
    } catch (e) {}

    const now = Date.now();
    const elapsed = now - this.lastActivityTimestamp;

    // 1. DÉPASSEMENT TOTAL DU TEMPS DE SESSION -> DÉCONNEXION IMMÉDIATE
    if (elapsed >= this.timeoutDurationMs) {
      this.ngZone.run(() => {
        this.handleAutoLogout();
      });
      return;
    }

    // 2. ENTRÉE DANS LA ZONE D'AVERTISSEMENT (dernières 60 secondes)
    const timeBeforeLogout = this.timeoutDurationMs - elapsed;
    if (timeBeforeLogout <= this.warningDurationMs) {
      const remainingSeconds = Math.max(1, Math.ceil(timeBeforeLogout / 1000));
      this.ngZone.run(() => {
        this.secondsRemaining.set(remainingSeconds);
        if (!this.isWarningVisible()) {
          this.showWarning();
        }
      });
    } else {
      if (this.isWarningVisible()) {
        this.ngZone.run(() => {
          this.hideWarning();
        });
      }
    }
  }

  /**
   * Affiche l'avertissement de session imminente avec compte à rebours précis
   */
  private showWarning(): void {
    this.isWarningVisible.set(true);

    if (this.countdownIntervalId) {
      clearInterval(this.countdownIntervalId);
    }

    this.countdownIntervalId = setInterval(() => {
      const now = Date.now();
      const elapsed = now - this.lastActivityTimestamp;
      const remainingMs = this.timeoutDurationMs - elapsed;
      const seconds = Math.max(0, Math.ceil(remainingMs / 1000));

      this.secondsRemaining.set(seconds);

      if (seconds <= 0) {
        clearInterval(this.countdownIntervalId);
        this.countdownIntervalId = null;
        this.handleAutoLogout();
      }
    }, 1000);
  }

  /**
   * Masque l'avertissement et arrête le compte à rebours
   */
  private hideWarning(): void {
    this.isWarningVisible.set(false);
    if (this.countdownIntervalId) {
      clearInterval(this.countdownIntervalId);
      this.countdownIntervalId = null;
    }
  }

  /**
   * Prolonge activement la session (ex: clic sur "Rester connecté")
   */
  public extendSession(): void {
    this.recordActivity();
    this.hideWarning();
  }

  /**
   * Déconnexion automatique après inactivité prolongée
   */
  public handleAutoLogout(): void {
    this.stopMonitoring();

    const wasAdmin = this.authService.isAdmin();

    // Effectuer la déconnexion
    this.authService.logout();

    // Rediriger vers la page de login appropriée avec un paramètre indiquant la cause
    const targetRoute = wasAdmin ? '/admin/login' : '/login';
    this.router.navigate([targetRoute], {
      queryParams: { reason: 'session_expired' }
    });

    // Afficher une modale d'information claire et professionnelle
    this.modalAlert.warning(
      `Votre session a expiré après ${this.timeoutMinutes} minutes d'inactivité sans réaction. Par mesure de sécurité, vous avez été déconnecté automatiquement. Veuillez vous reconnecter.`,
      'Session expirée pour inactivité'
    );
  }

  /**
   * Déconnexion volontaire immédiate depuis la fenêtre d'avertissement
   */
  public logoutNow(): void {
    this.stopMonitoring();
    const wasAdmin = this.authService.isAdmin();
    this.authService.logout();
    const targetRoute = wasAdmin ? '/admin/login' : '/login';
    this.router.navigate([targetRoute]);
  }
}
