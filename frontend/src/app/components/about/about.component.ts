import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { StatsService } from '../../services/stats.service';
import { AgenceService } from '../../services/agence.service';
import { PlateformePublicStats, Agence } from '../../models/models';

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
        <div class="about-hero-backdrop"></div>
        <div class="about-hero-overlay"></div>

        <div class="container position-relative py-5 py-lg-6" style="z-index: 3;">
          <div class="row align-items-center g-5">
            <!-- COLONNE GAUCHE : CADRE LOGO LUXE FLOTTANT -->
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
                        <svg width="34" height="34" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 3L3 13.5L5.5 15.5L16 7L26.5 15.5L29 13.5L16 3Z" fill="#14B8A6"/>
                          <path d="M22 6H25V11.2L22 8.8V6Z" fill="#0D9488"/>
                          <path d="M6 14V27C6 28.1 6.9 29 8 29H24C25.1 29 26 28.1 26 27V14L16 6L6 14Z" fill="#0B3D91"/>
                          <path d="M13 29V20C13 18.34 14.34 17 16 17C17.66 17 19 18.34 19 20V29H13Z" fill="#FFFFFF"/>
                          <circle cx="16" cy="12" r="2.2" fill="#F59E0B"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <!-- Typographie officielle du logo -->
                  <h2 class="h3 fw-bold mb-1 text-dark" style="font-family: 'Poppins', sans-serif;">
                    Sanar<span class="text-teal">Housings</span>
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
                <h1 class="d-lg-flex d-none display-6 fw-bold text-white mb-0" style="font-family: 'Poppins', sans-serif; text-shadow: 0 3px 12px rgba(0,0,0,0.4);">
                  Bienvenue sur Sanar<span style="color: #2DD4BF;">Housings</span>
                </h1>
                <h1 class="d-flex d-lg-none h1 fw-bold text-white mb-0" style="font-family: 'Poppins', sans-serif; text-shadow: 0 3px 12px rgba(0,0,0,0.4);">
                  Bienvenue sur Sanar<span style="color: #2DD4BF;">Housings</span>
                </h1>

                <p class="d-lg-flex d-none lead fw-semibold mb-4" style="color: #5EEAD4; font-size: 1.25rem; text-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                  Trouvez votre logement idéal, simplement et en toute sérénité.
                </p>

                <p class="fs-5 d-flex d-lg-none lead fw-semibold mb-5" style="color: #5EEAD4; font-size: 1.25rem; text-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                  Trouvez votre logement idéal, simplement et en toute sérénité.
                </p>

                <div class="description-card-glass p-4 rounded-4 mb-4 text-white text-opacity-90">
                  <p class="mb-3" style="line-height: 1.75; font-size: 1.02rem;">
                    SanarHousings est une plateforme numérique conçue pour faciliter la recherche, la réservation et la gestion de logements. Elle met en relation les personnes à la recherche d'un logement avec les acteurs qui proposent et administrent des biens immobiliers.
                  </p>
                  <p class="mb-0" style="line-height: 1.75; font-size: 1.02rem;">
                    Notre ambition est de simplifier le parcours de réservation grâce à une expérience numérique accessible, intuitive et organisée.
                  </p>
                </div>

                <!-- Boutons d'action modernes avec micro-interactions -->
                <div class="d-flex flex-wrap align-items-center gap-3 pt-2">
                  <a routerLink="/about/details" class="btn btn-accent-hero btn-md px-4 py-2-5 rounded-3 fw-bold d-inline-flex align-items-center gap-2 shadow-sm">
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
        </div>
      </section>

      <!-- =================================================================== -->
      <!-- 2. SECTION DE PRÉSENTATION RAPIDE (3 CARTES MODERNES)              -->
      <!-- =================================================================== -->
      <section class="py-5 bg-white position-relative">
        <div class="container py-lg-4">
          <div class="text-center max-w-700 mx-auto mb-5">
            <!-- <span class="badge px-3 py-1-5 rounded-2 bg-light text-primary border fw-semibold small mb-2 text-uppercase letter-spacing-1">
              Nos Atouts Majeurs
            </span> -->
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

     
    </div>
  `,
  styles: [`
    .about-page { background-color: #F8FAFC; }
    .text-teal { color: #14B8A6 !important; }

    /* 1. HERO SECTION */
    .hero-image-section { min-height: 540px; background-color: #072559; }
    .description-card-glass {
      background: rgba(7,37,89,0.45); backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.22); box-shadow: 0 10px 30px rgba(0,0,0,0.25);
    }
    .logo-showcase-container { max-width: 360px; }
    .logo-glass-card {
      position: relative; z-index: 2; background: rgba(255,255,255,.96);
      border: 1px solid rgba(255,255,255,.8); box-shadow: 0 25px 50px -12px rgba(0,0,0,.35);
      transition: transform .3s;
      &:hover { transform: translateY(-4px); }
    }
    .emblem-outer-ring {
      width: 90px; height: 90px; border-radius: 50%;
      background: linear-gradient(135deg, rgba(11,61,145,.12), rgba(20,184,166,.24));
      border: 2px dashed rgba(20,184,166,.5);
    }
    .emblem-inner-badge {
      width: 68px; height: 68px; border-radius: 50%; background: #FFF;
      box-shadow: 0 4px 15px rgba(11,61,145,.15);
    }
    .divider-gradient {
      width: 60px; height: 3px; background: linear-gradient(90deg, #0B3D91, #14B8A6); border-radius: 2px;
    }
    .floating-mini-pill {
      position: absolute; background: #FFF; color: #1F2937; padding: 5px 12px;
      border-radius: 50px; font-size: .75rem; font-weight: 600;
      border: 1px solid rgba(11,61,145,.1); z-index: 3; white-space: nowrap;
      &.top-pill { top: 10px; right: 10px; }
      &.bottom-pill { bottom: 10px; left: 10px; }
    }
    .btn-glass-hero {
      background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.4);
      color: #FFF; transition: all .2s;
      &:hover { background: #FFF; color: #072559; transform: translateY(-2px); }
    }
    .btn-accent-hero {
      background: linear-gradient(135deg, #14B8A6, #0D9488); border: none; color: #FFF; transition: all .2s;
      &:hover {
        background: linear-gradient(135deg, #2DD4BF, #14B8A6); color: #FFF;
        transform: translateY(-2px); box-shadow: 0 10px 25px rgba(20,184,166,.4);
      }
    }

    /* 2. CARTES FONCTIONNALITÉS */
    .feature-card {
      transition: transform .3s, box-shadow .3s, border-color .3s;
      border-color: rgba(11,61,145,.08) !important; overflow: hidden;
      &:hover {
        transform: translateY(-5px); box-shadow: 0 16px 32px rgba(11,61,145,.1) !important;
        border-color: #14B8A6 !important;
        .card-accent-line { width: 100%; }
        .icon-bubble { transform: scale(1.08); }
      }
    }
    .icon-bubble {
      width: 50px; height: 50px; transition: transform .3s;
      &.icon-bubble-teal { background: rgba(20,184,166,.12); color: #14B8A6; }
      &.icon-bubble-primary { background: rgba(11,61,145,.1); color: #0B3D91; }
      &.icon-bubble-amber { background: rgba(217,119,6,.12); color: #D97706; }
    }
    .card-accent-line {
      position: absolute; bottom: 0; left: 0; height: 3px; width: 0;
      background: linear-gradient(90deg, #0B3D91, #14B8A6); transition: width .35s;
    }

    /* 3-4. Stats & Agences → styles.scss global */
    /* 5. CTA → about-cta-banner dans styles.scss global */
  `]
})
export class AboutComponent implements OnInit, OnDestroy {
  private statsService = inject(StatsService);
  private agenceService = inject(AgenceService);
  private subs = new Subscription();

  public stats: PlateformePublicStats | null = null;
  public agences: Agence[] = [];

  ngOnInit(): void {
    // Initialisation synchrone immédiate (affiche les chiffres du cache / calculs locaux)
    this.stats = this.statsService.getStatsSync();
    this.agences = this.agenceService.getAgencesSync();

    // Abonnement aux observables pour mise à jour réactive dès réponse de l'API
    this.subs.add(
      this.statsService.stats$.subscribe(s => {
        if (s) {
          this.stats = s;
        }
      })
    );

    this.subs.add(
      this.agenceService.agences$.subscribe(list => {
        if (list && Array.isArray(list)) {
          this.agences = list;
        }
      })
    );

    // Rafraîchissement des données depuis le backend
    this.statsService.refresh();
    this.agenceService.refresh();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
