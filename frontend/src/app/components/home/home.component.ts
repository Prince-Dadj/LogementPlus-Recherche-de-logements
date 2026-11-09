import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LogementService } from '../../services/logement.service';
import { AgenceService } from '../../services/agence.service';
import { TemoignageService } from '../../services/temoignage.service';
import { StatsService } from '../../services/stats.service';
import { AuthService } from '../../services/auth.service';
import { FavoriService } from '../../services/favori.service';
import { ModalAlertService } from '../../services/modal-alert.service';
import { Logement, Agence, Temoignage, PlateformePublicStats, Neighborhood } from '../../models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- 1. HERO BANNER AVEC DÉFILEMENT AUTOMATIQUE DES LOGEMENTS (IMAGES NETTES SANS MASQUE BLEU OPAQUE) -->
    <section class="position-relative text-white py-5 overflow-hidden" style="min-height: 480px; display: flex; align-items: center;">
      <!-- Slider d'arrière-plan avec fondu enchaîné doux et overlay translucide fin -->
      <div class="hero-slider-bg">
        @for (slide of heroSlides; track $index) {
          <div 
            class="slide-image" 
            [class.active]="activeSlide === $index"
            [style.background-image]="'url(' + slide.url + ')'">
          </div>
        }
        <div class="hero-overlay"></div>
      </div>

      <!-- Contenu au premier plan (haute lisibilité, typographie nette) -->
      <div class="container position-relative py-3" style="z-index: 2;">
        <div class="row align-items-center mb-3">
          <div class="col-lg-9 mx-auto text-center">
            <!-- Badges de Confiance Sénégal & LogementPlus -->
            <div class="d-flex align-items-center justify-content-center gap-2 mb-2 flex-wrap">
              <!-- <span class="badge px-3 py-1 rounded-2 fw-medium shadow-sm" style="background-color: rgba(20, 184, 166, 0.45); color: #5EEAD4; border: 1px solid rgba(20, 184, 166, 0.6); font-size: 0.825rem; backdrop-filter: blur(4px);">
                <i class="bi bi-shield-check me-1"></i> Plateforme Immobilière Officielle • Sénégal
              </span>
              <span class="badge bg-dark bg-opacity-60 text-white border border-white border-opacity-25 px-3 py-1 rounded-2 small fw-normal shadow-sm">
                <i class="bi bi-lock-fill text-warning me-1"></i> Garantie Séquestre 24h & Dossier Certifié
              </span> -->
            </div>

            <!-- Titre principal épuré et proportionné -->
            <h1 class="fw-bold text-white mb-2 d-md-flex d-none" style="font-family: 'Poppins', sans-serif; text-shadow: 0 2px 8px rgba(0,0,0,0.5); font-size: 40px;">
              Trouvez et réservez votre logement au Sénégal
            </h1>
            <h1 class="fw-bold text-white mb-2 d-md-none d-flex" style="font-family: 'Poppins', sans-serif; text-shadow: 0 2px 8px rgba(0,0,0,0.5); font-size: 28px;">
              Trouvez et réservez votre logement au Sénégal
            </h1>
            <p class="text-white small mb-0 mx-auto d-md-flex d-none" style="max-width: 650px; font-size: 0.95rem; text-shadow: 0 1px 4px rgba(0,0,0,0.55);">
              Des centaines d'appartements, villas et studios vérifiés à Dakar, Saly et sur la Petite Côte. Visites faciles, baux conformes et paiements en ligne sécurisés.
            </p>
            <p class="text-white small mb-0 mx-auto  d-md-none d-flex" style="max-width: 340px; font-size: 0.95rem; text-shadow: 0 1px 4px rgba(0,0,0,0.55);">
              Des centaines d'appartements, villas et studios vérifiés. Visites faciles, baux conformes et paiements en ligne sécurisés.
            </p>
          </div>
        </div>

        <!-- Barre de recherche compacte et intuitive -->
        <div class="row mb-3">
          <div class="col-lg-10 mx-auto">
            <div class="hero-search-box p-3 rounded-3 shadow-lg bg-white text-dark">
              <div class="row g-2 align-items-end">
                <div class="col-md-4">
                  <label class="form-label text-secondary small mb-1 fw-semibold">
                    <i class="bi bi-geo-alt-fill text-danger me-1"></i> Ville ou Quartier au Sénégal
                  </label>
                  <div class="input-group input-group-md">
                    <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
                    <input 
                      type="text" 
                      class="form-control border-start-0" 
                      placeholder="Ex: Almadies, Plateau, Fann, Saly..." 
                      [(ngModel)]="searchCity" 
                      (input)="filterLocally()">
                  </div>
                </div>

                <div class="col-md-3">
                  <label class="form-label text-secondary small mb-1 fw-semibold">
                    <i class="bi bi-house-door text-primary me-1"></i> Type de bien
                  </label>
                  <select class="form-select form-select-sm" [(ngModel)]="searchType" (change)="filterLocally()">
                    <option value="tous">Tous les types</option>
                    <option value="appartement">Appartement</option>
                    <option value="studio">Studio</option>
                    <option value="maison">Maison / Villa</option>
                    <option value="chambre">Chambre</option>
                  </select>
                </div>

                <div class="col-md-3">
                  <label class="form-label text-secondary small mb-1 fw-semibold">
                    <i class="bi bi-wallet2 text-primary me-1"></i> Budget Max (FCFA / mois)
                  </label>
                  <input 
                    type="number" 
                    class="form-control form-control-sm" 
                    placeholder="Ex: 500 000" 
                    [(ngModel)]="searchBudget" 
                    (input)="filterLocally()"
                    step="50000">
                </div>

                <div class="col-md-2">
                  <button type="button" class="btn btn-accent btn-sm w-100 py-2 d-flex align-items-center justify-content-center gap-1 shadow-sm" (click)="scrollToCatalogue()">
                    <i class="bi bi-search"></i>
                    <span>Rechercher</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Indicateurs du diaporama d'arrière-plan (légende du bien mis en avant + pastilles) -->
        <div class="p-1 row align-items-center justify-content-center text-center">
          <div class="col-auto d-flex align-items-center gap-2 px-3 py-1 rounded-2 shadow-sm" style="background: rgba(0, 0, 0, 0.55); backdrop-filter: blur(5px);">
            <i class="bi bi-camera-fill text-warning small"></i>
            <span class="d-lg-flex d-none small text-white fw-medium" style="font-size: 12px;">{{ heroSlides[activeSlide]?.title || 'Résidence de prestige au Sénégal' }}</span>
            <span class="d-lg-flex d-none badge bg-warning text-dark small" style="font-size: 11px;">{{ heroSlides[activeSlide]?.price || 'Disponible' }}</span>
            <span class="d-flex d-lg-none small text-white fw-medium" style="font-size: 10px;">{{ heroSlides[activeSlide]?.title || 'Résidence de prestige au Sénégal' }}</span>
            <span class="d-flex d-lg-none badge bg-warning text-dark small" style="font-size: 9px;">{{ heroSlides[activeSlide]?.price || 'Disponible' }}</span>

            <!-- Pastilles de navigation du slider -->
            <div class="d-flex align-items-center gap-1 ms-2">
              @for (slide of heroSlides; track $index) {
                <button 
                  type="button" 
                  class="border-0 rounded-2 p-0" 
                  [style.width]="$index === activeSlide ? '18px' : '6px'" 
                  style="height: 6px; transition: all 0.3s ease; cursor: pointer;"
                  [style.background-color]="$index === activeSlide ? '#F59E0B' : 'rgba(255,255,255,0.6)'"
                  (click)="setSlide($index)"
                  [title]="slide.title">
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. BANDEAU DE RÉASSURANCE SÉNÉGAL (Wave, Orange Money, Baux conformes) -->
    <section class="py-3 bg-white border-bottom shadow-sm mt-1">
      <div class="container">
        <div class="row g-3 text-center align-items-center">
          <div class="col-6 col-md-3">
            <div class="d-flex align-items-center justify-content-center gap-2">
              <i class="bi bi-stopwatch text-primary fs-3"></i>
              <div class="text-start">
                <h4 class="mb-0 fw-bold tabular-numbers text-primary">&lt; 5 minutes</h4>
                <small class="text-muted" style="font-size: 11px;">Réservation rapide & directe</small>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="d-flex align-items-center justify-content-center gap-2">
              <i class="bi bi-shield-check text-success fs-3"></i>
              <div class="text-start">
                <h4 class="mb-0 fw-bold tabular-numbers text-success">&gt; 98 %</h4>
                <small class="text-muted" style="font-size: 11px;">Paiements sécurisés</small>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="d-flex align-items-center justify-content-center gap-2">
              <i class="bi bi-phone text-secondary fs-3" style="color: #14B8A6 !important;"></i>
              <div class="text-start">
                <h4 class="mb-0 fw-bold " style="color: #0F766E;">Wave & Orange Money</h4>
                <small class="text-muted" style="font-size: 11px;">Sénégal • Free Money & Cartes</small>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="d-flex align-items-center justify-content-center gap-2">
              <i class="bi bi-file-earmark-pdf text-warning fs-3"></i>
              <div class="text-start">
                <h4 class="mb-0 fw-bold text-dark">Baux & Reçus PDF</h4>
                <small class="text-muted" style="font-size: 11px;">Génération 100% conforme</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. FONCTIONNALITÉ MODERNE 1 : EXPLORER PAR QUARTIER À DAKAR & AU SÉNÉGAL (CARTES INTERACTIVES) -->
    <section class="py-5 bg-white border-bottom">
      <div class="container">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
          <div>
            <span class="h3 text-primary fw-bold ">
              <i class="bi bi-compass text-primary me-2"></i> Emplacements Privilégiés
            </span>
            <!-- <h2 class="h5 fw-bold mb-1 mt-2 text-dark">
              <i class="bi bi-compass text-primary me-2"></i>Explorez par Quartier à Dakar & en Régions
            </h2> -->
            <p class="text-muted small mb-0">Sélectionnez votre zone de prédilection pour afficher instantanément les biens disponibles</p>
          </div>
          <a routerLink="/logements" class="btn btn-outline-primary btn-sm rounded-2 px-3">
            <i class="bi bi-map me-1"></i> Carte Interactive
          </a>
        </div>

        <div class="row g-3">
          @for (zone of neighborhoods.slice(0, 6); track zone.name) {
            <div class="col-6 col-md-4 col-lg-2">
              <div class="neighborhood-card" (click)="filterByNeighborhood(zone.name)">
                <img [src]="zone.image" [alt]="zone.name" loading="lazy">
                <div class="neighborhood-overlay">
                  <span class="badge bg-warning text-dark small align-self-start mb-1" style="font-size: 10px;">{{ zone.tag }}</span>
                  <h3 class="h6 fw-bold text-white mb-0 text-truncate" style="font-size: 0.9rem;">{{ zone.name }}</h3>
                  <small class="text-white-50" style="font-size: 11px;">
                    @if (zone.count > 1) {
                      {{ zone.count }} logements
                    } @else if (zone.count === 1) {
                      1 logement
                    } @else {
                      Disponible bientôt
                    }
                  </small>
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-12">
              <div class="text-center py-4 bg-light rounded-4 border border-dashed">
                <i class="bi bi-geo-alt fs-3 text-muted d-block mb-2"></i>
                <h6 class="fw-bold text-dark mb-1">Aucune zone répertoriée pour le moment</h6>
                <p class="text-muted small mb-0">De nouveaux quartiers à Dakar et sur la Petite Côte seront bientôt ajoutés.</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- 4. SECTION PRINCIPALE : LOGEMENTS DISPONIBLES AFFICHÉS DÈS LA VISITE (CATALOGUE IMMÉDIAT) -->
    <section id="catalogueSection" class="py-4 mt-5" style="background-color: #F8FAFC;">
      <div class="container">
        <!-- En-tête de section avec filtres rapides par catégorie -->
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
          <div>
            <h2 class="h3 fw-bold mb-0 text-dark">
              <i class="bi bi-houses text-primary me-2"></i>Nos Logements Vérifiés au Sénégal
            </h2>
            <p class="text-muted small mb-0">Consultez, contactez sur WhatsApp ou réservez instantanément</p>
          </div>

          <!-- Filtres par catégorie en 1 clic -->
          <div class="d-flex align-items-center gap-1 flex-wrap">
            <button 
              type="button" 
              class="btn btn-sm rounded-2 px-3 py-1 fw-medium"
              [class.btn-primary]="selectedCategory === 'tous'"
              [class.btn-light]="selectedCategory !== 'tous'"
              [class.border]="selectedCategory !== 'tous'"
              (click)="selectCategory('tous')">
              Tous ({{ allLogements.length}})
            </button>
            <button 
              type="button" 
              class="btn btn-sm rounded-2 px-3 py-1 fw-medium"
              [class.btn-primary]="selectedCategory === 'appartement'"
              [class.btn-light]="selectedCategory !== 'appartement'"
              [class.border]="selectedCategory !== 'appartement'"
              (click)="selectCategory('appartement')">
              <i class="bi bi-building me-1"></i> Appartements
            </button>
            <button 
              type="button" 
              class="btn btn-sm rounded-2 px-3 py-1 fw-medium"
              [class.btn-primary]="selectedCategory === 'studio'"
              [class.btn-light]="selectedCategory !== 'studio'"
              [class.border]="selectedCategory !== 'studio'"
              (click)="selectCategory('studio')">
              <i class="bi bi-door-open me-1"></i> Studios
            </button>
            <button 
              type="button" 
              class="btn btn-sm rounded-2 px-3 py-1 fw-medium"
              [class.btn-primary]="selectedCategory === 'maison'"
              [class.btn-light]="selectedCategory !== 'maison'"
              [class.border]="selectedCategory !== 'maison'"
              (click)="selectCategory('maison')">
              <i class="bi bi-house-door me-1"></i> Villas
            </button>
            <button 
              type="button" 
              class="btn btn-sm rounded-2 px-3 py-1 fw-medium"
              [class.btn-primary]="selectedCategory === 'chambre'"
              [class.btn-light]="selectedCategory !== 'chambre'"
              [class.border]="selectedCategory !== 'chambre'"
              (click)="selectCategory('chambre')">
              <i class="bi bi-key me-1"></i> Chambres
            </button>
          </div>
        </div>

        <!-- Grille des Logements (Cartes 16:9 compactes, badges statut, prix en gras, bouton WhatsApp direct) -->
        <div class="row g-3">
          @for (logement of displayedLogements.slice(0, 6); track logement.id) {
            <div class="col-md-6 col-lg-4">
              <div class="card housing-card h-100 border-0">
                <!-- Image 16:9 avec badge de type et favori -->
                <div class="card-img-wrapper position-relative">
                  <img [src]="logement.image_principale" [alt]="logement.titre" loading="eager">
                  <span class="badge-type text-uppercase">{{ logement.type }}</span>
                  <button class="fav-btn" (click)="toggleFav(logement)">
                    <i class="bi" [class.bi-heart-fill]="isFav(logement.id)" [class.bi-heart]="!isFav(logement.id)"></i>
                  </button>
                  @if (logement.est_occupe || logement.statut === 'occupe') {
                    <span class="position-absolute bottom-0 end-0 m-2 badge bg-danger text-white small shadow-sm fw-bold" style="font-size: 11px; z-index: 2;">
                      <i class="bi bi-lock-fill me-1"></i> Logement Occupé
                    </span>
                  }
                  @if (logement.mode_reservation === 'immediate') {
                    <span class="position-absolute bottom-0 start-0 m-2 badge bg-success bg-opacity-90 text-white small" style="font-size: 11px;">
                      <i class="bi bi-lightning-fill me-1"></i> Immédiat • Séquestre 24h
                    </span>
                  } @else {
                    <span class="position-absolute bottom-0 start-0 m-2 badge bg-dark bg-opacity-75 text-white small" style="font-size: 11px;">
                      <i class="bi bi-shield-lock me-1"></i> Séquestre 24h
                    </span>
                  }
                </div>

                <div class="card-body p-3 d-flex flex-column">
                  <!-- Ville & Quartier au Sénégal -->
                  <div class="d-flex align-items-center justify-content-between text-muted small mb-1" style="font-size: 12px;">
                    <span><i class="bi bi-geo-alt-fill me-1 text-danger"></i>{{ logement.quartier }}, {{ logement.ville }}</span>
                    <span class="text-warning fw-semibold"><i class="bi bi-star-fill me-1"></i>{{ logement.note_moyenne }}</span>
                  </div>

                  <!-- Titre cliquable -->
                  <h3 class="card-title h6 fw-bold mb-2 text-truncate" [title]="logement.titre">
                    @if (logement.est_occupe || logement.statut === 'occupe') {
                      <span class="text-muted">{{ logement.titre }}</span>
                    } @else {
                      <a [routerLink]="['/logements', logement.id]" class="text-decoration-none text-dark">
                        {{ logement.titre }}
                      </a>
                    }
                  </h3>

                  <!-- Équipements clés indispensables au Sénégal -->
                  <div class="d-flex align-items-center gap-1 mb-3 text-secondary">
                    <span class="badge bg-light text-dark border px-2 py-1" style="font-size: 10px;">
                      <i class="bi bi-door-open me-1"></i>{{ logement.nb_pieces }} pièce(s)
                    </span>
                    <span class="badge bg-light text-dark border px-2 py-1" style="font-size: 10px;">
                      <i class="bi bi-aspect-ratio me-1"></i>{{ logement.surface }} m²
                    </span>
                    @if (logement.meuble) {
                      <span class="badge bg-light text-dark border px-2 py-1" style="font-size: 10px;">
                        <i class="bi bi-lamp me-1"></i>Meublé
                      </span>
                    }
                  </div>

                  <!-- Prix et boutons d'action (Détails + WhatsApp direct) -->
                  <div class="mt-auto pt-2 border-top d-flex align-items-center justify-content-between gap-1">
                    <div>
                      <span class="fw-bold fs-6 text-primary tabular-numbers">
                        {{ logement.prix_par_mois }}
                      </span>
                      <span class="text-muted small" style="font-size: 11px;"> CFA / mois</span>
                    </div>

                    <div class="d-flex align-items-center gap-1">
                      @if (logement.est_occupe || logement.statut === 'occupe') {
                        <button class="btn btn-secondary btn-sm px-3 rounded-2 disabled" disabled style="font-size: 12px;" title="Ce logement est actuellement occupé">
                          <i class="bi bi-lock-fill me-1"></i> Occupé
                        </button>
                      } @else {
                        <a 
                          [href]="getCardWhatsApp(logement)" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          class="btn btn-whatsapp btn-sm px-2 py-1 rounded-2" 
                          style="font-size: 11px;"
                          title="Discuter sur WhatsApp pour ce bien">
                          <i class="bi bi-whatsapp"></i>
                        </a>
                        <a [routerLink]="['/logements', logement.id]" class="btn btn-primary btn-sm px-3 rounded-2" style="font-size: 12px;">
                          Détails <i class="bi bi-arrow-right ms-1"></i>
                        </a>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-12 text-center py-5">
              <i class="bi bi-search text-muted fs-1 mb-2 d-block"></i>
              <h3 class="h6 fw-bold">Aucun logement ne correspond aux critères saisis au Sénégal</h3>
              <p class="text-muted small">Réinitialisez les filtres pour revoir tous les logements disponibles.</p>
              <button class="btn btn-outline-primary btn-sm rounded-2" (click)="resetLocalFilters()">
                Afficher tous les logements
              </button>
            </div>
          }
        </div>

        <div class="text-center mt-4">
          <a routerLink="/logements" class="btn btn-outline-primary btn-sm px-4 py-2 rounded-2 fw-semibold shadow-sm">
            <i class="bi bi-map me-2"></i> Explorer l'ensemble du catalogue du Sénégal sur la carte interactive
          </a>
        </div>
      </div>
    </section>

    <!-- 5. FONCTIONNALITÉ MODERNE 2 : SIMULATEUR DE BUDGET & CAUTION INTERACTIF (LOI SÉNÉGALAISE SUR LES BAUX) -->
    <section class="py-5 bg-white border-top border-bottom mt-5">
      <div class="container">
        <div class="row align-items-center g-4">
          <div class="col-lg-5">
            <span class="h3 text-success fw-bold ">Outil d'estimation transparent</span>
            <h2 class="h5 fw-bold mt-2 mb-2 text-dark">Simulez votre budget de location au Sénégal</h2>
            <p class="text-muted small mb-3">
              En vertu de la législation sénégalaise, la caution est légalement plafonnée à <strong>2 mois de loyer</strong>. Utilisez notre simulateur interactif pour estimer le budget total nécessaire avant d'emménager.
            </p>

            <div class="bg-light p-3 rounded-3 border-start border-primary border-4 mb-3">
              <div class="d-flex align-items-center gap-2 mb-1">
                <i class="bi bi-info-circle-fill text-primary"></i>
                <strong class="small text-dark">Plafonnement officiel de la caution</strong>
              </div>
              <small class="text-muted" style="font-size: 11px;">
                LogementPlus interdit strictement les demandes abusives de 3 mois de caution et protège vos finances.
              </small>
            </div>
          </div>

          <div class="col-lg-7">
            <div class="calculator-card p-4">
              <!-- Curseur interactif de Loyer -->
              <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <label class="form-label fw-bold small text-dark mb-0">Loyer mensuel envisagé :</label>
                  <span class="badge bg-primary fs-6 px-3 py-1 rounded-2 tabular-numbers">{{ simLoyer | number }} FCFA / mois</span>
                </div>
                <input 
                  type="range" 
                  class="form-range" 
                  min="100000" 
                  max="1500000" 
                  step="25000" 
                  [(ngModel)]="simLoyer" 
                  (input)="onSimChange()">
                <div class="d-flex justify-content-between text-muted small" style="font-size: 11px;">
                  <span>100 000 FCFA</span>
                  <span>750 000 FCFA</span>
                  <span>1 500 000 FCFA</span>
                </div>
              </div>

              <!-- Décomposition en direct -->
              <div class="row g-2 mb-3 text-center">
                <div class="col-md-4 col-12">
                  <div class="p-2 rounded-3 bg-light border">
                    <small class="text-muted d-block" style="font-size: 11px;">1er Mois de loyer</small>
                    <strong class="text-dark small tabular-numbers">{{ simLoyer | number }} FCFA</strong>
                  </div>
                </div>
                <div class="col-md-4 col-12">
                  <div class="p-2 rounded-3 bg-light border">
                    <small class="text-muted d-block" style="font-size: 11px;">Caution légale (max 2 mois)</small>
                    <strong class="text-dark small tabular-numbers">{{ simCaution | number }} FCFA</strong>
                  </div>
                </div>
                <div class="col-md-4 col-12">
                  <div class="p-2 rounded-3 bg-light border">
                    <small class="text-muted d-block" style="font-size: 11px;">Frais plateforme (5%)</small>
                    <strong class="text-dark small tabular-numbers">{{ simFrais | number }} FCFA</strong>
                  </div>
                </div>
              </div>

              <!-- Total pour emménager -->
              <div class="p-3 rounded-3 d-lg-flex d-none align-items-center justify-content-between mb-3" style="background: rgba(11, 61, 145, 0.06); border: 1.5px dashed #0B3D91;">
                <div>
                  <small class="text-secondary d-block fw-semibold" style="font-size: 11px;">Total estimé à l'entrée :</small>
                  <span class="fs-5 fw-bold text-primary tabular-numbers">{{ simTotal | number }} FCFA</span>
                </div>
                <button type="button" class="btn btn-primary btn-sm rounded-2 px-3 py-2 fw-semibold" (click)="applySimBudget()">
                  <i class="bi bi-funnel me-1"></i> Filtrer les biens ({{ simMatchingCount }})
                </button>
              </div>
                             
              <div class="p-3 rounded-3 d-block d-lg-none mb-3" style="background: rgba(11, 61, 145, 0.06); border: 1.5px dashed #0B3D91;">
                <div>
                  <small class="text-secondary d-block fw-semibold" style="font-size: 11px;">Total estimé à l'entrée :</small>
                  <span class="fs-5 fw-bold text-primary tabular-numbers">{{ simTotal | number }} FCFA</span>
                </div>
                <button type="button" class="btn btn-primary btn-sm rounded-2 px-3 py-2 fw-semibold mt-2 w-100" (click)="applySimBudget()">
                  <i class="bi bi-funnel me-1"></i> Filtrer les biens ({{ simMatchingCount }})
                </button>
              </div> 
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. FONCTIONNALITÉ MODERNE 3 : POURQUOI CHOISIR LOGEMENTPLUS SÉNÉGAL ? (4 PILIERS DE SÉCURITÉ) -->
    <section class="py-5 bg-white">
      <div class="container">
        <div class="text-center mb-4">
          <span class="h3 text-primary fw-bold ">Nos Engagements</span>
          <!-- <h2 class="h5 fw-bold mt-1 mb-1">Pourquoi choisir LogementPlus au Sénégal ?</h2>
          <p class="text-muted small mb-0">La sérénité d'un cadre réglementé et certifié pour vos baux</p> -->
          <p class="text-muted small mb-0">Pourquoi choisir LogementPlus au Sénégal ?</p>
        </div>

        <div class="row g-3">
          <div class="col-md-6 col-lg-3">
            <div class="benefit-card h-100">
              <div class="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle mb-3" style="width: 48px; height: 48px;">
                <i class="bi bi-file-earmark-lock-fill fs-5"></i>
              </div>
              <h3 class="h6 fw-bold mb-2">Baux 100% Conformes</h3>
              <p class="text-muted small mb-0">Contrats dématérialisés conformes au Code des Obligations Civiles et Commerciales du Sénégal.</p>
            </div>
          </div>

          <div class="col-md-6 col-lg-3">
            <div class="benefit-card h-100">
              <div class="d-inline-flex align-items-center justify-content-center text-white rounded-circle mb-3" style="width: 48px; height: 48px; background-color: #14B8A6;">
                <i class="bi bi-lightning-charge-fill fs-5"></i>
              </div>
              <h3 class="h6 fw-bold mb-2">Audit Anti-Coupure</h3>
              <p class="text-muted small mb-0">Vérification physique des groupes électrogènes (Senelec) et réserves d'eau (Sen'Eau) avant publication.</p>
            </div>
          </div>

          <div class="col-md-6 col-lg-3">
            <div class="benefit-card h-100">
              <div class="d-inline-flex align-items-center justify-content-center text-white rounded-circle mb-3" style="width: 48px; height: 48px; background-color: #F59E0B;">
                <i class="bi bi-phone-fill fs-5"></i>
              </div>
              <h3 class="h6 fw-bold mb-2">Wave & Orange Money</h3>
              <p class="text-muted small mb-0">Transactions instantanées sans frais cachés, reçus officiels horodatés et traçabilité bancaire.</p>
            </div>
          </div>

          <div class="col-md-6 col-lg-3">
            <div class="benefit-card h-100">
              <div class="d-inline-flex align-items-center justify-content-center text-white rounded-circle mb-3" style="width: 48px; height: 48px; background-color: #16A34A;">
                <i class="bi bi-person-check-fill fs-5"></i>
              </div>
              <h3 class="h6 fw-bold mb-2">Gestionnaires Agréés</h3>
              <p class="text-muted small mb-0">Une équipe de professionnels locaux basés à Dakar et Saly, disponibles 7j/7 pour visites et remises des clés.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  

    <!-- SECTION LOGEMENTPLUS EN CHIFFRES — STATISTIQUES INDÉPENDANTES ANIMÉES -->
    <section class="py-5 mt-5" id="statsPlateformeSection" style="background: linear-gradient(135deg, #0B3D91 0%, #0d2557 100%); border-top: 4px solid #14B8A6; border-bottom: 4px solid #14B8A6;">
      <div class="container">
        <div class="text-start mb-4">
          <h2 class="h3 fw-bold text-white mb-1"> <span style="font-size: 30px;" class="text-secondary me-2">LogementPlus</span> en chiffres</h2>
          <p class="text-white-50 small mb-0">Des données réelles, calculées dynamiquement depuis notre base de données</p>
        </div>
        <div class="row g-4">
          <!-- Carte 1 : Logements publiés -->
          <div class="col-6 col-md-3">
            <div class="ugb-stat-card">
              <div class="ugb-stat-left">
                <div class="ugb-stat-icon mb-3" style="color: #F59E0B;">
                  <i class="bi bi-houses-fill"></i>
                </div>
                <div class="ugb-stat-label">Logements</div>
              </div>
              <div class="ugb-stat-value tabular-numbers fs-1" style="color: #F59E0B;">
                {{ animatedLogements }}
              </div>
            </div>
          </div>

          <!-- Carte 2 : Agences partenaires -->
          <div class="col-6 col-md-3">
            <div class="ugb-stat-card">
              <div class="ugb-stat-left">
                <div class="ugb-stat-icon mb-3" style="color: #14B8A6;">
                  <i class="bi bi-buildings-fill"></i>
                </div>
                <div class="ugb-stat-label">Agences</div>
              </div>
              <div class="ugb-stat-value tabular-numbers fs-1" style="color: #14B8A6;">
                {{ animatedAgences }}
              </div>
            </div>
          </div>

          <!-- Carte 3 : Annonces disponibles -->
          <div class="col-6 col-md-3">
            <div class="ugb-stat-card">
              <div class="ugb-stat-left">
                <div class="ugb-stat-icon mb-3" style="color: #38BDF8;">
                  <i class="bi bi-patch-check-fill"></i>
                </div>
                <div class="ugb-stat-label">Disponibles</div>
              </div>
              <div class="ugb-stat-value tabular-numbers fs-1" style="color: #38BDF8;">
                {{ animatedDisponibles }}
              </div>
            </div>
          </div>

          <!-- Carte 4 : Locations réalisées -->
          <div class="col-6 col-md-3 mb-3">
            <div class="ugb-stat-card">
              <div class="ugb-stat-left">
                <div class="ugb-stat-icon mb-3" style="color: #34D399;">
                  <i class="bi bi-key-fill"></i>
                </div>
                <div class="ugb-stat-label">Locations</div>
              </div>
              <div class="ugb-stat-value tabular-numbers fs-1" style="color: #34D399;">
                {{ animatedLocations }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION AGENCES PARTENAIRES — DYNAMIQUE + MARQUEE + EMPTY STATE -->
    <!-- <section class="py-5 overflow-hidden" style="background: linear-gradient(135deg, #0B3D91 0%, #0d2557 100%);  border-bottom: 4px solid #14B8A6;">
      <div class="container mb-4">
        <div class="row align-items-center">
          <div class="col-lg-8">
             <span class="badge bg-white bg-opacity-10 text-white border border-white border-opacity-25 px-3 py-1 small fw-semibold mb-2">
              <i class="bi bi-building-check me-1"></i> Réseau Certifié Sénégal
            </span> 
            <h2 class="h3 fw-bold text-white mb-1">Les agences immobilières qui nous font confiance</h2>
            <p class="text-white-50 small mb-0">Des professionnels agréés collaborent avec LogementPlus pour vous proposer des biens audités et conformes aux baux sénégalais.</p>
          </div>
          <div class="col-lg-4 text-lg-end mt-3 mt-lg-0">
            <a href="mailto:ndiayethierno194@gmail.com"
               class="btn btn-partner-cta px-4 py-2 fw-bold rounded-2 shadow-lg">
              <i class="bi bi-handshake me-2"></i>Travailler avec nous
              <i class="bi bi-arrow-right ms-2"></i>
            </a>
          </div>
        </div>
      </div>

      @if (agencesLoading) {
        <div class="container text-center py-5">
          <div class="spinner-border text-light" role="status" style="width: 2.5rem; height: 2.5rem;">
            <span class="visually-hidden">Chargement...</span>
          </div>
          <p class="text-white-50 mt-3 small">Chargement des agences partenaires...</p>
        </div>
      } @else if (agencesError) {
        <div class="container my-3">
          <div class="alert alert-light d-flex align-items-center justify-content-between p-3 rounded-4 shadow-sm border-0">
            <div class="d-flex align-items-center gap-2 text-danger">
              <i class="bi bi-exclamation-triangle-fill fs-5"></i>
              <span>{{ agencesError }}</span>
            </div>
            <button class="btn btn-outline-danger btn-sm rounded-pill px-3" (click)="retryAgences()">
              <i class="bi bi-arrow-clockwise me-1"></i> Réessayer
            </button>
          </div>
        </div>
      } @else if (agences && agences.length > 0) {
       
        <div class="agencies-marquee-outer">
          <div class="agencies-marquee">
            @for (a of agences; track a.id) {
              <div class="agency-logo-card p-3">
                <div class="agency-icon-wrap me-2">
                  @if (a.logo_url) {
                    <img [src]="a.logo_url" [alt]="a.nom" class="rounded-2 object-fit-cover" style="width: 36px; height: 36px;">
                  } @else {
                    <i class="bi {{ a.icone || 'bi-buildings' }} display-5" style="color: #14B8A6;"></i>
                  }
                </div>
                <div>
                  <div class="agency-name fs-5">{{ a.nom }}</div>
                  <div class="agency-city fs-6">{{ a.ville }}</div>
                </div>
              </div>
            }
            
            @for (a of agences; track a.id + '_dup') {
              <div class="agency-logo-card p-3">
                <div class="agency-icon-wrap">
                  @if (a.logo_url) {
                    <img [src]="a.logo_url" [alt]="a.nom" class="rounded-2 object-fit-cover" style="width: 36px; height: 36px;">
                  } @else {
                    <i class="bi {{ a.icone || 'bi-buildings' }} display-5" style="color: #14B8A6;"></i>
                  }
                </div>
                <div>
                  <div class="agency-name fs-4">{{ a.nom }}</div>
                  <div class="agency-city fs-5">{{ a.ville }}</div>
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
        
        <div class="container my-2">
          <div class="p-4 p-md-5 rounded-4 text-center"
               style="background: rgba(255, 255, 255, 0.05); border: 2px dashed rgba(255, 255, 255, 0.2); backdrop-filter: blur(8px);">
            <div class="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 mx-auto"
                 style="width: 64px; height: 64px; background: rgba(20, 184, 166, 0.15); color: #14B8A6;">
              <i class="bi bi-buildings-fill fs-2"></i>
            </div>
            <h3 class="h5 fw-bold text-white mb-2">Programme Partenaires Agences en cours de labellisation</h3>
            <p class="text-white-50 small mx-auto mb-4" style="max-width: 540px; line-height: 1.6;">
              Aucune agence immobilière n'est répertoriée publiquement pour le moment. Vous dirigez un cabinet de gestion ou une agence immobilière à Dakar, Saly ou sur la Petite Côte ? Rejoignez les agences pionnières de la plateforme.
            </p>
            <a href="mailto:partenaireslogementplus@gmail.com?subject=Candidature%20Agence%20Partenaire%20LogementPlus"
               class="btn btn-partner-cta px-4 py-2 fw-bold rounded-pill shadow-lg">
              <i class="bi bi-briefcase-fill me-2"></i>Devenir notre première agence partenaire
            </a>
          </div>
        </div>
      }
    </section> -->

    <!-- 7. TÉMOIGNAGES CLIENTS & PARTENAIRES — DYNAMIQUE + SLIDER + EMPTY STATE -->
    <section class="py-5 position-relative mt-5" style="background-color: #F8FAFC;">
      <div class="container">
        <div class="d-flex text-center mb-4">
          <div class="flex-grow-1">
            <!-- <span class="badge bg-warning bg-opacity-20 text-warning px-3 py-1 rounded-2 small fw-bold ">
              <i class="bi bi-patch-check-fill me-1"></i> Retours d'expérience
            </span> -->
            <h2 class="h3 fw-bold text-warning mt-2 mb-1 ">Avis Authentiques</h2>
            <p class="text-muted small mb-0">Partagés en direct par nos locataires, propriétaires et agences partenaires au Sénégal.</p>
          </div>
          <!-- <div>
            <button
              type="button"
              class="btn btn-outline-primary btn-sm px-3 py-2 rounded-3 fw-semibold shadow-sm d-flex align-items-center gap-2"
              (click)="toggleAvisModal()">
              <i class="bi bi-pencil-square"></i>
               <span>Avis</span>
            </button>
          </div>  -->
        </div>

        @if (temoignages && temoignages.length > 0) {
          <!-- Slider Témoignages — 2 cartes par slide sur desktop, 1 sur mobile -->
          <div class="testimonials-slider-wrap position-relative overflow-hidden" style="min-height: 220px;">
            <div class="testimonials-track d-flex" [style.transform]="'translateX(-' + (activeTestimonial * 100) + '%)'">
              @for (pair of testimonialPairs; track $index) {
                <div class="testimonial-slide flex-shrink-0 w-100 px-2">
                  <div class="row g-3">
                    @for (t of pair; track t.id) {
                      <div class="col-12 col-md-6 mb-3">
                        <div class="ugb-testimonial-card">
                          <!-- Badge de citation supérieur droit (inspiré du design UGB aux couleurs LogementPlus) -->
                          <div class="ugb-quote-badge">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                            </svg>
                          </div>

                          <!-- En-tête : Photo avec cadre d'accentuation offset + Étoiles + Nom & Titre -->
                          <div class="ugb-testimonial-header">
                            <div class="ugb-avatar-wrapper">
                              <img [src]="t.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'"
                                   [alt]="t.nom_auteur">
                            </div>
                            <div class="ugb-author-info">
                              <div class="ugb-stars">
                                @for (s of [1,2,3,4,5]; track s) {
                                  <i class="bi" [class.bi-star-fill]="s <= t.note" [class.bi-star]="s > t.note"></i>
                                }
                              </div>
                              <h3 class="ugb-author-name">{{ t.nom_auteur }}</h3>
                              <p class="ugb-author-role">
                                {{ getRoleLabel(t.role_auteur) }} • {{ t.ville || 'Sénégal' }}
                              </p>
                            </div>
                          </div>

                          <!-- Corps : Texte du témoignage entre guillemets -->
                          <div class="ugb-testimonial-body">
                            <p>“{{ t.commentaire }}”</p>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Dots navigation par paire -->
            @if (testimonialPairs.length > 1) {
              <div class="d-flex justify-content-center gap-2 mt-3">
                @for (pair of testimonialPairs; track $index) {
                  <button
                    class="testimonial-dot"
                    [class.active]="activeTestimonial === $index"
                    (click)="setTestimonial($index)">
                  </button>
                }
              </div>
            }
          </div>
        } @else {
          <!-- EMPTY STATE MODERNE & STYLISÉ POUR LES AVIS -->
          <div class="card border-0 shadow-sm rounded-4 p-5 text-center bg-white my-3" style="border: 2px dashed #E2E8F0 !important;">
            <div class="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 mx-auto shadow-sm"
                 style="width: 68px; height: 68px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(20, 184, 166, 0.15) 100%); color: #F59E0B;">
              <i class="bi bi-chat-heart-fill fs-2"></i>
            </div>
            <h3 class="h5 fw-bold text-dark mb-2">Aucun avis publié pour le moment</h3>
            <p class="text-muted small mx-auto mb-4" style="max-width: 520px; line-height: 1.6;">
              Notre plateforme se déploie actuellement au Sénégal. Que vous soyez locataire ayant trouvé son bien, propriétaire bailleur ou agence partenaire, votre retour d'expérience est précieux.
            </p>
            <div>
              <button type="button" class="btn btn-primary px-4 py-2 rounded-pill fw-semibold shadow-sm" (click)="toggleAvisModal()">
                <i class="bi bi-star me-2 text-warning"></i> Soyez le premier à donner votre avis
              </button>
            </div>
          </div>
        }
      </div>
    </section>
    

    <!-- MODALE INTERACTIVE : DÉPÔT D'UN AVIS SUR LA PLATEFORME (LOCATAIRE, GESTIONNAIRE, AGENCE) -->
    @if (showAvisModal) {
      <div class="modal fade show d-block" style="background-color: rgba(0,0,0,0.6); z-index: 1060; backdrop-filter: blur(4px);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
            <div class="modal-header border-bottom p-3 bg-light">
              <h5 class="modal-title h6 fw-bold mb-0 d-flex align-items-center gap-2 text-dark">
                <i class="bi bi-star-fill text-warning"></i> Partager votre avis sur LogementPlus
              </h5>
              <button type="button" class="btn-close" (click)="toggleAvisModal()"></button>
            </div>

            <div class="modal-body p-4">
              @if (newAvisSuccess) {
                <div class="alert alert-success text-center py-4 rounded-3 mb-0">
                  <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-success text-white mb-3" style="width: 48px; height: 48px;">
                    <i class="bi bi-check-lg fs-3"></i>
                  </div>
                  <h6 class="fw-bold mb-1">Merci beaucoup pour votre témoignage !</h6>
                  <p class="text-muted small mb-3">Votre avis authentique a été ajouté avec succès et défile désormais sur la plateforme.</p>
                  <button type="button" class="btn btn-outline-success btn-sm px-4 rounded-pill" (click)="toggleAvisModal()">
                    Fermer
                  </button>
                </div>
              } @else {
                <form (ngSubmit)="submitNewAvis()">
                  <!-- Choix du rôle -->
                  <div class="mb-3">
                    <label class="form-label small fw-semibold text-dark mb-1">Vous intervenez en tant que :</label>
                    <div class="row g-2">
                      <div class="col-4">
                        <button
                          type="button"
                          class="btn btn-sm w-100 py-2 rounded-3 text-center border"
                          [class.btn-primary]="newAvisRole === 'locataire'"
                          [class.btn-light]="newAvisRole !== 'locataire'"
                          (click)="newAvisRole = 'locataire'">
                          <i class="bi bi-person d-block fs-6"></i>
                          <span style="font-size: 11px;">Locataire</span>
                        </button>
                      </div>
                      <div class="col-4">
                        <button
                          type="button"
                          class="btn btn-sm w-100 py-2 rounded-3 text-center border"
                          [class.btn-primary]="newAvisRole === 'gestionnaire'"
                          [class.btn-light]="newAvisRole !== 'gestionnaire'"
                          (click)="newAvisRole = 'gestionnaire'">
                          <i class="bi bi-house-door d-block fs-6"></i>
                          <span style="font-size: 11px;">Gestionnaire</span>
                        </button>
                      </div>
                      <div class="col-4">
                        <button
                          type="button"
                          class="btn btn-sm w-100 py-2 rounded-3 text-center border"
                          [class.btn-primary]="newAvisRole === 'agence'"
                          [class.btn-light]="newAvisRole !== 'agence'"
                          (click)="newAvisRole = 'agence'">
                          <i class="bi bi-buildings d-block fs-6"></i>
                          <span style="font-size: 11px;">Agence</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Nom et Ville -->
                  <div class="row g-2 mb-3">
                    <div class="col-sm-6">
                      <label class="form-label small fw-semibold text-dark mb-1">Votre Nom complet</label>
                      <input
                        type="text"
                        class="form-control form-control-sm rounded-3"
                        placeholder="Ex: Fatou Diop"
                        [(ngModel)]="newAvisNom"
                        name="nom"
                        required>
                    </div>
                    <div class="col-sm-6">
                      <label class="form-label small fw-semibold text-dark mb-1">Ville ou Quartier</label>
                      <input
                        type="text"
                        class="form-control form-control-sm rounded-3"
                        placeholder="Ex: Almadies, Dakar"
                        [(ngModel)]="newAvisVille"
                        name="ville">
                    </div>
                  </div>

                  <!-- Note 1 à 5 -->
                  <div class="mb-3">
                    <label class="form-label small fw-semibold text-dark mb-1 d-flex justify-content-between">
                      <span>Votre Note :</span>
                      <span class="text-warning fw-bold">{{ newAvisNote }} / 5 ({{ getNoteText(newAvisNote) }})</span>
                    </label>
                    <div class="d-flex align-items-center gap-2">
                      <div class="star-picker fs-4 text-warning" style="cursor: pointer;">
                        @for (s of [1,2,3,4,5]; track s) {
                          <i class="bi me-1"
                             [class.bi-star-fill]="s <= newAvisNote"
                             [class.bi-star]="s > newAvisNote"
                             (click)="newAvisNote = s">
                          </i>
                        }
                      </div>
                    </div>
                  </div>

                  <!-- Commentaire -->
                  <div class="mb-3">
                    <label class="form-label small fw-semibold text-dark mb-1">Votre avis / témoignage</label>
                    <textarea
                      class="form-control form-control-sm rounded-3"
                      rows="3"
                      placeholder="Décrivez votre expérience avec LogementPlus : rapidité de réservation, clarté des baux, sérieux des interlocuteurs..."
                      [(ngModel)]="newAvisCommentaire"
                      name="commentaire"
                      required>
                    </textarea>
                  </div>

                  <div class="d-flex justify-content-end gap-2 pt-2 border-top">
                    <button type="button" class="btn btn-light btn-sm rounded-pill px-3" (click)="toggleAvisModal()">
                      Annuler
                    </button>
                    <button
                      type="submit"
                      class="btn btn-primary btn-sm rounded-2 px-4 fw-semibold"
                      [disabled]="isSubmittingNewAvis || !newAvisNom.trim() || !newAvisCommentaire.trim()">
                      @if (isSubmittingNewAvis) {
                        <span class="spinner-border spinner-border-sm me-1"></span>
                        <span>Envoi...</span>
                      } @else {
                        <i class="bi bi-send-fill me-1"></i>
                        <span>Publier</span>
                      }
                    </button>
                  </div>
                </form>
              }
            </div>
          </div>
        </div>
      </div>
    }
 
    <!-- <section class="py-5 border-top">
      <div class="container">
        <div class="row">
          <div class="col-lg-6">
            <div>
              <div class="text-start mb-4">
                <span class="h4 text-secondary fw-bold ">Questions Fréquentes sur la location au Sénégal</span>
                <p class="text-muted small mb-0">Tout ce que vous devez savoir avant de signer votre bail</p>
              </div>

              <div class="faq-list">
                @for (faq of faqs; track $index) {
                  <div class="faq-item shadow-sm">
                    <div class="faq-header" (click)="toggleFaq($index)">
                      <span class="text-dark">{{ faq.question }}</span>
                      <i class="bi" [class.bi-chevron-up]="faq.open" [class.bi-chevron-down]="!faq.open"></i>
                    </div>
                    @if (faq.open) {
                      <div class="faq-body border-top pt-2">
                        {{ faq.answer }}
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="newsletter-card shadow-lg">
              <div class="row align-items-center g-3">
                <div class="col-lg-12">
                  <span class="badge bg-warning text-dark px-3 py-2 rounded-2 fw-semibold mb-2">Alerte Prioritaire</span>
                  <h2 class="h4 fw-bold mb-2 text-white">Soyez notifié dès qu'un logement se libère à Dakar ou Saly</h2>
                  <p class="text-white-50 small mb-0">
                    Recevez directement sur WhatsApp ou par e-mail les nouvelles annonces vérifiées avant tout le monde.
                  </p>
                </div>

                <div class="col-lg-12">
                  @if (alertSent) {
                    <div class="alert alert-success d-flex align-items-center gap-2 small py-2 mb-0 rounded-3">
                      <i class="bi bi-check-circle-fill fs-5"></i>
                      <div>Alerte activée avec succès ! Vous recevrez nos nouvelles annonces en priorité.</div>
                    </div>
                  } @else {
                    <form (ngSubmit)="submitAlert()">
                      <div class="d-flex flex-column flex-sm-row gap-2">
                        <input 
                          type="text" 
                          class="form-control" 
                          placeholder="Numéro WhatsApp ou adresse e-mail" 
                          [(ngModel)]="alertContact" 
                          name="contact" 
                          required
                        >
                        <button type="submit" class="btn btn-warning fw-bold text-nowrap px-4" [disabled]="!alertContact">
                          <i class="bi bi-bell-fill me-1"></i> M'alerter
                        </button>
                      </div>
                    </form>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section> -->

    

    <!-- MODAL D'ANNONCE DE BIENVENUE (5 secondes, 1 fois par session) -->
    @if (showAnnouncementModal) {
      <div
        class="announcement-modal-backdrop"
        (click)="closeAnnouncementModal()">
        <div
          class="announcement-modal-card"
          (click)="$event.stopPropagation()">
          <!-- En-tête coloré -->
          <div style="background:linear-gradient(135deg,#0B3D91,#14B8A6);padding:20px 24px;position:relative;">
            <button
              (click)="closeAnnouncementModal()"
              style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,0.2);border:none;color:#fff;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;line-height:1;">
              &times;
            </button>
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="background:rgba(255,255,255,0.15);border-radius:12px;padding:10px;">
                <i class="bi bi-house-heart-fill" style="font-size:28px;color:#FFD700;"></i>
              </div>
              <div>
                <div style="color:rgba(255,255,255,0.8);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">LogementPlus Sénégal</div>
                <h2 style="color:#fff;font-size:18px;font-weight:700;margin:4px 0 0;">Bienvenue sur la plateforme !</h2>
              </div>
            </div>
          </div>
          <!-- Corps -->
          <div style="padding:20px 24px;">
            <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 16px;">
              🏠 Trouvez votre logement idéal au <strong>Sénégal</strong> parmi des centaines d'annonces vérifiées à <strong>Dakar, Saly et sur la Petite Côte</strong>.
            </p>
            <ul style="color:#4B5563;font-size:13px;line-height:1.9;padding-left:18px;margin:0 0 20px;">
              <li>✅ Baux 100% conformes à la loi sénégalaise</li>
              <li>✅ Paiements sécurisés via Wave et Orange Money</li>
              <li>✅ Réservation en moins de 5 minutes</li>
              <li>✅ Gestionnaires agréés disponibles 7j/7</li>
            </ul>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
              <button
                (click)="closeAnnouncementModal()"
                style="flex:1;background:linear-gradient(135deg,#0B3D91,#1D4ED8);color:#fff;border:none;border-radius:8px;padding:10px 20px;font-weight:600;font-size:14px;cursor:pointer;min-width:160px;">
                <i class="bi bi-search me-1"></i> Explorer les logements
              </button>
              <button
                (click)="closeAnnouncementModal()"
                style="background:transparent;border:1px solid #D1D5DB;color:#6B7280;border-radius:8px;padding:10px 16px;font-size:13px;cursor:pointer;white-space:nowrap;">
                Fermer ({{ announcementCountdown }}s)
              </button>
            </div>
          </div>
          <!-- Barre de progression -->
          <div style="height:4px;background:#E5E7EB;">
            <div style="height:100%;background:linear-gradient(90deg,#0B3D91,#14B8A6);transition:width 1s linear;" [style.width]="(announcementCountdown * 20) + '%'"></div>
          </div>
        </div>
      </div>
    }

    <!-- 8. FONCTIONNALITÉ MODERNE 5 : FAQ INTERACTIVE ACCORDÉON (LOCATION AU SÉNÉGAL) -->
    <!-- <section class="py-5 bg-white border-top">
      <div class="container" style="max-width: 860px;">
        <div class="text-center mb-4">
          <span class="badge bg-secondary bg-opacity-10 text-secondary px-3 py-1 rounded-2 small fw-semibold ">Réponses Rapides</span>
          <h2 class="h5 fw-bold mt-1 mb-1">Questions Fréquentes sur la location au Sénégal</h2>
          <p class="text-muted small mb-0">Tout ce que vous devez savoir avant de signer votre bail</p>
        </div>

        <div class="faq-list">
          @for (faq of faqs; track $index) {
            <div class="faq-item shadow-sm">
              <div class="faq-header" (click)="toggleFaq($index)">
                <span class="text-dark">{{ faq.question }}</span>
                <i class="bi" [class.bi-chevron-up]="faq.open" [class.bi-chevron-down]="!faq.open"></i>
              </div>
              @if (faq.open) {
                <div class="faq-body border-top pt-2">
                  {{ faq.answer }}
                </div>
              }
            </div>
          }
        </div>
      </div>
    </section> -->

    <!-- 9. FONCTIONNALITÉ MODERNE 6 : ALERTE IMMOBILIÈRE SÉNÉGAL (WHATSAPP & EMAIL) -->
    <!-- <section class="py-5 bg-white">
      <div class="container">
        <div class="newsletter-card shadow-lg">
          <div class="row align-items-center g-3">
            <div class="col-lg-7">
              <span class="badge bg-warning text-dark px-3 py-1 rounded-2 small fw-semibold mb-2">Alerte Prioritaire</span>
              <h2 class="h4 fw-bold mb-2">Soyez notifié dès qu'un logement se libère à Dakar ou Saly</h2>
              <p class="text-white-50 small mb-0">
                Recevez directement sur WhatsApp ou par e-mail les nouvelles annonces vérifiées avant tout le monde.
              </p>
            </div>

            <div class="col-lg-5">
              @if (alertSent) {
                <div class="alert alert-success d-flex align-items-center gap-2 small py-2 mb-0 rounded-3">
                  <i class="bi bi-check-circle-fill fs-5"></i>
                  <div>Alerte activée avec succès ! Vous recevrez nos nouvelles annonces en priorité.</div>
                </div>
              } @else {
                <form (ngSubmit)="submitAlert()">
                  <div class="d-flex flex-column flex-sm-row gap-2">
                    <input 
                      type="text" 
                      class="form-control" 
                      placeholder="Numéro WhatsApp ou E-mail" 
                      [(ngModel)]="alertContact" 
                      name="contact" 
                      required>
                    <button type="submit" class="btn btn-warning fw-bold text-nowrap px-4" [disabled]="!alertContact">
                      <i class="bi bi-bell-fill me-1"></i> M'alerter
                    </button>
                  </div>
                </form>
              }
            </div>
          </div>
        </div>
      </div>
    </section> -->
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  private logementService = inject(LogementService);
  public agenceService = inject(AgenceService);
  public temoignageService = inject(TemoignageService);
  public statsService = inject(StatsService);
  public auth = inject(AuthService);
  public favoriService = inject(FavoriService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private modalAlert = inject(ModalAlertService);

  // Images statiques de haute qualité pour le diaporama Hero — indépendantes des logements
  heroSlides = [
    { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=85', title: "Villas d'architecte & Demeures contemporaines", price: "Cadre d'exception" },
    { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=85', title: 'Résidences de standing & Piscines privées', price: 'Séjour balnéaire' },
    { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=85', title: 'Appartements haut standing vue mer', price: 'Confort premium' },
    { url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1920&q=85', title: "Intérieurs modernes & Espaces lumineux", price: 'Emplacements phares' },
    { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=85', title: "Propriétés exclusives avec jardin & Sécurité 24h", price: 'Baux sécurisés' }
  ];

  activeSlide = 0;
  private slideInterval: any;

  allLogements: Logement[] = [];
  displayedLogements: Logement[] = [];
  selectedCategory = 'tous';
  searchCity = '';
  searchType = 'tous';
  searchBudget: number | null = null;
  favoriteIds = new Set<number>();

  // 1. Quartiers phares dynamiques (issus de la base de données & recalculés en direct)
  neighborhoods: Neighborhood[] = [];
  private quartiersSub?: Subscription;

  // 2. Simulateur de budget interactif
  simLoyer = 400000;
  get simCaution(): number {
    return this.simLoyer * 2;
  }
  get simFrais(): number {
    return Math.round(this.simLoyer * 0.05);
  }
  get simTotal(): number {
    return this.simLoyer + this.simCaution + this.simFrais;
  }
  get simMatchingCount(): number {
    return this.allLogements.slice(0, 9).filter(l => l.prix_par_mois <= this.simLoyer).length;
  }

  // 3. FAQ interactive
  faqs = [
    {
      question: 'Combien de mois de caution un bailleur peut-il légalement exiger au Sénégal ?',
      answer: 'En vertu de la réglementation sénégalaise sur les baux à usage d\'habitation, la caution est légalement plafonnée à deux (2) mois de loyer au maximum. LogementPlus applique et garantit ce plafond sur toutes les annonces de la plateforme.',
      open: true
    },
    {
      question: 'Quels sont les moyens de paiement acceptés pour régler loyer et caution ?',
      answer: 'Vous pouvez régler en toute sécurité via Wave Sénégal, Orange Money Sénégal, Free Money ou par Carte Bancaire Visa / Mastercard. Un reçu officiel téléchargeable en PDF avec référence unique est généré instantanément.',
      open: false
    },
    {
      question: 'Comment organiser une visite physique d\'un logement à Dakar ou Saly ?',
      answer: 'Chaque annonce propose un bouton "Discuter sur WhatsApp" relié directement au gestionnaire agréé du bien. Vous pouvez ainsi caler une visite physique ou en visio sous 24h sans intermédiaire.',
      open: false
    },
    {
      question: 'Comment la plateforme vérifie-t-elle les coupures d\'eau et d\'électricité ?',
      answer: 'Chaque bien fait l\'objet d\'un audit technique préalable. Les fiches signalent explicitement la présence d\'un groupe électrogène automatique (Senelec) et d\'une réserve d\'eau avec surpresseur (Sen\'Eau) pour un confort garanti.',
      open: false
    }
  ];

  // 4. Alerte personnalisée
  alertContact = '';
  alertSent = false;

  // 5. Témoignages dynamiques & slider automatique
  activeTestimonial = 0;
  private testimonialInterval: any;
  temoignages: Temoignage[] = [];
  private temoignagesSub?: Subscription;

  // Getter : groupes de 2 témoignages par slide (desktop = 2 cartes, mobile = 1)
  get testimonialPairs(): Temoignage[][] {
    const pairs: Temoignage[][] = [];
    for (let i = 0; i < this.temoignages.length; i += 2) {
      pairs.push(this.temoignages.slice(i, i + 2));
    }
    return pairs;
  }

  // 6. Agences partenaires dynamiques
  agences: Agence[] = [];
  agencesLoading = false;
  agencesError: string | null = null;
  private agencesSub?: Subscription;
  private agencesLoadingSub?: Subscription;
  private agencesErrorSub?: Subscription;

  // 7. Statistiques dynamiques issues de la base de données
  stats: PlateformePublicStats | null = null;
  private statsSub?: Subscription;

  // 8. Modale interactive d'ajout d'avis plateforme
  showAvisModal = false;
  newAvisNom = '';
  newAvisRole: 'locataire' | 'gestionnaire' | 'agence' = 'locataire';
  newAvisVille = '';
  newAvisNote = 5;
  newAvisCommentaire = '';
  newAvisSuccess = false;
  isSubmittingNewAvis = false;

  // 9. Modal d'annonce de bienvenue (5 secondes, 1 fois par session)
  showAnnouncementModal = false;
  announcementCountdown = 5;
  private announcementCountdownTimer: any;

  // 10. Statistiques animées (IntersectionObserver + requestAnimationFrame)
  animatedLogements = 0;
  animatedAgences = 0;
  animatedDisponibles = 0;
  animatedLocations = 0;
  animatedLocataires = 0;
  animatedSatisfaction = 0;
  private statsAnimated = false;
  private isStatsSectionVisible = false;
  private statsObserver?: IntersectionObserver;

  ngOnInit(): void {
    // 1. Initialisation synchrone immédiate avec le catalogue Sénégal
    this.allLogements = this.logementService.getSenegalCatalog();
    this.displayedLogements = [...this.allLogements];
    // heroSlides est maintenant statique — pas d'appel à updateHeroSlides

    // 2. Calcul dynamique immédiat des quartiers et du nombre réel de logements
    this.neighborhoods = this.logementService.computeNeighborhoodsSync(this.allLogements);

    // 3. Initialisation synchrone des avis et agences
    this.temoignages = this.temoignageService.getTemoignagesSync();
    this.agences = this.agenceService.getAgencesSync();
    this.cdr.markForCheck();

    // 4. Écoute réactive des quartiers depuis l'API Laravel
    this.quartiersSub = this.logementService.getQuartiers().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.neighborhoods = data;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        }
      }
    });

    // 5. Écoute réactive des témoignages
    this.temoignagesSub = this.temoignageService.temoignages$.subscribe(data => {
      this.temoignages = data || [];
      if (this.activeTestimonial >= this.testimonialPairs.length) {
        this.activeTestimonial = 0;
      }
      this.cdr.markForCheck();
    });

    // 6. Écoute réactive des agences, chargement et erreurs
    this.agencesSub = this.agenceService.agences$.subscribe(data => {
      this.agences = data || [];
      this.cdr.markForCheck();
    });
    this.agencesLoadingSub = this.agenceService.loading$.subscribe(loading => {
      this.agencesLoading = loading;
      this.cdr.markForCheck();
    });
    this.agencesErrorSub = this.agenceService.error$.subscribe(err => {
      this.agencesError = err;
      this.cdr.markForCheck();
    });

    // 7. Écoute réactive des statistiques de la plateforme
    this.stats = this.statsService.getStatsSync();
    this.statsSub = this.statsService.stats$.subscribe(s => {
      this.stats = s;
      if (s && this.isStatsSectionVisible && !this.statsAnimated) {
        this.triggerStatsAnimation();
      }
      this.cdr.markForCheck();
    });

    // 8. Démarrage des diaporamas
    this.startSlider();
    this.startTestimonialSlider();

    // 9. Rafraîchissement asynchrone si le backend est actif
    this.logementService.getLogements().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.allLogements = data;
          // heroSlides reste statique — pas de mise à jour depuis les logements
          this.filterLocally();
          this.updateNeighborhoods();
          this.cdr.markForCheck();
        }
      },
      error: () => console.log('Catalogue Sénégal prêt')
    });

    // 10. Modal d'annonce bienvenue (1 fois par session)
    this.initAnnouncementModal();

    // 11. Observer IntersectionObserver pour stats animées
    setTimeout(() => this.initStatsObserver(), 500);
  }

  ngOnDestroy(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
    if (this.testimonialInterval) {
      clearInterval(this.testimonialInterval);
    }
    this.quartiersSub?.unsubscribe();
    this.temoignagesSub?.unsubscribe();
    this.agencesSub?.unsubscribe();
    this.agencesLoadingSub?.unsubscribe();
    this.agencesErrorSub?.unsubscribe();
    this.statsSub?.unsubscribe();
    if (this.announcementCountdownTimer) clearInterval(this.announcementCountdownTimer);
    if (this.statsObserver) this.statsObserver.disconnect();
  }

  retryAgences(): void {
    this.agenceService.refresh();
  }

  updateNeighborhoods(): void {
    this.neighborhoods = this.logementService.computeNeighborhoodsSync(this.allLogements);
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  startTestimonialSlider(): void {
    if (this.testimonialInterval) {
      clearInterval(this.testimonialInterval);
    }
    this.testimonialInterval = setInterval(() => {
      if (this.testimonialPairs && this.testimonialPairs.length > 0) {
        this.activeTestimonial = (this.activeTestimonial + 1) % this.testimonialPairs.length;
        this.cdr.markForCheck();
      }
    }, 5000);
  }

  setTestimonial(index: number): void {
    this.activeTestimonial = index;
    if (this.testimonialInterval) {
      clearInterval(this.testimonialInterval);
      this.startTestimonialSlider();
    }
    this.cdr.markForCheck();
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'locataire': return 'Locataire certifié';
      case 'gestionnaire': return 'Propriétaire bailleur';
      case 'agence': return 'Agence partenaire';
      default: return 'Membre LogementPlus';
    }
  }

  getNoteText(note: number): string {
    switch (note) {
      case 1: return 'Décevant';
      case 2: return 'Moyen';
      case 3: return 'Bien';
      case 4: return 'Très satisfaisant';
      case 5: return 'Parfait & Recommandé';
      default: return 'Excellent';
    }
  }

  toggleAvisModal(): void {
    this.showAvisModal = !this.showAvisModal;
    this.newAvisSuccess = false;

    // Pré-remplissage si utilisateur connecté
    const user = this.auth.currentUser();
    if (user && this.showAvisModal) {
      this.newAvisNom = user.name || `${user.prenom || ''} ${user.nom || ''}`.trim();
      if (user.role === 'admin' || user.role === 'superadmin') {
        this.newAvisRole = 'gestionnaire';
      } else {
        this.newAvisRole = 'locataire';
      }
    }
    this.cdr.markForCheck();
  }

  submitNewAvis(): void {
    if (!this.newAvisNom.trim() || !this.newAvisCommentaire.trim()) return;

    this.isSubmittingNewAvis = true;
    this.temoignageService.ajouterTemoignage({
      nom_auteur: this.newAvisNom,
      role_auteur: this.newAvisRole,
      ville: this.newAvisVille.trim() || 'Sénégal',
      note: this.newAvisNote,
      commentaire: this.newAvisCommentaire
    }).subscribe({
      next: () => {
        this.isSubmittingNewAvis = false;
        this.newAvisSuccess = true;
        this.newAvisCommentaire = '';
        this.cdr.markForCheck();
      },
      error: () => {
        this.isSubmittingNewAvis = false;
        this.newAvisSuccess = true;
        this.cdr.markForCheck();
      }
    });
  }

  startSlider(): void {
    this.slideInterval = setInterval(() => {
      this.activeSlide = (this.activeSlide + 1) % this.heroSlides.length;
      this.cdr.markForCheck();
    }, 4500);
  }

  setSlide(index: number): void {
    this.activeSlide = index;
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.startSlider();
    }
    this.cdr.markForCheck();
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.searchType = category;
    this.filterLocally();
  }

  filterLocally(): void {
    let result = [...this.allLogements.slice(0, 9)];
    

    if (this.selectedCategory && this.selectedCategory !== 'tous') {
      result = result.filter(l => l.type === this.selectedCategory);
    }

    if (this.searchCity && this.searchCity.trim()) {
      const q = this.searchCity.toLowerCase().trim();
      result = result.filter(l => 
        l.titre.toLowerCase().includes(q) ||
        l.ville.toLowerCase().includes(q) ||
        (l.quartier && l.quartier.toLowerCase().includes(q)) ||
        l.adresse.toLowerCase().includes(q)
      );
    }

    if (this.searchBudget && this.searchBudget > 0) {
      result = result.filter(l => l.prix_par_mois <= this.searchBudget!);
    }

    this.displayedLogements = result;
    this.cdr.markForCheck();
  }

  filterByNeighborhood(zoneName: string): void {
    this.searchCity = zoneName;
    this.filterLocally();
    this.scrollToCatalogue();
  }

  resetLocalFilters(): void {
    this.selectedCategory = 'tous';
    this.searchCity = '';
    this.searchType = 'tous';
    this.searchBudget = null;
    this.displayedLogements = [...this.allLogements];
    this.cdr.markForCheck();
  }

  onSimChange(): void {
    this.cdr.markForCheck();
  }

  applySimBudget(): void {
    this.searchBudget = this.simLoyer;
    this.filterLocally();
    this.scrollToCatalogue();
  }

  toggleFaq(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
    this.cdr.markForCheck();
  }

  submitAlert(): void {
    if (this.alertContact) {
      this.alertSent = true;
      this.cdr.markForCheck();
    }
  }

  scrollToCatalogue(): void {
    const el = document.getElementById('catalogueSection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getCardWhatsApp(logement: Logement): string {
    const text = encodeURIComponent(
      `Bonjour, je vous contacte depuis LogementPlus Sénégal pour le logement Réf #${logement.id} : "${logement.titre}" à ${logement.quartier || logement.ville} (${logement.prix_par_mois.toLocaleString('fr-FR')} FCFA/mois). Est-il toujours disponible ?`
    );
    return `https://wa.me/221770809110?text=${text}`;
  }

  toggleFav(logement: Logement): void {
    if (!this.auth.isLoggedIn()) {
      this.modalAlert.warning('Connexion requise : Vous devez être connecté à votre compte locataire pour ajouter un logement à vos favoris.', 'Compte Locataire Requis');
      this.router.navigate(['/login'], { queryParams: { redirect: '/' } });
      return;
    }
    this.favoriService.toggleFavori(logement);
    this.cdr.markForCheck();
  }

  isFav(id: number): boolean {
    return this.favoriService.isFavori(id);
  }

  // ==================== MODAL ANNONCE BIENVENUE ====================

  initAnnouncementModal(): void {
    const KEY = 'logementplus_welcome_announcement_seen';
    if (typeof window !== 'undefined' && !sessionStorage.getItem(KEY)) {
      sessionStorage.setItem(KEY, '1');
      setTimeout(() => {
        this.showAnnouncementModal = true;
        this.announcementCountdown = 5;
        this.cdr.markForCheck();
        this.announcementCountdownTimer = setInterval(() => {
          this.announcementCountdown--;
          this.cdr.markForCheck();
          if (this.announcementCountdown <= 0) {
            this.closeAnnouncementModal();
          }
        }, 1000);
      }, 800);
    }
  }

  closeAnnouncementModal(): void {
    this.showAnnouncementModal = false;
    if (this.announcementCountdownTimer) {
      clearInterval(this.announcementCountdownTimer);
      this.announcementCountdownTimer = null;
    }
    this.cdr.markForCheck();
  }

  // ==================== STATS ANIMÉES ====================

  initStatsObserver(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.isStatsSectionVisible = true;
      if (this.stats) this.triggerStatsAnimation();
      return;
    }
    const target = document.getElementById('statsPlateformeSection');
    if (!target) return;
    this.statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.isStatsSectionVisible = true;
          if (!this.statsAnimated && this.stats) {
            this.triggerStatsAnimation();
          }
        }
      });
    }, { threshold: 0.2 });
    this.statsObserver.observe(target);
  }

  triggerStatsAnimation(): void {
    if (this.statsAnimated) return;
    this.statsAnimated = true;
    const s = this.stats;
    if (!s) return;
    this.animateCounter('animatedLogements', s.nb_logements || 0, 1800); 
    this.animateCounter('animatedAgences', s.nb_agences || 0, 1500);
    this.animateCounter('animatedDisponibles', s.nb_annonces_disponibles || 0, 1600);
    this.animateCounter('animatedLocations', s.nb_locations_realisees || 0, 2000);
    this.animateCounter('animatedLocataires', s.nb_locataires || 0, 1700);
    this.animateCounter('animatedSatisfaction', s.taux_satisfaction || 0, 1400);

  }

  animateCounter(prop: string, target: number, duration: number): void {
    const start = performance.now();
    const update = (timestamp: number) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      (this as any)[prop] = Math.round(target * eased);
      this.cdr.markForCheck();
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        (this as any)[prop] = target;
        this.cdr.markForCheck();
      }
    };
    requestAnimationFrame(update);
  }
}
