import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark fixed-top py-2 app-navbar">
      <div class="container-fluid px-lg-4">
        <!-- Logo Officiel SanarHousings : Écusson architectural moderne -->
        <a class="navbar-brand d-flex align-items-center gap-2 py-0" routerLink="/">
          <span class="d-inline-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm" style="width: 36px; height: 36px; padding: 6px;">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 3L3 13.5L5.5 15.5L16 7L26.5 15.5L29 13.5L16 3Z" fill="#14B8A6"/>
              <path d="M22 6H25V11.2L22 8.8V6Z" fill="#0D9488"/>
              <path d="M6 14V27C6 28.1 6.9 29 8 29H24C25.1 29 26 28.1 26 27V14L16 6L6 14Z" fill="#0B3D91"/>
              <path d="M13 29V20C13 18.34 14.34 17 16 17C17.66 17 19 18.34 19 20V29H13Z" fill="#FFFFFF"/>
              <circle cx="16" cy="12" r="2.2" fill="#F59E0B"/>
            </svg>
          </span>
          <span class="fw-bold tracking-tight text-white fs-5" style="font-family: 'Poppins', sans-serif;">
            Sanar<span style="color: #14B8A6;">Housings</span>
          </span>
        </a>

        <!-- Bouton mobile toggle -->
        <button class="navbar-toggler border-0 shadow-none px-2 py-1" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="mainNavbar">
          <!-- Liens de navigation épurés -->
          <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
            <li class="nav-item me-2">
              <a class="nav-link text-white opacity-90 px-3 fw-bold nav-link-custom" routerLink="/" routerLinkActive="active opacity-100 fw-bold" [routerLinkActiveOptions]="{exact: true}">
                <i class="bi bi-house me-1"></i> Accueil
              </a>
            </li>
            <li class="nav-item me-2">
              <a class="nav-link text-white opacity-90 px-3 fw-bold nav-link-custom" routerLink="/logements" routerLinkActive="active opacity-100 fw-bold">
                <i class="bi bi-search me-1"></i> Explorer & Carte
              </a>
            </li>
            <li class="nav-item me-2">
              <a class="nav-link text-white opacity-90 px-3 fw-bold nav-link-custom" routerLink="/about" routerLinkActive="active opacity-100 fw-bold">
                <i class="bi bi-info-circle me-1"></i> À propos
              </a>
            </li>
            <li class="nav-item me-2">
              <a class="nav-link text-white opacity-90 px-3 fw-bold nav-link-custom" routerLink="/contact" routerLinkActive="active opacity-100 fw-bold">
                <i class="bi bi-headset me-1"></i> Contact
              </a>
            </li>
            <!-- <li class="nav-item me-2">
              <a class="nav-link text-white opacity-90 px-3 fw-bold nav-link-custom " routerLink="/faq" routerLinkActive="active opacity-100 fw-bold">
                <i class="bi bi-question-circle me-1"></i> FAQ
              </a>
            </li> -->

            <!-- Mes Réservations : UNIQUEMENT quand l'utilisateur est connecté en tant que locataire -->
            @if (currentUser() && currentUser()?.role === 'locataire') {
              <li class="nav-item">
                <a class="nav-link text-white opacity-90 px-3 fw-bold nav-link-custom" routerLink="/locataire" routerLinkActive="active opacity-100 fw-bold">
                  <i class="bi bi-calendar-check me-1"></i> Mon Espace Locataire
                </a>
              </li>
            }

            <!-- Espace Gestionnaire : UNIQUEMENT pour les admins connectés -->
            @if (currentUser() && (currentUser()?.role === 'admin' || currentUser()?.role === 'superadmin')) {
              <li class="nav-item">
                <a class="nav-link text-white opacity-90 px-3 fw-bold nav-link-custom" routerLink="/admin" routerLinkActive="active opacity-100 fw-bold">
                  <i class="bi bi-buildings me-1"></i> Mon Espace Gestionnaire
                </a>
              </li>
            }

            <!-- Super Admin : UNIQUEMENT pour super admin connecté -->
            @if (currentUser() && currentUser()?.role === 'superadmin') {
              <li class="nav-item">
                <a class="nav-link text-white opacity-90 px-3 fw-bold nav-link-custom" routerLink="/superadmin" routerLinkActive="active opacity-100 fw-bold">
                  <i class="bi bi-shield-lock me-1"></i> Super Admin
                </a>
              </li>
            }
          </ul>

          <!-- Zone Compte : Connexion et Inscription (Espace admin et portail admin supprimés de la barre publique) -->
          <div class="d-flex align-items-center gap-2 mt-2 mt-lg-0">
            @if (currentUser()) {
              <!-- Utilisateur Connecté : Menu profil -->
              <div class="dropdown shadow-sm">
                <button class="btn btn-outline-light btn-sm dropdown-toggle rounded-2 px-3 py-1 d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
                  @if (avatarUrl) {
                    <img [src]="avatarUrl" (error)="onAvatarError()" alt="" style="width: 28px; height: 28px; object-fit: cover;" class="rounded-circle shadow-sm">
                  } @else {
                    <i class="bi bi-person-circle"></i>
                  }
                  <span class="fw-semibold">{{ currentUser()?.name }}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2" style="border-radius: 10px;">
                  <li class="px-3 py-2 border-bottom">
                    <p class="mb-0 fw-bold small text-dark">{{ currentUser()?.name }}</p>
                    <p class="mb-0 text-muted small" style="font-size: 12px;">{{ currentUser()?.email }}</p>
                    <span class="badge rounded-2 mt-1" [ngClass]="{
                      'bg-primary': currentUser()?.role === 'locataire',
                      'bg-warning text-dark': currentUser()?.role === 'admin',
                      'bg-danger': currentUser()?.role === 'superadmin'
                    }" style="font-size: 12px;">
                      {{ currentUser()?.role}}
                    </span>
                  </li>
                  <!-- @if (currentUser()?.role === 'locataire') {
                    <li><a class="dropdown-item py-2 small" routerLink="/locataire"><i class="bi bi-calendar2-check me-2 text-primary"></i> Mes Réservations</a></li>
                  }
                  @if (currentUser()?.role === 'admin') {
                    <li><a class="dropdown-item py-2 small" routerLink="/admin"><i class="bi bi-speedometer2 me-2 text-warning"></i> Dashboard Gestionnaire</a></li>
                  }
                  @if (currentUser()?.role === 'superadmin') {
                    <li><a class="dropdown-item py-2 small" routerLink="/superadmin"><i class="bi bi-shield-check me-2 text-danger"></i> Administration Plateforme</a></li>
                  } 
                  <li><hr class="dropdown-divider my-1"></li>-->
                  <li>
                    <button class="dropdown-item text-danger py-2 small" (click)="logout()">
                      <i class="bi bi-box-arrow-right me-2"></i> Déconnexion
                    </button>
                  </li>
                </ul>
              </div>
            } @else {
              <!-- Visiteur Non Connecté : Boutons Connexion et Inscription clairs -->
              <a routerLink="/login" [queryParams]="{mode: 'login'}" class="btn btn-outline-light btn-sm rounded-2 px-3 py-1 d-flex align-items-center gap-1">
                <i class="bi bi-box-arrow-in-right"></i>
                <span class="fw-semibold">Connexion</span>
              </a>
              <a routerLink="/login" [queryParams]="{mode: 'register'}" class="btn btn-accent btn-sm rounded-2 px-3 py-1 d-flex align-items-center gap-1 shadow-sm">
                <i class="bi bi-person-plus-fill"></i>
                <span class="fw-semibold">Inscription</span>
              </a>
            }
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .app-navbar {
      background-color: rgba(11, 61, 145, 0.94) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      box-shadow: 0 4px 20px rgba(7, 37, 89, 0.2) !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
      z-index: 1030 !important;
      transition: background-color 0.3s ease, box-shadow 0.3s ease;
    }

    .nav-link-custom {
      border-radius: 8px;
      transition: all 0.2s ease;
      &:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #FFFFFF !important;
      }
    }
  `]
})
export class NavbarComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  currentUser = this.auth.currentUser;

  private lastCheckedUrl: string | null = null;
  private imageFailed = false;

  get avatarUrl(): string | null {
    const raw = this.currentUser()?.avatar_url;
    if (!raw) return null;

    let clean = raw.trim();
    if (!clean.startsWith('http') && !clean.startsWith('data:')) {
      clean = `http://localhost:8000${clean.startsWith('/') ? '' : '/'}${clean}`;
    }

    if (clean !== this.lastCheckedUrl) {
      this.lastCheckedUrl = clean;
      this.imageFailed = false;
    }

    return this.imageFailed ? null : clean;
  }

  onAvatarError(): void {
    this.imageFailed = true;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
