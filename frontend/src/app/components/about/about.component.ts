import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="about-page">
      <!-- =================================================================== -->
      <!-- 1. HERO SECTION AVEC IMAGE D'ARRIÈRE-PLAN LUXE & GRADIENT OVERLAY   -->
      <!-- =================================================================== -->
      <section class="hero-image-section position-relative text-white overflow-hidden">
        <!-- Arrière-plan avec Image Immobilière Moderne Haute Définition -->
        <div class="hero-backdrop-image"></div>
        <div class="hero-backdrop-overlay"></div>

        <div class="container position-relative py-5 py-lg-6" style="z-index: 3;">
          
          <!-- <nav aria-label="breadcrumb" class="mb-4">
            <ol class="breadcrumb mb-0 small breadcrumb-glass d-inline-flex px-3 py-1-5 rounded-2">
              <li class="breadcrumb-item">
                <a routerLink="/" class="text-white-50 text-decoration-none">
                  <i class="bi bi-house me-1"></i>Accueil
                </a>
              </li>
              <li class="breadcrumb-item active text-white fw-semibold" aria-current="page">
                À propos
              </li>
            </ol>
          </nav> -->

          <div class="row align-items-center g-5">
            <!-- COLONNE GAUCHE : CADRE LOGO LUXE FLOTTANT (GLASSMORPHISME) -->
            <div class="col-lg-5 text-center">
              <div class="logo-showcase-container position-relative mx-auto bg-primary p-4 rounded-3 shadow-sm">
                <!-- Badge flottant supérieur -->
                <div class="floating-mini-pill top-pill shadow-sm">
                  <i class="bi bi-patch-check-fill text-teal me-1"></i>
                  <span>Plateforme Certifiée</span>
                </div>

                <!-- Carte centrale du logo -->
                <div class="logo-glass-card p-4 p-md-5 rounded-4 shadow-2xl">
                  <!-- Emblème avec repère Pin stylisé et doubles anneaux animés -->
                  <div class="emblem-container mx-auto mb-3 d-flex align-items-center justify-content-center">
                    <div class="emblem-outer-ring">
                      <div class="emblem-inner-badge shadow-sm">
                        <i class="bi bi-geo-alt-fill text-primary emblem-pin-icon"></i>
                      </div>
                    </div>
                  </div>

                  <!-- Typographie officielle du logo -->
                  <h2 class="h3 fw-bold mb-1 text-dark" style="font-family: 'Poppins', sans-serif;">
                    Logement<span class="text-teal">Plus</span>
                  </h2>
                  <p class="text-muted small mb-3 letter-spacing-1 text-uppercase fw-semibold" style="font-size: 0.75rem;">
                    Plateforme Immobilière
                  </p>

                  <div class="divider-gradient my-3 mx-auto"></div>

                  <!-- Badge sous-logo -->
                  <div class="d-inline-flex align-items-center gap-2 px-3 py-1-5 rounded-2 bg-light border text-muted small" style="font-size: 0.8rem;">
                    <i class="bi bi-shield-check text-teal"></i>
                    <span>Expérience intuitive & moderne</span>
                  </div>
                </div>

                <!-- Badge flottant inférieur -->
                <div class="floating-mini-pill bottom-pill shadow-sm">
                  <i class="bi bi-stars text-warning me-1"></i>
                  <span>100% Digital & Sécurisé</span>
                </div>
              </div>
            </div>

            <!-- COLONNE DROITE : CONTENU TEXTUEL & ACTIONS -->
            <div class="col-lg-7">
              <div class="hero-content ps-lg-3">
                <!-- <span class="badge px-3 py-2 rounded-2 mb-3 hero-tag-glass">
                  <i class="bi bi-building me-1 text-teal"></i> Présentation officielle de la plateforme
                </span> -->

                <h1 class="d-lg-flex d-none display-6 fw-bold text-white mb-0" style="font-family: 'Poppins', sans-serif; text-shadow: 0 3px 12px rgba(0,0,0,0.4);">
                  Bienvenue sur Logement<span style="color: #2DD4BF;">Plus</span>
                </h1>
                <h1 class="d-flex d-lg-none h1 fw-bold text-white mb-0" style="font-family: 'Poppins', sans-serif; text-shadow: 0 3px 12px rgba(0,0,0,0.4);">
                  Bienvenue sur Logement<span style="color: #2DD4BF;">Plus</span>
                </h1>

                <p class="d-lg-flex d-none lead fw-semibold mb-4" style="color: #5EEAD4; font-size: 1.25rem; text-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                  Trouvez votre logement idéal, simplement et en toute sérénité.
                </p>

                <p class="fs-5 d-flex d-lg-none lead fw-semibold mb-5" style="color: #5EEAD4; font-size: 1.25rem; text-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                  Trouvez votre logement idéal, simplement et en toute sérénité.
                </p>

                <div class="description-card-glass p-4 rounded-4 mb-4 text-white text-opacity-90">
                  <p class="mb-3" style="line-height: 1.75; font-size: 1.02rem;">
                    LogementPlus est une plateforme numérique conçue pour faciliter la recherche, la réservation et la gestion de logements. Elle met en relation les personnes à la recherche d'un logement avec les acteurs qui proposent et administrent des biens immobiliers.
                  </p>
                  <p class="mb-0" style="line-height: 1.75; font-size: 1.02rem;">
                    Notre ambition est de simplifier le parcours de réservation grâce à une expérience numérique accessible, intuitive et organisée.
                  </p>
                </div>

                <!-- Boutons d'action modernes avec micro-interactions -->
                <div class="d-flex flex-wrap align-items-center gap-3 pt-2">
                  <a routerLink="/about/details" class="btn btn-accent-hero  btn-md px-4 py-2-5 rounded-3 fw-bold d-inline-flex align-items-center gap-2 shadow-sm">
                    <span>Voir plus</span>
                    <i class="bi bi-arrow-right"></i>
                  </a>
                  <a routerLink="/logements" class="btn btn-glass-hero btn-md px-4 py-2-5 rounded-3 fw-bold d-inline-flex align-items-center gap-2 shadow-lg">
                    <i class="bi bi-search"></i>
                    <span>Découvrir les logements</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. RUBAN D'INDICATEURS DYNAMIQUES INTÉGRÉ AU BAS DU HERO -->
          <!-- <div class="row g-3 mt-4 pt-4 border-top border-white border-opacity-15">
            <div class="col-6 col-md-3">
              <div class="stat-pill-box p-3 rounded-3 text-center">
                <i class="bi bi-laptop fs-4 text-teal mb-1 d-block"></i>
                <div class="fw-bold h6 text-white mb-0">100% En Ligne</div>
                <small class="text-white-50" style="font-size: 11px;">Recherche & Réservation</small>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="stat-pill-box p-3 rounded-3 text-center">
                <i class="bi bi-funnel-fill fs-4 text-teal mb-1 d-block"></i>
                <div class="fw-bold h6 text-white mb-0">Recherche Précise</div>
                <small class="text-white-50" style="font-size: 11px;">Filtres par ville & quartier</small>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="stat-pill-box p-3 rounded-3 text-center">
                <i class="bi bi-clock-history fs-4 text-teal mb-1 d-block"></i>
                <div class="fw-bold h6 text-white mb-0">Suivi Transparent</div>
                <small class="text-white-50" style="font-size: 11px;">Statut en direct</small>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="stat-pill-box p-3 rounded-3 text-center">
                <i class="bi bi-shield-check fs-4 text-teal mb-1 d-block"></i>
                <div class="fw-bold h6 text-white mb-0">Professionnels Agréés</div>
                <small class="text-white-50" style="font-size: 11px;">Gestionnaires certifiés</small>
              </div>
            </div>
          </div> -->
        </div>
      </section>

      <!-- =================================================================== -->
      <!-- 3. SECTION DE PRÉSENTATION RAPIDE (3 CARTES MODERNES DYNAMIQUES)   -->
      <!-- =================================================================== -->
      <section class="py-5 bg-white position-relative">
        <div class="container py-lg-4">
          <div class="text-center max-w-700 mx-auto mb-5">
            <span class="badge px-3 py-1-5 rounded-2 bg-light text-primary border fw-semibold small mb-2 text-uppercase letter-spacing-1">
              Nos Atouts Majeurs
            </span>
            <h2 class="h2 fw-bold text-dark" style="font-family: 'Poppins', sans-serif;">
              Une solution pensée pour chacun de vos besoins
            </h2>
            <p class="text-muted small mb-0">
              Des outils pratiques et transparents pour transformer votre expérience du logement.
            </p>
          </div>

          <div class="row g-4">
            <!-- CARTE 1 : RECHERCHE SIMPLIFIÉE -->
            <div class="col-md-4">
              <div class="feature-card h-100 p-4 rounded-4 border bg-white shadow-sm position-relative">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div class="icon-bubble icon-bubble-teal d-inline-flex align-items-center justify-content-center rounded-3">
                    <i class="bi bi-search fs-4"></i>
                  </div>
                  <span class="badge bg-light text-muted border rounded-2 small px-2 py-1" style="font-size: 11px;">
                    Filtres précis
                  </span>
                </div>
                <h3 class="h5 fw-bold text-dark mb-2" style="font-family: 'Poppins', sans-serif;">
                  Recherche simplifiée
                </h3>
                <p class="text-muted small mb-0" style="line-height: 1.65;">
                  Retrouvez des logements correspondant à vos critères avec précision grâce à nos filtres par ville, quartier, type de bien et budget.
                </p>
                <div class="card-accent-line"></div>
              </div>
            </div>

            <!-- CARTE 2 : RÉSERVATION FACILITÉE -->
            <div class="col-md-4">
              <div class="feature-card h-100 p-4 rounded-4 border bg-white shadow-sm position-relative">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div class="icon-bubble icon-bubble-primary d-inline-flex align-items-center justify-content-center rounded-3">
                    <i class="bi bi-calendar2-check-fill fs-4"></i>
                  </div>
                  <span class="badge bg-light text-muted border rounded-2 small px-2 py-1" style="font-size: 11px;">
                    Demande directe
                  </span>
                </div>
                <h3 class="h5 fw-bold text-dark mb-2" style="font-family: 'Poppins', sans-serif;">
                  Réservation facilitée
                </h3>
                <p class="text-muted small mb-0" style="line-height: 1.65;">
                  Effectuez vos demandes de réservation directement depuis la plateforme et suivez l'avancement de votre dossier en toute clarté.
                </p>
                <div class="card-accent-line"></div>
              </div>
            </div>

            <!-- CARTE 3 : GESTION CENTRALISÉE -->
            <div class="col-md-4">
              <div class="feature-card h-100 p-4 rounded-4 border bg-white shadow-sm position-relative">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div class="icon-bubble icon-bubble-amber d-inline-flex align-items-center justify-content-center rounded-3">
                    <i class="bi bi-buildings-fill fs-4"></i>
                  </div>
                  <span class="badge bg-light text-muted border rounded-2 small px-2 py-1" style="font-size: 11px;">
                    Espace pro
                  </span>
                </div>
                <h3 class="h5 fw-bold text-dark mb-2" style="font-family: 'Poppins', sans-serif;">
                  Gestion centralisée
                </h3>
                <p class="text-muted small mb-0" style="line-height: 1.65;">
                  Les gestionnaires disposent d'un espace dédié pour suivre les logements et les réservations, traiter les dossiers et actualiser les disponibilités.
                </p>
                <div class="card-accent-line"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =================================================================== -->
      <!-- 4. SECTION D'APPEL À L'ACTION (CTA DYNAMIQUE)                      -->
      <!-- =================================================================== -->
      <!-- <section class="py-5 bg-light position-relative">
        <div class="container">
          <div class="cta-banner p-4 p-md-5 rounded-4 text-white text-center position-relative overflow-hidden shadow-xl">
           
            <div class="cta-bg-image"></div>
            <div class="cta-overlay-pattern"></div>

            <div class="position-relative" style="z-index: 2; max-width: 700px; margin: 0 auto;">
              <span class="badge bg-white bg-opacity-20 text-primary border border-white border-opacity-25 px-3 py-1-5 rounded-2 mb-3 small">
                <i class="bi bi-stars me-1 text-warning"></i> Commencez dès aujourd'hui
              </span>
              <h2 class="display-6 fw-bold mb-3 text-white" style="font-family: 'Poppins', sans-serif;">
                Votre prochain logement commence ici.
              </h2>
              <p class="text-white-50 lead fs-6 mb-4">
                Découvrez une nouvelle manière de rechercher et de réserver un logement.
              </p>
              <a routerLink="/logements" class="btn btn-accent-hero btn-lg px-4 py-2-5 rounded-3 fw-semibold shadow-lg d-inline-flex align-items-center gap-2">
                <i class="bi bi-arrow-right-circle-fill"></i>
                <span>Explorer les logements</span>
              </a>
            </div>
          </div>
        </div>
      </section> -->
    </div>
  `,
  styles: [`
    .about-page { background-color: #F8FAFC; }

    /* 1. HERO SECTION */
    .hero-image-section { min-height: 540px; background-color: #072559; }

    .hero-backdrop-image {
      position: absolute; inset: 0;
      background: url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85') center/cover no-repeat;
      z-index: 1;
    }

    .hero-backdrop-overlay {
      position: absolute; inset: 0;
      background: radial-gradient(circle at 15% 25%, rgba(20, 184, 166, 0.2) 0%, transparent 50%),
                  radial-gradient(circle at 85% 75%, rgba(11, 61, 145, 0.25) 0%, transparent 50%),
                  linear-gradient(135deg, rgba(7, 37, 89, 0.55) 0%, rgba(11, 61, 145, 0.42) 50%, rgba(15, 23, 42, 0.60) 100%);
      z-index: 2;
    }

    .breadcrumb-glass {
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .hero-tag-glass {
      background: rgba(20, 184, 166, 0.22);
      color: #5EEAD4;
      border: 1px solid rgba(20, 184, 166, 0.4);
      font-size: 0.82rem;
    }

    .description-card-glass {
      background: rgba(7, 37, 89, 0.45);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.22);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    }

    .logo-showcase-container { max-width: 360px; }

    .logo-glass-card {
      position: relative; z-index: 2;
      background: rgba(255, 255, 255, 0.96);
      border: 1px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 30px 60px -10px rgba(0, 0, 0, 0.45);
      }
    }

    .emblem-outer-ring {
      width: 90px; height: 90px; border-radius: 50%;
      background: linear-gradient(135deg, rgba(11, 61, 145, 0.12) 0%, rgba(20, 184, 166, 0.24) 100%);
      display: flex; align-items: center; justify-content: center;
      border: 2px dashed rgba(20, 184, 166, 0.5);
    }

    .emblem-inner-badge {
      width: 68px; height: 68px; border-radius: 50%;
      background: #FFFFFF;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 15px rgba(11, 61, 145, 0.15);
    }

    .emblem-pin-icon { font-size: 2.2rem; transform: translateY(-2px); }

    .divider-gradient {
      width: 60px; height: 3px;
      background: linear-gradient(90deg, #0B3D91, #14B8A6);
      border-radius: 2px;
    }

    .floating-mini-pill {
      position: absolute; background: #FFFFFF; color: #1F2937;
      padding: 5px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 600;
      border: 1px solid rgba(11, 61, 145, 0.1); z-index: 3; white-space: nowrap;
      &.top-pill { top: 10px; right: 10px; }
      &.bottom-pill { bottom: 10px; left: 10px; }
    }

    .btn-glass-hero {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.4);
      color: #FFFFFF;
      transition: all 0.2s ease;
      &:hover { background: #FFFFFF; color: #072559; transform: translateY(-2px); }
    }

    .btn-accent-hero {
      background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%);
      border: none; color: #FFFFFF; transition: all 0.2s ease;
      &:hover {
        background: linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%);
        color: #FFFFFF; transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(20, 184, 166, 0.4);
      }
    }

    .stat-pill-box {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      &:hover { background: rgba(255, 255, 255, 0.14); }
    }

    /* 2. CARTES DE FONCTIONNALITÉS */
    .feature-card {
      transition: all 0.3s ease;
      border-color: rgba(11, 61, 145, 0.08) !important;
      overflow: hidden;
      &:hover {
        transform: translateY(-6px);
        box-shadow: 0 18px 35px -5px rgba(11, 61, 145, 0.12) !important;
        border-color: #14B8A6 !important;
        .card-accent-line { width: 100%; }
        .icon-bubble { transform: scale(1.08); }
      }
    }

    .icon-bubble {
      width: 50px; height: 50px; transition: transform 0.3s ease;
      &.icon-bubble-teal { background-color: rgba(20, 184, 166, 0.12); color: #14B8A6; }
      &.icon-bubble-primary { background-color: rgba(11, 61, 145, 0.1); color: #0B3D91; }
      &.icon-bubble-amber { background-color: rgba(217, 119, 6, 0.12); color: #D97706; }
    }

    .card-accent-line {
      position: absolute; bottom: 0; left: 0; height: 3px; width: 0;
      background: linear-gradient(90deg, #0B3D91, #14B8A6);
      transition: width 0.35s ease;
    }

    /* 3. BANNIÈRE CTA */
    .cta-banner {
      background: radial-gradient(circle at 20% 30%, rgba(20, 184, 166, 0.3) 0%, transparent 50%),
                  radial-gradient(circle at 80% 70%, rgba(245, 158, 11, 0.2) 0%, transparent 45%),
                  linear-gradient(135deg, #072559 0%, #0B3D91 60%, #0F4C81 100%);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .cta-bg-image {
      position: absolute; inset: 0;
      background: url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80') center/cover;
      opacity: 0.12; pointer-events: none;
    }
  `]
})
export class AboutComponent {}
