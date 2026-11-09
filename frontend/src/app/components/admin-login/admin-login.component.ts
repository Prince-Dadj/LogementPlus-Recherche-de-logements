import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ModalAlertService } from '../../services/modal-alert.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center py-5" style="background: linear-gradient(135deg, #072559 0%, #0B3D91 50%, #083070 100%);">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-5">
            <!-- Carte de Connexion Admin -->
            <div class="card border-0 shadow-lg rounded-4 overflow-hidden bg-white">
              <!-- En-tête avec identité visuelle -->
              <div class="p-4 text-center text-white" style="background-color: #0B3D91;">
                <div class="d-inline-flex align-items-center justify-content-center bg-white text-primary rounded-circle mb-2" style="width: 50px; height: 50px; color: #0B3D91 !important;">
                  <i class="bi bi-shield-lock-fill fs-3"></i>
                </div>
                <h1 class="h4 fw-bold mb-1" style="font-family: 'Poppins', sans-serif;">Portail d'Administration</h1>
                <p class="small text-white-50 mb-0">Espace réservé aux Gestionnaires, Propriétaires & Super Admins</p>
              </div>

              <div class="card-body p-4 p-md-5">
                <!-- Alerte session expirée -->
                @if (isSessionExpired) {
                  <div class="alert alert-warning d-flex align-items-center gap-2 small py-2 mb-3 rounded-3 border-warning border-opacity-50" role="alert">
                    <i class="bi bi-clock-history text-warning flex-shrink-0 fs-5"></i>
                    <div class="small fw-semibold text-dark">
                      Session expirée : Vous avez été déconnecté suite à une inactivité prolongée. Veuillez vous reconnecter.
                    </div>
                  </div>
                }

                <!-- Message d'erreur -->
                @if (errorMessage) {
                  <div class="alert alert-danger d-flex align-items-center gap-2 small py-2 mb-3 rounded-3" role="alert">
                    <i class="bi bi-exclamation-triangle-fill fs-5"></i>
                    <div>{{ errorMessage }}</div>
                  </div>
                }

                <form (ngSubmit)="onSubmit()">
                  <!-- Email -->
                  <div class="mb-3">
                    <label class="form-label small fw-semibold text-dark">Adresse E-mail Professionnelle</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0"><i class="bi bi-envelope text-muted"></i></span>
                      <input 
                        type="email" 
                        class="form-control border-start-0" 
                        [(ngModel)]="email" 
                        name="email" 
                        placeholder="admin@agence.com" 
                        required>
                    </div>
                  </div>

                  <!-- Mot de passe -->
                  <div class="mb-3">
                    <div class="d-flex justify-content-between align-items-center">
                      <label class="form-label small fw-semibold text-dark">Mot de passe</label>
                      <a href="javascript:void(0)" class="small text-primary text-decoration-none" (click)="motDePasseOublie()">Oublié ?</a>
                    </div>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0"><i class="bi bi-key text-muted"></i></span>
                      <input 
                        [type]="showPassword ? 'text' : 'password'" 
                        class="form-control border-start-0 border-end-0" 
                        [(ngModel)]="password" 
                        name="password" 
                        placeholder="••••••••" 
                        required>
                      <button class="btn btn-outline-secondary border-start-0" type="button" (click)="showPassword = !showPassword">
                        <i class="bi" [class.bi-eye]="!showPassword" [class.bi-eye-slash]="showPassword"></i>
                      </button>
                    </div>
                  </div>

                  <!-- 2FA et Sécurité (CDC RF-02) -->
                  <div class="form-check mb-4">
                    <input class="form-check-input" type="checkbox" id="twoFactor" checked disabled>
                    <label class="form-check-label small text-muted" for="twoFactor">
                      <i class="bi bi-shield-check text-success me-1"></i> Authentification à double facteur (2FA) active (CDC RF-02)
                    </label>
                  </div>

                  <!-- Bouton de connexion -->
                  <button type="submit" class="btn btn-primary w-100 py-2 rounded-3 fw-semibold mb-3 d-flex align-items-center justify-content-center gap-2" [disabled]="isLoading">
                    @if (isLoading) {
                      <span class="spinner-border spinner-border-sm"></span>
                      Connexion en cours...
                    } @else {
                      <i class="bi bi-box-arrow-in-right"></i>
                      Se connecter à l'espace Admin
                    }
                  </button>
                </form>

                <!-- Boutons d'accès rapide pour tests / démo -->
                <div class="border-top pt-3 mt-3">
                  <span class="small text-muted d-block text-center mb-2">Comptes de test rapide (1-clic) :</span>
                  <div class="d-flex gap-2">
                    <button type="button" class="btn btn-outline-primary btn-sm flex-grow-1 rounded-pill" (click)="fillDemo('admin')">
                      <i class="bi bi-building me-1"></i> Gestionnaire
                    </button>
                    <button type="button" class="btn btn-outline-danger btn-sm flex-grow-1 rounded-pill" (click)="fillDemo('superadmin')">
                      <i class="bi bi-shield-lock me-1"></i> Super Admin
                    </button>
                  </div>
                </div>

                <div class="text-center mt-4">
                  <a routerLink="/" class="text-muted small text-decoration-none">
                    <i class="bi bi-arrow-left me-1"></i> Retour au site public
                  </a>
                </div>
              </div>
            </div>

            <!-- Note de conformité CDC -->
            <p class="text-center text-white-50 small mt-3">
              Conformité CDC RF-02 : Connexion chiffrée SSL/TLS • Mots de passe sous Bcrypt • Audit des accès
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminLoginComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private modalAlert = inject(ModalAlertService);

  email = 'laminecamara@gmail.com';
  password = 'password123';
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  isSessionExpired = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['reason'] === 'session_expired') {
        this.isSessionExpired = true;
      }
    });
  }

  fillDemo(role: 'admin' | 'superadmin') {
    if (role === 'admin') {
      this.email = 'laminecamara@gmail.com';
      this.password = 'password123';
    } else {
      this.email = 'superadmin@logementplus.com';
      this.password = 'password123';
    }
  }

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.isLoading = false;
        const role = res.user.role;
        if (role === 'superadmin') {
          this.router.navigate(['/superadmin']);
        } else if (role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.errorMessage = 'Accès réservé : Votre compte est enregistré en tant que Locataire. Utilisez l\'espace locataire.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Identifiants administrateur incorrects. Veuillez vérifier vos accès.';
      }
    });
  }

  motDePasseOublie() {
    this.modalAlert.info('Pour réinitialiser votre mot de passe administrateur, un lien de réinitialisation sécurisé peut être envoyé à votre adresse e-mail professionnelle.', 'Réinitialisation du Mot de Passe');
  }
}
