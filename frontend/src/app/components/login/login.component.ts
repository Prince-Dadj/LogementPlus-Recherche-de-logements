import { Component, OnInit, inject, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <!-- Page d'authentification avec image immobilière de fond immersive et filtre élégant -->
    <div class="min-vh-100 d-flex align-items-center justify-content-center py-4 px-3 position-relative" 
         style="background: 
                url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80') center/cover no-repeat; background-attachment: fixed;">
      
      <div class="container py-2" style="max-width: 480px;">
        <!-- Logo et retour accueil -->
        <!-- <div class="text-center mb-3">
          <a routerLink="/" class="text-decoration-none d-inline-flex align-items-center gap-2 mb-2">
            <span class="d-inline-flex align-items-center justify-content-center bg-white text-primary rounded-circle shadow" style="width: 36px; height: 36px; color: #0B3D91 !important;">
              <i class="bi bi-geo-alt-fill fs-5"></i>
            </span>
            <span class="fw-bold tracking-tight text-white fs-4" style="font-family: 'Poppins', sans-serif;">
              Logement<span style="color: #14B8A6;">Plus</span>
            </span>
          </a>
          <p class="text-white-50 small mb-0">Portail officiel d'accès et d'inscription</p>
        </div> -->

        <!-- Carte principale d'authentification -->
        <div class="card border-0 shadow-lg rounded-4 overflow-hidden bg-white">
          
          <!-- SÉLECTION DU RÔLE (Locataire vs Gestionnaire) -->
          <div class="p-3 bg-light border-bottom">
            <label class="form-label text-muted small fw-semibold text-uppercase d-block text-center mb-2" style="font-size: 11px; letter-spacing: 0.5px;">
              Choisissez votre profil
            </label>
            <div class="row g-2">
              <div class="col-lg-6 col-md-6">
                <button 
                  type="button" 
                  class="btn w-100 py-2 d-flex flex-column align-items-center justify-content-center rounded-3 transition-all"
                  [ngClass]="selectedRole === 'locataire' ? 'btn-primary shadow-sm' : 'btn-outline-secondary bg-white text-dark border'"
                  (click)="setRole('locataire')">
                  <div class="d-flex align-items-center gap-1 mb-1">
                    <i class="bi bi-person-fill fs-6"></i>
                    <span class="fw-bold small">Locataire</span>
                  </div>
                  <span style="font-size: 10px;" [class.text-white-50]="selectedRole === 'locataire'" [class.text-muted]="selectedRole !== 'locataire'">
                    Recherche & réservation
                  </span>
                </button>
              </div>

              <div class="col-lg-6 col-md-6">
                <button 
                  type="button" 
                  class="btn w-100 py-2 d-flex flex-column align-items-center justify-content-center rounded-3 transition-all"
                  [ngClass]="selectedRole === 'admin' ? 'btn-primary shadow-sm' : 'btn-outline-secondary bg-white text-dark border'"
                  (click)="setRole('admin')">
                  <div class="d-flex align-items-center gap-1 mb-1">
                    <i class="bi bi-buildings-fill fs-6"></i>
                    <span class="fw-bold small">Gestionnaire</span>
                  </div>
                  <span style="font-size: 10px;" [class.text-white-50]="selectedRole === 'admin'" [class.text-muted]="selectedRole !== 'admin'">
                    Propriétaire & bailleur
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- ONGLETS CONNEXION / INSCRIPTION -->
          <div class="d-flex border-bottom text-center">
            <button 
              type="button" 
              class="flex-grow-1 py-2 fw-semibold btn btn-link text-decoration-none border-0 rounded-0 small"
              [ngClass]="authMode === 'login' ? 'text-primary border-bottom border-primary border-2 fw-bold' : 'text-muted'"
              (click)="setAuthMode('login')">
              <i class="bi bi-box-arrow-in-right me-1"></i> Connexion
            </button>
            <button 
              type="button" 
              class="flex-grow-1 py-2 fw-semibold btn btn-link text-decoration-none border-0 rounded-0 small"
              [ngClass]="authMode === 'register' ? 'text-primary border-bottom border-primary border-2 fw-bold' : 'text-muted'"
              (click)="setAuthMode('register')">
              <i class="bi bi-person-plus me-1"></i> Inscription
            </button>
          </div>

          <!-- CORPS DU FORMULAIRE -->
          <div class="card-body p-4">
            @if (redirectUrl) {
              <div class="alert alert-warning d-flex align-items-center gap-2 small py-2 mb-3 rounded-3 border-warning border-opacity-50" role="alert">
                <i class="bi bi-shield-lock-fill text-warning flex-shrink-0 fs-5"></i>
                <div class="small fw-semibold text-dark">
                  Connexion requise : Veuillez vous identifier pour continuer votre réservation ou gérer vos favoris.
                </div>
              </div>
            }

            @if (errorMessage) {
              <div class="alert alert-danger d-flex align-items-center gap-2 small py-2 mb-3 rounded-2" role="alert">
                <i class="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                <div class="small">{{ errorMessage }}</div>
              </div>
            }

            @if (successMessage) {
              <div class="alert alert-success d-flex align-items-center gap-2 small py-2 mb-3 rounded-2" role="alert">
                <i class="bi bi-check-circle-fill flex-shrink-0"></i>
                <div class="small">{{ successMessage }}</div>
              </div>
            }

            <!-- MODE 1 : CONNEXION -->
            @if (authMode === 'login') {
              <form (ngSubmit)="onLogin()">
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-dark">Adresse E-mail</label>
                  <div class="input-group input-group-sm">
                    <span class="input-group-text bg-light border-end-0"><i class="bi bi-envelope text-muted"></i></span>
                    <input 
                      type="email" 
                      class="form-control border-start-0" 
                      [(ngModel)]="email" 
                      name="email" 
                      placeholder="nom@exemple.ci" 
                      required>
                  </div>
                </div>

                <div class="mb-3">
                  <div class="d-flex justify-content-between align-items-center">
                    <label class="form-label small fw-semibold text-dark mb-1">Mot de passe</label>
                    <a href="javascript:void(0)" class="small text-muted text-decoration-none" style="font-size: 11px;">Oublié ?</a>
                  </div>
                  <div class="input-group input-group-sm">
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

                <button 
                  type="submit" 
                  class="btn btn-primary w-100 py-2 rounded-3 fw-semibold mb-3 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                  [disabled]="isLoading">
                  @if (isLoading) {
                    <span class="spinner-border spinner-border-sm"></span>
                    <span>Vérification...</span>
                  } @else {
                    <i class="bi bi-box-arrow-in-right"></i>
                    <span>Se connecter comme {{ selectedRole === 'admin' ? 'Gestionnaire' : 'Locataire' }}</span>
                  }
                </button>
              </form>

              <!-- Démo rapide en 1 clic pour tester facilement -->
              <!-- <div class="p-2 bg-light rounded-3 text-center mb-2">
                <span class="small text-muted d-block mb-1" style="font-size: 11px;">Identifiants de test pré-remplis :</span>
                @if (selectedRole === 'locataire') {
                  <button type="button" class="btn btn-outline-primary btn-sm rounded-pill px-3 py-1" style="font-size: 11px;" (click)="fillTenantDemo()">
                    <i class="bi bi-lightning-charge me-1"></i> Remplir compte Locataire test
                  </button>
                } @else {
                  <button type="button" class="btn btn-outline-warning btn-sm text-dark rounded-pill px-3 py-1" style="font-size: 11px;" (click)="fillManagerDemo()">
                    <i class="bi bi-lightning-charge me-1"></i> Remplir compte Gestionnaire test
                  </button>
                }
              </div> -->
            }

            <!-- MODE 2 : INSCRIPTION -->
            @if (authMode === 'register') {
              <form (ngSubmit)="onRegister()">
                <div class="row g-2 mb-2">
                  <div class="col-6">
                    <label class="form-label small fw-semibold text-dark">Nom *</label>
                    <input type="text" class="form-control form-control-sm" [(ngModel)]="regNom" name="regNom" placeholder="Ex: Kouamé" required>
                  </div>
                  <div class="col-6">
                    <label class="form-label small fw-semibold text-dark">Prénom *</label>
                    <input type="text" class="form-control form-control-sm" [(ngModel)]="regPrenom" name="regPrenom" placeholder="Ex: Patrick" required>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="form-label small fw-semibold text-dark">Adresse E-mail *</label>
                  <input type="email" class="form-control form-control-sm" [(ngModel)]="regEmail" name="regEmail" placeholder="votre.email@domaine.sn" required>
                </div>

                <div class="mb-2">
                  <label class="form-label small fw-semibold text-dark">Numéro de Téléphone (WhatsApp) *</label>
                  <input type="tel" class="form-control form-control-sm" [(ngModel)]="regTelephone" name="regTelephone" placeholder="Ex: +221 77 123 45 67" required>
                </div>

                @if (selectedRole === 'admin') {
                  <div class="mb-2">
                    <label class="form-label small fw-semibold text-dark">Nom de l'Agence ou Raison Sociale</label>
                    <input type="text" class="form-control form-control-sm" [(ngModel)]="regRaisonSociale" name="regRaisonSociale" placeholder="Ex: Teranga Immo Dakar SARL">
                  </div>
                }

                <div class="mb-3">
                  <label class="form-label small fw-semibold text-dark">Mot de passe (min. 6 caractères) *</label>
                  <input type="password" class="form-control form-control-sm" [(ngModel)]="regPassword" name="regPassword" placeholder="••••••••" required>
                </div>

                <button 
                  type="submit" 
                  class="btn btn-accent w-100 py-2 rounded-3 fw-semibold mb-2 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                  [disabled]="isLoading || !regNom || !regPrenom || !regEmail || !regPassword || !regTelephone">
                  @if (isLoading) {
                    <span class="spinner-border spinner-border-sm"></span>
                    <span>Création du compte...</span>
                  } @else {
                    <i class="bi bi-person-check-fill"></i>
                    <span>Créer mon compte {{ selectedRole === 'admin' ? 'Gestionnaire' : 'Locataire' }}</span>
                  }
                </button>
              </form>
            }

            <!-- Liens de bas de page -->
            <div class="d-flex justify-content-between align-items-center pt-3 border-top small" style="font-size: 12px;">
              <a routerLink="/" class="text-muted text-decoration-none">
                <i class="bi bi-arrow-left me-1"></i> Retour à l'accueil
              </a>
              <a routerLink="/contact" class="text-primary text-decoration-none fw-medium">
                <i class="bi bi-headset me-1"></i> Contacter un gestionnaire au Sénégal
              </a>
            </div>
          </div>
        </div>

        <!-- Mentions de sécurité -->
        <div class="text-center mt-3 text-white-50 small" style="font-size: 11px;">
          <i class="bi bi-shield-lock me-1"></i> Données sécurisées conformément aux normes de la CDP (Sénégal)
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit{
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private cdr = inject(ChangeDetectorRef);

  selectedRole: 'locataire' | 'admin' = 'locataire';
  authMode: 'login' | 'register' = 'login';

  // Champs Login
  email = '';
  password = '';
  showPassword = false;

  // Champs Inscription
  regNom = '';
  regPrenom = '';
  regEmail = '';
  regTelephone = '';
  regPassword = '';
  regRaisonSociale = '';

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  redirectUrl = '';

  ngOnInit(): void {
    // Écoute des query params (?mode=register ou ?mode=login ou ?role=admin ou ?redirect=...)
    this.route.queryParams.subscribe(params => {
      if (params['redirect']) {
        this.redirectUrl = params['redirect'];
      }
      if (params['mode'] === 'register') {
        this.authMode = 'register';
      } else if (params['mode'] === 'login') {
        this.authMode = 'login';
      }

      if (params['role'] === 'admin') {
        this.selectedRole = 'admin';
        this.email = 'admin1@example.com';
      }
    });
  }

  setRole(role: 'locataire' | 'admin') {
    this.selectedRole = role;
    this.errorMessage = '';
    this.successMessage = '';
    if (role === 'locataire') {
      this.email = 'locataire@example.com';
    } else {
      this.email = 'admin1@example.com';
    }
  }

  setAuthMode(mode: 'login' | 'register') {
    this.authMode = mode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  fillTenantDemo() {
    this.selectedRole = 'locataire';
    this.email = 'locataire@example.com';
    this.password = 'password123';
  }

  fillManagerDemo() {
    this.selectedRole = 'admin';
    this.email = 'admin1@example.com';
    this.password = 'password123';
  }

  onLogin() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (this.redirectUrl) {
          this.router.navigateByUrl(this.redirectUrl);
        } else if (res.user.role === 'locataire') {
          this.router.navigate(['/locataire']);
        } else if (res.user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (res.user.role === 'superadmin') {
          this.router.navigate(['/superadmin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.errors?.message || 'Identifiants incorrects. Veuillez vérifier vos accès.';
        this.cdr.markForCheck();
      }
      
    });
  }

  onRegister() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      nom: this.regNom,
      prenom: this.regPrenom,
      email: this.regEmail,
      telephone: this.regTelephone,
      password: this.regPassword,
      role: this.selectedRole,
      raison_sociale: this.selectedRole === 'admin' ? this.regRaisonSociale : null
    };

  
    this.auth.register(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = 'Compte créé avec succès ! Connexion en cours...';
        
        setTimeout(() => {
          if (this.redirectUrl) {
            this.router.navigateByUrl(this.redirectUrl);
          } else if (res.user.role === 'locataire') {
            this.router.navigate(['/locataire']);
          } else if (res.user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        }, 900);
        this.cdr.markForCheck()
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || (err.error?.errors ? Object.values(err.error.errors).flat().join(' ') : 'Erreur lors de la création du compte.');
        this.cdr.markForCheck();
      }
    });
  }
}
