import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionTimeoutService } from '../../services/session-timeout.service';

@Component({
  selector: 'app-session-timeout-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (sessionService.isWarningVisible()) {
      <div class="session-modal-backdrop" (click)="onBackdropClick($event)">
        <div class="session-modal-card shadow-2xl rounded-4 overflow-hidden border" (click)="$event.stopPropagation()">
          
          <!-- En-tête avec bannière d'alerte sécurité -->
          <div class="modal-header-banner p-4 text-center text-white position-relative">
            <div class="pulse-icon-container mx-auto mb-2 d-flex align-items-center justify-content-center">
              <i class="bi bi-hourglass-split fs-2"></i>
            </div>
            <h5 class="fw-bold mb-1" style="font-family: 'Poppins', sans-serif;">Session bientôt expirée</h5>
            <span class="badge bg-warning text-dark px-3 py-1 rounded-pill fw-semibold small">
              <i class="bi bi-shield-exclamation me-1"></i> Inactivité prolongée détectée
            </span>
          </div>

          <!-- Corps de la modale avec compteur dynamique -->
          <div class="p-4 text-center bg-white">
            <p class="text-muted small mb-3">
              Vous n'avez effectué aucune action depuis près de 
              <strong>{{ sessionService.getTimeoutMinutes() }} minutes</strong>. 
              Pour protéger vos données, votre session sera automatiquement fermée dans :
            </p>

            <!-- Cercle de compte à rebours dynamique -->
            <div class="countdown-circle mx-auto my-3 d-flex flex-column align-items-center justify-content-center">
              <span class="countdown-number fw-bold text-primary display-6 mb-0">
                {{ sessionService.secondsRemaining() }}
              </span>
              <span class="text-muted text-uppercase fw-semibold" style="font-size: 11px; letter-spacing: 1px;">
                Secondes
              </span>
            </div>

            <!-- Barre de progression visuelle des 60 secondes -->
            <div class="progress mb-4 rounded-pill" style="height: 6px; background-color: #E2E8F0;">
              <div 
                class="progress-bar progress-bar-striped progress-bar-animated bg-warning" 
                role="progressbar" 
                [style.width.%]="(sessionService.secondsRemaining() / 60) * 100">
              </div>
            </div>

            <p class="small text-muted mb-4 fst-italic" style="font-size: 12px;">
              Bougez votre souris, appuyez sur une touche ou cliquez sur « Rester connecté » pour prolonger votre session.
            </p>

            <!-- Boutons d'action clairs et accessibles -->
            <div class="d-flex flex-column flex-sm-row gap-2 justify-content-center">
              <button 
                type="button" 
                class="btn btn-outline-secondary px-3 py-2 rounded-3 small fw-semibold order-2 order-sm-1"
                (click)="onLogoutNow()">
                <i class="bi bi-box-arrow-right me-1"></i> Se déconnecter
              </button>

              <button 
                type="button" 
                class="btn btn-primary px-4 py-2 rounded-3 fw-bold shadow-sm order-1 order-sm-2 d-inline-flex align-items-center justify-content-center gap-2"
                style="background-color: #0B3D91; border-color: #0B3D91;"
                (click)="onExtendSession()">
                <i class="bi bi-arrow-repeat"></i>
                <span>Rester connecté</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    }
  `,
  styles: [`
    .session-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.72);
      backdrop-filter: blur(6px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      animation: fadeIn 0.25s ease-out;
    }

    .session-modal-card {
      width: 100%;
      max-width: 440px;
      background: #FFFFFF;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
      animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .modal-header-banner {
      background: linear-gradient(135deg, #072559 0%, #0B3D91 60%, #1E3A8A 100%);
    }

    .pulse-icon-container {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: #FCD34D;
      animation: pulseAlert 1.5s infinite;
    }

    .countdown-circle {
      width: 110px;
      height: 110px;
      border-radius: 50%;
      background: #F8FAFC;
      border: 3px solid #0B3D91;
      box-shadow: 0 6px 16px rgba(11, 61, 145, 0.12);
    }

    .countdown-number {
      font-family: 'Poppins', sans-serif;
      line-height: 1;
      color: #0B3D91 !important;
    }

    @keyframes pulseAlert {
      0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
      70% { transform: scale(1.05); box-shadow: 0 0 0 12px rgba(245, 158, 11, 0); }
      100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleUp {
      from { transform: scale(0.92); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class SessionTimeoutModalComponent {
  public sessionService = inject(SessionTimeoutService);

  onBackdropClick(event: MouseEvent): void {
    // Cliquer sur le fond prolonge la session
    this.sessionService.extendSession();
  }

  onExtendSession(): void {
    this.sessionService.extendSession();
  }

  onLogoutNow(): void {
    this.sessionService.logoutNow();
  }
}
