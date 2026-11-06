import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Navigation Basse sur Mobile (Épurée & Ergonomique) -->
    <div class="d-md-none fixed-bottom bg-white border-top shadow-lg py-1" style="z-index: 1040;">
      <div class="container d-flex justify-content-around text-center py-1">
        <!-- 1. Accueil -->
        <a routerLink="/" routerLinkActive="text-primary fw-bold" [routerLinkActiveOptions]="{exact: true}" class="text-decoration-none text-muted small d-flex flex-column align-items-center">
          <i class="bi bi-house fs-5"></i>
          <span style="font-size: 11px;">Accueil</span>
        </a>

        <!-- 2. Recherche & Carte -->
        <a routerLink="/logements" routerLinkActive="text-primary fw-bold" class="text-decoration-none text-muted small d-flex flex-column align-items-center">
          <i class="bi bi-search fs-5"></i>
          <span style="font-size: 11px;">Explorer</span>
        </a>

        <!-- 3. Contact Gestionnaires -->
        <a routerLink="/contact" routerLinkActive="text-primary fw-bold" class="text-decoration-none text-muted small d-flex flex-column align-items-center">
          <i class="bi bi-headset fs-5"></i>
          <span style="font-size: 11px;">Contact</span>
        </a>

        <!-- 4. Réservations (uniquement si locataire connecté) -->
        @if (currentUser() && currentUser()?.role === 'locataire') {
          <a routerLink="/locataire" routerLinkActive="text-primary fw-bold" class="text-decoration-none text-muted small d-flex flex-column align-items-center">
            <i class="bi bi-calendar2-check fs-5"></i>
            <span style="font-size: 11px;">Réservations</span>
          </a>
        }

        <!-- 5. Compte / Connexion -->
        @if (currentUser()) {
          <a [routerLink]="getProfileLink()" routerLinkActive="text-primary fw-bold" class="text-decoration-none text-muted small d-flex flex-column align-items-center">
            <i class="bi bi-person-circle fs-5"></i>
            <span style="font-size: 11px;">Compte</span>
          </a>
        } @else {
          <a routerLink="/login" [queryParams]="{mode: 'login'}" routerLinkActive="text-primary fw-bold" class="text-decoration-none text-muted small d-flex flex-column align-items-center">
            <i class="bi bi-person-fill fs-5 text-primary"></i>
            <span style="font-size: 11px;">Connexion</span>
          </a>
        }
      </div>
    </div>
  `
})
export class MobileNavComponent {
  private auth = inject(AuthService);
  currentUser = this.auth.currentUser;

  getProfileLink(): string {
    const role = this.currentUser()?.role;
    if (role === 'superadmin') return '/superadmin';
    if (role === 'admin') return '/admin';
    return '/locataire';
  }
}
