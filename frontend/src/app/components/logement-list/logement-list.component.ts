import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, PLATFORM_ID, Inject, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LogementService } from '../../services/logement.service';
import { FavoriService } from '../../services/favori.service';
import { AuthService } from '../../services/auth.service';
import { ModalAlertService } from '../../services/modal-alert.service';
import { Equipement, Logement } from '../../models/models';
import { geocodeSenegal } from '../../utils/geocoding';

declare let L: any;

@Component({
  selector: 'app-logement-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container-fluid py-3 py-lg-4 px-2 px-lg-4">
      
      <!-- ================================================================= -->
      <!-- 1. BARRE DE CONTRÔLE MOBILE COMPACTE & ERGONOMIQUE (< 992px)      -->
      <!-- ================================================================= -->
      <div class="mobile-control-bar d-lg-none mb-3">
        <!-- Titre compact et compteur -->
        <div class="d-flex align-items-center justify-content-between mb-2 px-1">
          <div>
            <h1 class="h6 fw-bold mb-0 text-dark">Logements au Sénégal</h1>
            <span class="text-muted" style="font-size: 11px;">
              <span class="text-primary fw-bold">{{ logements.length }}</span> bien(s) vérifié(s)
            </span>
          </div>
          @if (hasActiveFilters) {
            <button class="btn btn-link text-danger p-0 text-decoration-none fw-semibold" style="font-size: 11px;" (click)="resetFilters()">
              <i class="bi bi-arrow-counterclockwise me-1"></i>Effacer filtres
            </button>
          }
        </div>

        <!-- Barre d'outils mobile compacte : Filtres + Trier par + Modes de vue -->
        <div class="mobile-tools-row bg-white p-2 rounded-3 border d-flex align-items-center justify-content-between gap-1 shadow-xs">
          <!-- Bouton Filtres (Ouvre la modale) -->
          <button 
            type="button" 
            class="btn btn-sm rounded-2 d-inline-flex align-items-center gap-1 px-2-5 py-1-5 flex-shrink-0"
            [ngClass]="activeFiltersCount > 0 ? 'btn-primary shadow-xs' : 'btn-outline-secondary border text-dark'"
            (click)="openMobileFilters()">
            <i class="bi bi-sliders2"></i>
            <span class="fw-semibold small">Filtres</span>
            @if (activeFiltersCount > 0) {
              <span class="badge bg-white text-primary rounded-pill px-1-5 py-0 fw-bold" style="font-size: 10px;">
                {{ activeFiltersCount }}
              </span>
            }
          </button>

          <!-- Sélecteur Tri par compact sans débordement -->
          <div class="mobile-tri-wrapper flex-grow-1" style="min-width: 0; max-width: 145px;">
            <select 
              class="form-select form-select-sm rounded-2 text-truncate" 
              style="font-size: 11px; padding-left: 6px; padding-right: 20px;" 
              [(ngModel)]="filters.tri" 
              (change)="loadLogements()">
              <option value="pertinence">Tri: Pertinence</option>
              <option value="prix_asc">Prix croissant</option>
              <option value="prix_desc">Prix décroissant</option>
              <option value="surface_asc">Surface croissante</option>
              <option value="surface_desc">Surface décroissante</option>
              <option value="recent">Plus récent</option>
              <option value="note">Mieux notés</option>
            </select>
          </div>

          <!-- Bascule vue mobile (Mixte / Carte / Liste) -->
          <div class="btn-group btn-group-sm rounded-2 p-0-5 bg-light border flex-shrink-0">
            <button 
              type="button" 
              class="btn btn-sm px-2 py-1 rounded-2"
              [class.btn-primary]="viewMode === 'split'"
              [class.btn-light]="viewMode !== 'split'"
              [class.text-muted]="viewMode !== 'split'"
              title="Vue mixte (Carte + Logements)"
              (click)="setViewMode('split')">
              <i class="bi bi-layout-split"></i>
              <span class="d-none d-sm-inline ms-1" style="font-size: 11px;">Mixte</span>
            </button>
            <button 
              type="button" 
              class="btn btn-sm px-2 py-1 rounded-2"
              [class.btn-primary]="viewMode === 'map'"
              [class.btn-light]="viewMode !== 'map'"
              [class.text-muted]="viewMode !== 'map'"
              title="Vue carte seule"
              (click)="setViewMode('map')">
              <i class="bi bi-map"></i>
              <span class="d-none d-sm-inline ms-1" style="font-size: 11px;">Carte</span>
            </button>
            <button 
              type="button" 
              class="btn btn-sm px-2 py-1 rounded-2"
              [class.btn-primary]="viewMode === 'list'"
              [class.btn-light]="viewMode !== 'list'"
              [class.text-muted]="viewMode !== 'list'"
              title="Vue liste carrousel"
              (click)="setViewMode('list')">
              <i class="bi bi-list-ul"></i>
              <span class="d-none d-sm-inline ms-1" style="font-size: 11px;">Liste</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 2. BARRE D'OUTILS ET FILTRES RAPIDES (DESKTOP SEULEMENT >= 992px) -->
      <!-- ================================================================= -->
      <div class="row align-items-center mb-3 g-2 d-none d-lg-flex">
        <div class="col-md-6">
          <h1 class="h4 fw-bold mb-1">Explorer les logements au Sénégal</h1>
          <p class="text-muted small mb-0">
            <span class="badge bg-primary rounded-1 me-1">{{ logements.length }}</span> 
            types de logements vérifiés
          </p>
        </div>
        <div class="col-md-6 d-flex align-items-center justify-content-md-end gap-2">
          <!-- Tri CDC RF-12 -->
          <div class="d-flex align-items-center gap-1">
            <label class="small text-muted text-nowrap d-none d-sm-inline">Trier par :</label>
            <select class="form-select form-select-sm rounded-2" [(ngModel)]="filters.tri" (change)="loadLogements()">
              <option value="pertinence">Pertinence</option>
              <option value="prix_asc">Prix croissant</option>
              <option value="prix_desc">Prix décroissant</option>
              <option value="surface_asc">Surface croissante</option>
              <option value="surface_desc">Surface décroissante</option>
              <option value="recent">Plus récent</option>
              <option value="note">Mieux notés</option>
            </select>
          </div>

          <!-- Bascule vue Liste / Carte (CDC RF-13) Desktop -->
          <div class="btn-group btn-group-sm rounded-2 p-1 bg-white border">
            <button 
              type="button" 
              class="btn btn-sm rounded-2 px-3 me-1"
              [class.btn-primary]="viewMode === 'split'"
              [class.btn-light]="viewMode !== 'split'"
              (click)="setViewMode('split')">
              <i class="bi bi-layout-split me-1"></i> Mixte
            </button>
            <button 
              type="button" 
              class="btn btn-sm rounded-2 px-3 me-1"
              [class.btn-primary]="viewMode === 'list'"
              [class.btn-light]="viewMode !== 'list'"
              (click)="setViewMode('list')">
              <i class="bi bi-list-ul me-1"></i> Liste
            </button>
            <button 
              type="button" 
              class="btn btn-sm rounded-2 px-3"
              [class.btn-primary]="viewMode === 'map'"
              [class.btn-light]="viewMode !== 'map'"
              (click)="setViewMode('map')">
              <i class="bi bi-map me-1"></i> Carte
            </button>
          </div>
        </div>
      </div>

      <!-- Corps principal : Filtres + Contenu (Liste & Carte) -->
      <div class="row g-3">
        <!-- Sidebar Filtres Desktop (CDC RF-11) : Masqué sur Mobile (< 992px) -->
        <div class="col-lg-3 d-none d-lg-block">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white sticky-top" style="top: 80px; z-index: 10; max-height: calc(100vh - 100px); overflow-y: auto;">
            <div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
              <h2 class="h6 fw-bold mb-0 text-dark">
                <i class="bi bi-sliders text-primary me-1"></i> Filtres précis
              </h2>
              @if (hasActiveFilters) {
                <button class="btn btn-link btn-sm text-decoration-none text-danger p-0 small fw-semibold" (click)="resetFilters()">
                  <i class="bi bi-arrow-counterclockwise me-1"></i>Effacer tout
                </button>
              }
            </div>

            <form (ngSubmit)="loadLogements()">
              <!-- 1. Recherche par mot-clé -->
              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark">Recherche par mot-clé</label>
                <div class="input-group input-group-sm">
                  <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
                  <input type="text" class="form-control border-start-0" placeholder="Titre, adresse, mot..." [(ngModel)]="filters.q" name="q" (input)="onFilterChange()">
                  @if (filters.q) {
                    <button class="btn btn-outline-secondary border-start-0 border-light-subtle" type="button" (click)="filters.q = ''; loadLogements()">
                      <i class="bi bi-x"></i>
                    </button>
                  }
                </div>
              </div>

              <!-- 2. Localisation précise : Ville & Quartier -->
              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark">Ville au Sénégal</label>
                <select class="form-select form-select-sm" [(ngModel)]="filters.ville" name="ville" (change)="onVilleChange()">
                  <option value="toutes">Toutes les villes</option>
                  @for (v of villesDisponibles; track v) {
                    <option [value]="v">{{ v }}</option>
                  }
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark">Quartier</label>
                <input 
                  type="text" 
                  class="form-control form-control-sm" 
                  placeholder="Ex: Almadies, Plateau, Sanar..." 
                  [(ngModel)]="filters.quartier" 
                  name="quartier" 
                  list="quartiersDatalist"
                  (input)="onFilterChange()">
                <datalist id="quartiersDatalist">
                  @for (q of quartiersDisponibles; track q) {
                    <option [value]="q"></option>
                  }
                </datalist>
              </div>

              <!-- 3. Type de logement -->
              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark">Type de bien</label>
                <select class="form-select form-select-sm" [(ngModel)]="filters.type" name="type" (change)="loadLogements()">
                  <option value="tous">Tous les types</option>
                  <option value="appartement">Appartement</option>
                  <option value="studio">Studio</option>
                  <option value="maison">Maison / Villa</option>
                  <option value="chambre">Chambre</option>
                </select>
              </div>

              <!-- 4. Budget mensuel (Fourchette précise Min & Max) -->
              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark d-flex justify-content-between align-items-center">
                  <span>Loyer mensuel (FCFA)</span>
                  <span class="text-primary fw-bold tabular-numbers small" style="font-size: 11px;">
                    {{ (filters.prix_min || 0) | number }} - {{ filters.prix_max | number }} F
                  </span>
                </label>
                
                <div class="row g-2 mb-2">
                  <div class="col-6">
                    <input 
                      type="number" 
                      class="form-control form-control-sm" 
                      placeholder="Min (FCFA)" 
                      [(ngModel)]="filters.prix_min" 
                      name="prix_min" 
                      min="0" 
                      step="10000"
                      (change)="loadLogements()">
                  </div>
                  <div class="col-6">
                    <input 
                      type="number" 
                      class="form-control form-control-sm" 
                      placeholder="Max (FCFA)" 
                      [(ngModel)]="filters.prix_max" 
                      name="prix_max" 
                      min="10000" 
                      step="25000"
                      (change)="loadLogements()">
                  </div>
                </div>

                <input 
                  type="range" 
                  class="form-range" 
                  min="50000" 
                  max="1500000" 
                  step="25000" 
                  [(ngModel)]="filters.prix_max" 
                  name="prix_max_slider" 
                  (input)="loadLogements()">

                <!-- Raccourcis budget -->
                <div class="d-flex flex-wrap gap-1 mt-1">
                  <button type="button" class="btn btn-outline-secondary btn-sm py-0 px-2 rounded-2" style="font-size: 10px;" (click)="setPrixPreset(null, 200000)">&lt; 200k</button>
                  <button type="button" class="btn btn-outline-secondary btn-sm py-0 px-2 rounded-2" style="font-size: 10px;" (click)="setPrixPreset(200000, 500000)">200k-500k</button>
                  <button type="button" class="btn btn-outline-secondary btn-sm py-0 px-2 rounded-2" style="font-size: 10px;" (click)="setPrixPreset(500000, 1000000)">500k-1M</button>
                  <button type="button" class="btn btn-outline-secondary btn-sm py-0 px-2 rounded-2" style="font-size: 10px;" (click)="setPrixPreset(1000000, null)">&gt; 1M</button>
                </div>
              </div>

              <!-- 5. Nombre de pièces & Surface (Min / Max) -->
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <label class="form-label small fw-semibold text-dark">Pièces min</label>
                  <select class="form-select form-select-sm" [(ngModel)]="filters.nb_pieces" name="nb_pieces" (change)="loadLogements()">
                    <option [ngValue]="null">Toutes</option>
                    <option [ngValue]="1">1+ pièce</option>
                    <option [ngValue]="2">2+ pièces</option>
                    <option [ngValue]="3">3+ pièces</option>
                    <option [ngValue]="4">4+ pièces</option>
                    <option [ngValue]="5">5+ pièces</option>
                  </select>
                </div>
                <div class="col-6">
                  <label class="form-label small fw-semibold text-dark">Surface min</label>
                  <div class="input-group input-group-md">
                    <input type="number" class="form-control" placeholder="m²" [(ngModel)]="filters.surface_min" name="surface_min" min="0" (change)="loadLogements()">
                    <span class="input-group-text bg-light text-muted">m²</span>
                  </div>
                </div>
              </div>

              <!-- 6. Ameublement -->
              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark d-block mb-1">Ameublement</label>
                <div class="btn-group btn-group-sm w-100" role="group">
                  <input type="radio" class="btn-check" name="meubleRadio" id="meubleTous" value="tous" [(ngModel)]="filters.meuble" (change)="loadLogements()">
                  <label class="btn btn-outline-primary" for="meubleTous">Tous</label>

                  <input type="radio" class="btn-check" name="meubleRadio" id="meubleOui" value="true" [(ngModel)]="filters.meuble" (change)="loadLogements()">
                  <label class="btn btn-outline-primary" for="meubleOui">Meublé</label>

                  <input type="radio" class="btn-check" name="meubleRadio" id="meubleNon" value="false" [(ngModel)]="filters.meuble" (change)="loadLogements()">
                  <label class="btn btn-outline-primary" for="meubleNon">Vide</label>
                </div>
              </div>

              <!-- 7. Disponibilité immédiate -->
              <div class="form-check form-switch mb-3">
                <input class="form-check-input" type="checkbox" id="dispoSwitch" [checked]="filters.disponibilite === 'disponible'" (change)="toggleDisponibilite($event)">
                <label class="form-check-label small fw-medium text-dark" for="dispoSwitch">
                  <i class="bi bi-check2-circle text-success me-1"></i>Uniquement disponibles
                </label>
              </div>

              <!-- 8. Mode de réservation -->
              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark">Mode de réservation</label>
                <select class="form-select form-select-sm" [(ngModel)]="filters.mode_reservation" name="mode_reservation" (change)="loadLogements()">
                  <option value="tous">Tous modes</option>
                  <option value="immediate">⚡ Réservation instantanée</option>
                  <option value="sur_validation">🕒 Sur validation gestionnaire</option>
                </select>
              </div>

              <!-- 9. Équipements clés -->
              <div class="mb-3">
                <div class="d-flex align-items-center justify-content-between mb-1">
                  <label class="form-label small fw-semibold text-dark mb-0">Équipements indispensables</label>
                  @if (selectedEquipements.size > 0) {
                    <span class="badge bg-primary rounded-pill small" style="font-size: 10px;">{{ selectedEquipements.size }}</span>
                  }
                </div>
                <div class="d-flex flex-wrap gap-1" style="max-height: 160px; overflow-y: auto;">
                  @for (eq of equipementsList; track eq.id) {
                    <button 
                      type="button" 
                      class="btn btn-sm rounded-2 py-1 px-2 border mb-1" 
                      [class.btn-primary]="isEquipementSelected(eq.id)"
                      [class.btn-light]="!isEquipementSelected(eq.id)"
                      (click)="toggleEquipement(eq.id)">
                      <i class="bi" [ngClass]="eq.icone"></i> {{ eq.nom }}
                    </button>
                  }
                </div>
              </div>

              <!-- Actions -->
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary btn-sm rounded-2 py-2 fw-semibold">
                  <i class="bi bi-filter me-1"></i> Appliquer les filtres
                </button>
                @if (hasActiveFilters) {
                  <button type="button" class="btn btn-outline-secondary btn-sm rounded-2 py-1" (click)="resetFilters()">
                    Effacer tous les filtres
                  </button>
                }
              </div>
            </form>
          </div>
        </div>

        <!-- Zone d'affichage : Liste et/ou Carte -->
        <div class="col-lg-9">
          <!-- Bandeau interactif des filtres actifs -->
          @if (hasActiveFilters) {
            <div class="card border-0 shadow-sm rounded-3 p-2 px-3 mb-3 bg-white d-flex flex-row align-items-center justify-content-between flex-wrap gap-2">
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <span class="small fw-semibold text-dark"><i class="bi bi-funnel-fill text-primary me-1"></i>Filtres actifs :</span>
                @if (filters.q) {
                  <span class="badge bg-light text-dark border py-1 px-2 d-inline-flex align-items-center gap-1">
                    « {{ filters.q }} »
                    <i class="bi bi-x-circle-fill text-muted" style="cursor: pointer;" (click)="filters.q = ''; loadLogements()"></i>
                  </span>
                }
                @if (filters.ville && filters.ville !== 'toutes') {
                  <span class="badge bg-light text-dark border py-1 px-2 d-inline-flex align-items-center gap-1">
                    Ville : {{ filters.ville }}
                    <i class="bi bi-x-circle-fill text-muted" style="cursor: pointer;" (click)="filters.ville = 'toutes'; onVilleChange()"></i>
                  </span>
                }
                @if (filters.quartier && filters.quartier.trim()) {
                  <span class="badge bg-light text-dark border py-1 px-2 d-inline-flex align-items-center gap-1">
                    Quartier : {{ filters.quartier }}
                    <i class="bi bi-x-circle-fill text-muted" style="cursor: pointer;" (click)="filters.quartier = ''; loadLogements()"></i>
                  </span>
                }
                @if (filters.type && filters.type !== 'tous') {
                  <span class="badge bg-light text-dark border py-1 px-2 d-inline-flex align-items-center gap-1">
                    Type : {{ filters.type | uppercase }}
                    <i class="bi bi-x-circle-fill text-muted" style="cursor: pointer;" (click)="filters.type = 'tous'; loadLogements()"></i>
                  </span>
                }
                @if (filters.prix_min && filters.prix_min > 0) {
                  <span class="badge bg-light text-dark border py-1 px-2 d-inline-flex align-items-center gap-1">
                    ≥ {{ filters.prix_min | number }} F
                    <i class="bi bi-x-circle-fill text-muted" style="cursor: pointer;" (click)="filters.prix_min = null; loadLogements()"></i>
                  </span>
                }
                @if (filters.prix_max && filters.prix_max < 1500000) {
                  <span class="badge bg-light text-dark border py-1 px-2 d-inline-flex align-items-center gap-1">
                    ≤ {{ filters.prix_max | number }} F
                    <i class="bi bi-x-circle-fill text-muted" style="cursor: pointer;" (click)="filters.prix_max = 1500000; loadLogements()"></i>
                  </span>
                }
                @if (filters.surface_min && filters.surface_min > 0) {
                  <span class="badge bg-light text-dark border py-1 px-2 d-inline-flex align-items-center gap-1">
                    ≥ {{ filters.surface_min }} m²
                    <i class="bi bi-x-circle-fill text-muted" style="cursor: pointer;" (click)="filters.surface_min = null; loadLogements()"></i>
                  </span>
                }
                @if (filters.nb_pieces) {
                  <span class="badge bg-light text-dark border py-1 px-2 d-inline-flex align-items-center gap-1">
                    ≥ {{ filters.nb_pieces }} pièce(s)
                    <i class="bi bi-x-circle-fill text-muted" style="cursor: pointer;" (click)="filters.nb_pieces = null; loadLogements()"></i>
                  </span>
                }
                @if (filters.meuble !== 'tous' && filters.meuble !== null && filters.meuble !== undefined) {
                  <span class="badge bg-light text-dark border py-1 px-2 d-inline-flex align-items-center gap-1">
                    {{ filters.meuble === 'true' ? 'Meublé' : 'Vide' }}
                    <i class="bi bi-x-circle-fill text-muted" style="cursor: pointer;" (click)="filters.meuble = 'tous'; loadLogements()"></i>
                  </span>
                }
                @if (filters.disponibilite === 'disponible') {
                  <span class="badge bg-success-subtle text-success border border-success-subtle py-1 px-2 d-inline-flex align-items-center gap-1">
                    Disponibles uniquement
                    <i class="bi bi-x-circle-fill text-success" style="cursor: pointer;" (click)="filters.disponibilite = 'tous'; loadLogements()"></i>
                  </span>
                }
                @if (filters.mode_reservation && filters.mode_reservation !== 'tous') {
                  <span class="badge bg-light text-dark border py-1 px-2 d-inline-flex align-items-center gap-1">
                    {{ filters.mode_reservation === 'immediate' ? 'Instantanée' : 'Sur demande' }}
                    <i class="bi bi-x-circle-fill text-muted" style="cursor: pointer;" (click)="filters.mode_reservation = 'tous'; loadLogements()"></i>
                  </span>
                }
                @if (selectedEquipements.size > 0) {
                  <span class="badge bg-primary-subtle text-primary border border-primary-subtle py-1 px-2 d-inline-flex align-items-center gap-1">
                    {{ selectedEquipements.size }} équipement(s)
                    <i class="bi bi-x-circle-fill text-primary" style="cursor: pointer;" (click)="selectedEquipements.clear(); loadLogements()"></i>
                  </span>
                }
              </div>
              <button class="btn btn-link btn-sm text-danger text-decoration-none p-0 small fw-semibold" (click)="resetFilters()">
                <i class="bi bi-trash me-1"></i>Effacer tout
              </button>
            </div>
          }
          <div class="row g-3">
            <!-- ================================================================= -->
            <!-- SECTION LOGEMENTS (DESKTOP GRID + MOBILE CAROUSEL HORIZONTAL)     -->
            <!-- ================================================================= -->
            @if (viewMode === 'list' || viewMode === 'split') {
              <div [ngClass]="{'col-lg-6': viewMode === 'split', 'col-12': viewMode === 'list'}">
                
                <!-- 1. AFFICHAGE DESKTOP (Grille verticale classique >= 992px) -->
                <div class="row g-3 d-none d-lg-flex">
                  @for (logement of logements; track logement.id) {
                    <div [ngClass]="{'col-12': viewMode === 'split', 'col-md-6 col-lg-4': viewMode === 'list'}">
                      <div class="card housing-card border-0" (mouseenter)="highlightMarker(logement.id)">
                        <div class="card-img-wrapper position-relative">
                          <img [src]="logement.image_principale" [alt]="logement.titre" loading="lazy">
                          <span class="badge-type text-uppercase">{{ logement.type }}</span>
                          <button class="fav-btn" type="button" (click)="toggleFav(logement); $event.stopPropagation()" [title]="isFav(logement.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'">
                            <i class="bi" [class.bi-heart-fill]="isFav(logement.id)" [class.bi-heart]="!isFav(logement.id)"></i>
                          </button>
                          @if (logement.est_occupe || logement.statut === 'occupe') {
                            <span class="position-absolute bottom-0 end-0 m-2 badge bg-danger text-white py-1 px-2 shadow-sm fw-bold" style="font-size: 11px; z-index: 2;">
                              <i class="bi bi-lock-fill me-1"></i> Logement Occupé
                            </span>
                          }
                          @if (logement.mode_reservation === 'immediate') {
                            <span class="position-absolute bottom-0 start-0 m-2 badge bg-success text-white small">
                              <i class="bi bi-lightning-fill"></i> Instantanée
                            </span>
                          }
                        </div>

                        <div class="card-body p-3">
                          <div class="d-flex justify-content-between text-muted small mb-1">
                            <span><i class="bi bi-geo-alt text-primary me-1"></i>{{ logement.ville }} • {{ logement.quartier }}</span>
                            <span class="text-warning fw-semibold"><i class="bi bi-star-fill me-1"></i>{{ logement.note_moyenne }}</span>
                          </div>

                          <h3 class="card-title h6 fw-bold mb-2 text-truncate" [title]="logement.titre">
                            @if (logement.est_occupe || logement.statut === 'occupe') {
                              <span class="text-muted">{{ logement.titre }}</span>
                            } @else {
                              <a [routerLink]="['/logements', logement.id]" class="text-decoration-none text-dark">
                                {{ logement.titre }}
                              </a>
                            }
                          </h3>

                          <div class="d-flex align-items-center gap-2 mb-3 text-secondary small">
                            <span class="badge bg-light text-dark border p-1">{{ logement.nb_pieces }} pce(s)</span>
                            <span class="badge bg-light text-dark border p-1">{{ logement.surface }} m²</span>
                            @if (logement.meuble) {
                              <span class="badge bg-light text-dark border p-1">Meublé</span>
                            }
                          </div>

                          <div class="d-flex align-items-center justify-content-between pt-2 border-top">
                            <div>
                              <span class="fw-bold fs-5 text-primary tabular-numbers">
                                {{ logement.prix_par_mois }}
                              </span>
                              <span class="text-muted small" style="font-size: 11px;"> CFA / mois</span>
                            </div>
                            @if (logement.est_occupe || logement.statut === 'occupe') {
                              <button class="btn btn-secondary btn-sm rounded-2 px-3 disabled" disabled title="Ce logement est actuellement occupé">
                                <i class="bi bi-lock-fill me-1"></i> Occupé
                              </button>
                            } @else {
                              <a [routerLink]="['/logements', logement.id]" class="btn btn-outline-primary btn-sm rounded-2 px-3">
                                Consulter
                              </a>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  } @empty {
                    <div class="col-12 text-center py-5">
                      <i class="bi bi-house-x text-muted display-4 mb-3"></i>
                      <h3 class="h5 fw-bold">Aucun logement ne correspond à vos filtres</h3>
                      <p class="text-muted small">Essayez d'élargir votre recherche ou de réinitialiser les filtres.</p>
                      <button class="btn btn-outline-primary btn-sm rounded-2" (click)="resetFilters()">
                        Réinitialiser tous les filtres
                      </button>
                    </div>
                  }
                </div>

                <!-- 2. AFFICHAGE MOBILE (Carrousel horizontal avec navigation tactile & boutons < 992px) -->
                <div class="mobile-carousel-section d-lg-none">
                  @if (logements.length > 0) {
                    <!-- Barre de navigation du carrousel -->
                    <div class="d-flex align-items-center justify-content-between mb-2 px-1">
                      <div class="small fw-semibold text-dark d-flex align-items-center gap-1">
                        <i class="bi bi-houses-fill text-primary"></i>
                        <span>Logement {{ currentCarouselIndex + 1 }} sur {{ logements.length }}</span>
                      </div>
                      
                      @if (logements.length > 1) {
                        <div class="carousel-nav-arrows d-flex align-items-center gap-1">
                          <button 
                            type="button" 
                            class="btn btn-sm btn-white border shadow-xs rounded-circle p-0 d-flex align-items-center justify-content-center"
                            style="width: 32px; height: 32px; background: #fff;"
                            [disabled]="currentCarouselIndex === 0"
                            (click)="scrollCarousel('prev')"
                            aria-label="Logement précédent">
                            <i class="bi bi-chevron-left"></i>
                          </button>
                          <button 
                            type="button" 
                            class="btn btn-sm btn-white border shadow-xs rounded-circle p-0 d-flex align-items-center justify-content-center"
                            style="width: 32px; height: 32px; background: #fff;"
                            [disabled]="currentCarouselIndex >= logements.length - 1"
                            (click)="scrollCarousel('next')"
                            aria-label="Logement suivant">
                            <i class="bi bi-chevron-right"></i>
                          </button>
                        </div>
                      }
                    </div>

                    <!-- Piste de carrousel horizontale (Swipe & Snap) -->
                    <div #carouselTrack class="mobile-carousel-track" (scroll)="onCarouselScroll($event)">
                      @for (logement of logements; track logement.id; let idx = $index) {
                        <div class="mobile-carousel-slide" [attr.data-index]="idx">
                          <div class="card housing-card border-0 h-100 shadow-sm" (click)="onMobileCardClick(logement)">
                            <div class="card-img-wrapper position-relative">
                              <img [src]="logement.image_principale" [alt]="logement.titre" loading="lazy">
                              <span class="badge-type text-uppercase">{{ logement.type }}</span>
                              <button 
                                class="fav-btn" 
                                type="button" 
                                (click)="toggleFav(logement); $event.stopPropagation()" 
                                [title]="isFav(logement.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'">
                                <i class="bi" [class.bi-heart-fill]="isFav(logement.id)" [class.bi-heart]="!isFav(logement.id)"></i>
                              </button>
                              @if (logement.est_occupe || logement.statut === 'occupe') {
                                <span class="position-absolute bottom-0 end-0 m-2 badge bg-danger text-white py-1 px-2 shadow-sm fw-bold" style="font-size: 11px; z-index: 2;">
                                  <i class="bi bi-lock-fill me-1"></i> Occupé
                                </span>
                              }
                              @if (logement.mode_reservation === 'immediate') {
                                <span class="position-absolute bottom-0 start-0 m-2 badge bg-success text-white small">
                                  <i class="bi bi-lightning-fill"></i> Instantanée
                                </span>
                              }
                            </div>

                            <div class="card-body p-3">
                              <div class="d-flex justify-content-between text-muted small mb-1">
                                <span class="text-truncate" style="max-width: 70%;">
                                  <i class="bi bi-geo-alt text-primary me-1"></i>{{ logement.ville }} • {{ logement.quartier }}
                                </span>
                                <span class="text-warning fw-semibold">
                                  <i class="bi bi-star-fill me-1"></i>{{ logement.note_moyenne }}
                                </span>
                              </div>

                              <h3 class="card-title h6 fw-bold mb-2 text-truncate" [title]="logement.titre">
                                @if (logement.est_occupe || logement.statut === 'occupe') {
                                  <span class="text-muted">{{ logement.titre }}</span>
                                } @else {
                                  <a [routerLink]="['/logements', logement.id]" class="text-decoration-none text-dark">
                                    {{ logement.titre }}
                                  </a>
                                }
                              </h3>

                              <div class="d-flex align-items-center gap-2 mb-3 text-secondary small">
                                <span class="badge bg-light text-dark border p-1">{{ logement.nb_pieces }} pce(s)</span>
                                <span class="badge bg-light text-dark border p-1">{{ logement.surface }} m²</span>
                                @if (logement.meuble) {
                                  <span class="badge bg-light text-dark border p-1">Meublé</span>
                                }
                              </div>

                              <div class="d-flex align-items-center justify-content-between pt-2 border-top">
                                <div>
                                  <span class="fw-bold fs-6 text-primary tabular-numbers">
                                    {{ logement.prix_par_mois }}
                                  </span>
                                  <span class="text-muted small" style="font-size: 10px;"> CFA / mois</span>
                                </div>
                                @if (logement.est_occupe || logement.statut === 'occupe') {
                                  <button class="btn btn-secondary btn-sm rounded-2 px-3 disabled" disabled>
                                    <i class="bi bi-lock-fill me-1"></i> Occupé
                                  </button>
                                } @else {
                                  <a [routerLink]="['/logements', logement.id]" class="btn btn-outline-primary btn-sm rounded-2 px-3 fw-semibold">
                                    Consulter
                                  </a>
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  } @else {
                    <div class="w-100 text-center py-4 px-3 bg-white rounded-4 border shadow-xs my-2">
                      <i class="bi bi-house-x text-muted display-6 mb-2 d-block"></i>
                      <h4 class="h6 fw-bold text-dark">Aucun logement ne correspond à vos filtres</h4>
                      <p class="text-muted small mb-3">Essayez d'élargir votre recherche ou d'effacer les critères.</p>
                      <button class="btn btn-outline-primary btn-sm rounded-2 px-3 fw-semibold" (click)="resetFilters()">
                        <i class="bi bi-arrow-counterclockwise me-1"></i>Réinitialiser les filtres
                      </button>
                    </div>
                  }
                </div>

              </div>
            }

            <!-- ================================================================= -->
            <!-- COLONNE CARTE INTERACTIVE LEAFLET (CDC RF-13)                     -->
            <!-- ================================================================= -->
            @if (viewMode === 'map' || viewMode === 'split') {
              <div [ngClass]="{'col-lg-6': viewMode === 'split', 'col-12': viewMode === 'map', 'order-first order-lg-last': viewMode === 'split'}">
                <div class="card border-0 shadow-sm rounded-4 overflow-hidden map-wrapper-card" [class.map-view-fullscreen]="viewMode === 'map'">
                  <div #mapContainer id="mapContainer" style="width: 100%; height: 100%;"></div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- FENÊTRE MODALE DES FILTRES MOBILE (Modal / Bottom Sheet < 992px)  -->
      <!-- ================================================================= -->
      @if (isMobileFilterOpen) {
        <div class="mobile-filter-modal-backdrop" (click)="closeMobileFilters()">
          <div class="mobile-filter-modal-sheet rounded-top-4 shadow-2xl" (click)="$event.stopPropagation()">
            
            <!-- En-tête de la modale avec bouton Effacer et Fermer -->
            <div class="mobile-filter-modal-header p-3 border-bottom d-flex align-items-center justify-content-between bg-white sticky-top">
              <div class="d-flex align-items-center gap-2">
                <div class="icon-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center rounded-circle" style="width: 32px; height: 32px;">
                  <i class="bi bi-sliders2"></i>
                </div>
                <div>
                  <h5 class="h6 fw-bold mb-0 text-dark">Filtres de recherche</h5>
                  <small class="text-muted" style="font-size: 11px;">Affinez vos critères pour vos logements</small>
                </div>
              </div>

              <div class="d-flex align-items-center gap-2">
                <button type="button" class="btn btn-sm btn-link text-danger p-0 text-decoration-none small fw-semibold" (click)="resetMobileFilters()">
                  Effacer
                </button>
                <button type="button" class="btn-close shadow-none" (click)="closeMobileFilters()" aria-label="Fermer"></button>
              </div>
            </div>

            <!-- Corps défilant verticalement avec l'ensemble des filtres existants -->
            <div class="mobile-filter-modal-body p-3 bg-light-subtle">
              
              <!-- 1. Recherche par mot-clé -->
              <div class="card border-0 rounded-3 p-3 mb-2 bg-white shadow-xs">
                <label class="form-label small fw-semibold text-dark mb-1">Recherche par mot-clé</label>
                <div class="input-group input-group-sm">
                  <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
                  <input 
                    type="text" 
                    class="form-control border-start-0" 
                    placeholder="Titre, adresse, mot..." 
                    [(ngModel)]="tempFilters.q">
                  @if (tempFilters.q) {
                    <button class="btn btn-outline-secondary border-start-0" type="button" (click)="tempFilters.q = ''">
                      <i class="bi bi-x"></i>
                    </button>
                  }
                </div>
              </div>

              <!-- 2. Localisation précise : Ville & Quartier -->
              <div class="card border-0 rounded-3 p-3 mb-2 bg-white shadow-xs">
                <label class="form-label small fw-semibold text-dark mb-1">Localisation au Sénégal</label>
                <div class="mb-2">
                  <label class="small text-muted mb-1" style="font-size: 11px;">Ville</label>
                  <select class="form-select form-select-sm" [(ngModel)]="tempFilters.ville" (change)="onTempVilleChange()">
                    <option value="toutes">Toutes les villes</option>
                    @for (v of villesDisponibles; track v) {
                      <option [value]="v">{{ v }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="small text-muted mb-1" style="font-size: 11px;">Quartier</label>
                  <input 
                    type="text" 
                    class="form-control form-control-sm" 
                    placeholder="Ex: Almadies, Plateau, Sanar..." 
                    [(ngModel)]="tempFilters.quartier" 
                    list="tempQuartiersDatalist">
                  <datalist id="tempQuartiersDatalist">
                    @for (q of tempQuartiersDisponibles; track q) {
                      <option [value]="q"></option>
                    }
                  </datalist>
                </div>
              </div>

              <!-- 3. Type de bien -->
              <div class="card border-0 rounded-3 p-3 mb-2 bg-white shadow-xs">
                <label class="form-label small fw-semibold text-dark mb-1">Type de bien</label>
                <select class="form-select form-select-sm" [(ngModel)]="tempFilters.type">
                  <option value="tous">Tous les types</option>
                  <option value="appartement">Appartement</option>
                  <option value="studio">Studio</option>
                  <option value="maison">Maison / Villa</option>
                  <option value="chambre">Chambre</option>
                </select>
              </div>

              <!-- 4. Budget mensuel (Min & Max + Slider + Raccourcis) -->
              <div class="card border-0 rounded-3 p-3 mb-2 bg-white shadow-xs">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <label class="form-label small fw-semibold text-dark mb-0">Loyer mensuel (FCFA)</label>
                  <span class="text-primary fw-bold small tabular-numbers">
                    {{ (tempFilters.prix_min || 0) | number }} - {{ tempFilters.prix_max | number }} F
                  </span>
                </div>
                <div class="row g-2 mb-2">
                  <div class="col-6">
                    <input 
                      type="number" 
                      class="form-control form-control-sm" 
                      placeholder="Min (FCFA)" 
                      [(ngModel)]="tempFilters.prix_min" 
                      min="0" 
                      step="10000">
                  </div>
                  <div class="col-6">
                    <input 
                      type="number" 
                      class="form-control form-control-sm" 
                      placeholder="Max (FCFA)" 
                      [(ngModel)]="tempFilters.prix_max" 
                      min="10000" 
                      step="25000">
                  </div>
                </div>
                <input 
                  type="range" 
                  class="form-range mb-2" 
                  min="50000" 
                  max="1500000" 
                  step="25000" 
                  [(ngModel)]="tempFilters.prix_max">
                <div class="d-flex flex-wrap gap-1">
                  <button type="button" class="btn btn-outline-secondary btn-sm py-0 px-2 rounded-2" style="font-size: 11px;" (click)="setTempPrixPreset(null, 200000)">&lt; 200k</button>
                  <button type="button" class="btn btn-outline-secondary btn-sm py-0 px-2 rounded-2" style="font-size: 11px;" (click)="setTempPrixPreset(200000, 500000)">200k-500k</button>
                  <button type="button" class="btn btn-outline-secondary btn-sm py-0 px-2 rounded-2" style="font-size: 11px;" (click)="setTempPrixPreset(500000, 1000000)">500k-1M</button>
                  <button type="button" class="btn btn-outline-secondary btn-sm py-0 px-2 rounded-2" style="font-size: 11px;" (click)="setTempPrixPreset(1000000, null)">&gt; 1M</button>
                </div>
              </div>

              <!-- 5. Pièces min & Surface min -->
              <div class="card border-0 rounded-3 p-3 mb-2 bg-white shadow-xs">
                <div class="row g-2">
                  <div class="col-6">
                    <label class="form-label small fw-semibold text-dark mb-1">Pièces min</label>
                    <select class="form-select form-select-sm" [(ngModel)]="tempFilters.nb_pieces">
                      <option [ngValue]="null">Toutes</option>
                      <option [ngValue]="1">1+ pièce</option>
                      <option [ngValue]="2">2+ pièces</option>
                      <option [ngValue]="3">3+ pièces</option>
                      <option [ngValue]="4">4+ pièces</option>
                      <option [ngValue]="5">5+ pièces</option>
                    </select>
                  </div>
                  <div class="col-6">
                    <label class="form-label small fw-semibold text-dark mb-1">Surface min</label>
                    <div class="input-group input-group-sm">
                      <input type="number" class="form-control" placeholder="m²" [(ngModel)]="tempFilters.surface_min" min="0">
                      <span class="input-group-text bg-light text-muted">m²</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 6. Ameublement -->
              <div class="card border-0 rounded-3 p-3 mb-2 bg-white shadow-xs">
                <label class="form-label small fw-semibold text-dark mb-1">Ameublement</label>
                <div class="btn-group btn-group-sm w-100" role="group">
                  <input type="radio" class="btn-check" name="tempMeubleRadio" id="tempMeubleTous" value="tous" [(ngModel)]="tempFilters.meuble">
                  <label class="btn btn-outline-primary" for="tempMeubleTous">Tous</label>

                  <input type="radio" class="btn-check" name="tempMeubleRadio" id="tempMeubleOui" value="true" [(ngModel)]="tempFilters.meuble">
                  <label class="btn btn-outline-primary" for="tempMeubleOui">Meublé</label>

                  <input type="radio" class="btn-check" name="tempMeubleRadio" id="tempMeubleNon" value="false" [(ngModel)]="tempFilters.meuble">
                  <label class="btn btn-outline-primary" for="tempMeubleNon">Vide</label>
                </div>
              </div>

              <!-- 7. Disponibilité immédiate -->
              <div class="card border-0 rounded-3 p-3 mb-2 bg-white shadow-xs">
                <div class="form-check form-switch m-0">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    id="tempDispoSwitch" 
                    [checked]="tempFilters.disponibilite === 'disponible'" 
                    (change)="tempFilters.disponibilite = $any($event.target).checked ? 'disponible' : 'tous'">
                  <label class="form-check-label small fw-semibold text-dark" for="tempDispoSwitch">
                    <i class="bi bi-check2-circle text-success me-1"></i>Uniquement disponibles
                  </label>
                </div>
              </div>

              <!-- 8. Mode de réservation -->
              <div class="card border-0 rounded-3 p-3 mb-2 bg-white shadow-xs">
                <label class="form-label small fw-semibold text-dark mb-1">Mode de réservation</label>
                <select class="form-select form-select-sm" [(ngModel)]="tempFilters.mode_reservation">
                  <option value="tous">Tous modes</option>
                  <option value="immediate">⚡ Réservation instantanée</option>
                  <option value="sur_validation">🕒 Sur validation gestionnaire</option>
                </select>
              </div>

              <!-- 9. Équipements indispensables -->
              <div class="card border-0 rounded-3 p-3 mb-2 bg-white shadow-xs">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <label class="form-label small fw-semibold text-dark mb-0">Équipements indispensables</label>
                  @if (tempSelectedEquipements.size > 0) {
                    <span class="badge bg-primary rounded-pill small">{{ tempSelectedEquipements.size }}</span>
                  }
                </div>
                <div class="d-flex flex-wrap gap-1">
                  @for (eq of equipementsList; track eq.id) {
                    <button 
                      type="button" 
                      class="btn btn-sm rounded-2 py-1 px-2 border" 
                      [class.btn-primary]="isTempEquipementSelected(eq.id)"
                      [class.btn-light]="!isTempEquipementSelected(eq.id)"
                      (click)="toggleTempEquipement(eq.id)">
                      <i class="bi" [ngClass]="eq.icone"></i> {{ eq.nom }}
                    </button>
                  }
                </div>
              </div>

            </div>

            <!-- Barre d'action fixe en bas avec Fermer et Appliquer -->
            <div class="mobile-filter-modal-footer p-3 border-top bg-white d-flex gap-2 sticky-bottom">
              <button type="button" class="btn btn-light border flex-grow-1 py-2 fw-semibold rounded-3 text-muted" (click)="closeMobileFilters()">
                Fermer
              </button>
              <button type="button" class="btn btn-primary flex-grow-1 py-2 fw-bold rounded-3 shadow-sm d-inline-flex align-items-center justify-content-center gap-1" (click)="applyMobileFilters()">
                <i class="bi bi-check-lg fs-5"></i>
                <span>Appliquer</span>
              </button>
            </div>

          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    /* =================================================================== */
    /* RÈGLES RÉSERVÉES STRICTEMENT AU MOBILE (< 992px)                    */
    /* =================================================================== */
    @media (max-width: 991.98px) {
      .mobile-control-bar { position: relative; z-index: 5; }
      .mobile-tools-row { box-shadow: 0 2px 8px rgba(11, 61, 145, 0.06); }

      /* Modale Bottom Sheet pour Filtres Mobiles */
      .mobile-filter-modal-backdrop {
        position: fixed; inset: 0;
        background: rgba(15, 23, 42, 0.65);
        backdrop-filter: blur(4px);
        z-index: 10050;
        display: flex; align-items: flex-end;
        animation: mobileFadeIn 0.2s ease-out;
      }

      .mobile-filter-modal-sheet {
        width: 100%;
        max-height: 90vh;
        background: #FFFFFF;
        display: flex; flex-direction: column;
        animation: mobileSlideUp 0.26s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .mobile-filter-modal-body {
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        max-height: calc(90vh - 135px);
      }

      /* Carrousel horizontal mobile */
      .mobile-carousel-track {
        display: flex;
        gap: 14px;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        -webkit-overflow-scrolling: touch;
        padding: 4px 2px 12px 2px;
        scrollbar-width: none;
        &::-webkit-scrollbar { display: none; }
      }

      .mobile-carousel-slide {
        flex: 0 0 calc(100vw - 44px);
        max-width: 360px;
        scroll-snap-align: center;
        scroll-snap-stop: always;
      }

      /* Adaptation carte Leaflet sur mobile */
      .map-wrapper-card {
        height: 280px !important;
        position: relative !important;
        top: 0 !important;
        margin-bottom: 6px;
      }

      .map-wrapper-card.map-view-fullscreen {
        height: calc(100vh - 190px) !important;
      }
    }

    /* =================================================================== */
    /* STYLES DESKTOP (>= 992px) - PRÉSERVATION INTEGRALE                  */
    /* =================================================================== */
    @media (min-width: 992px) {
      .map-wrapper-card {
        height: 75vh;
        position: sticky;
        top: 80px;
      }
    }

    @keyframes mobileSlideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    @keyframes mobileFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class LogementListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainerRef?: ElementRef;
  @ViewChild('carouselTrack') carouselTrackRef?: ElementRef;

  logements: Logement[] = [];
  equipementsList: Equipement[] = [];
  selectedEquipements = new Set<number>();
  viewMode: 'split' | 'list' | 'map' = 'split';

  // État du carrousel mobile (< 992px)
  currentCarouselIndex: number = 0;

  // État de la fenêtre modale des filtres mobiles
  isMobileFilterOpen: boolean = false;
  tempFilters: any = {};
  tempSelectedEquipements = new Set<number>();
  tempQuartiersDisponibles: string[] = [];

  villesDisponibles = ['Dakar', 'Saint-Louis', 'Saly', 'Mbour', 'Thiès', 'Ziguinchor'];
  quartiersDisponibles: string[] = [];

  filters: any = {
    q: '',
    ville: 'toutes',
    quartier: '',
    type: 'tous',
    prix_min: null,
    prix_max: 1500000,
    surface_min: null,
    surface_max: null,
    nb_pieces: null,
    meuble: 'tous',
    disponibilite: 'tous',
    mode_reservation: 'tous',
    tri: 'pertinence'
  };

  private searchDebounceTimer?: any;
  private map: any = null;
  private markersMap = new Map<number, any>();
  private isBrowser: boolean;

  private cdr = inject(ChangeDetectorRef);
  public favoriService = inject(FavoriService);
  public auth = inject(AuthService);
  private modalAlert = inject(ModalAlertService);

  constructor(
    private logementService: LogementService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // Initialisation synchrone immédiate pour affichage sans délai
    this.logements = this.logementService.getSenegalCatalog();
    this.cdr.markForCheck();

    this.route.queryParams.subscribe(params => {
      if (params['q']) this.filters.q = params['q'];
      if (params['ville']) this.filters.ville = params['ville'];
      if (params['quartier']) this.filters.quartier = params['quartier'];
      if (params['type']) this.filters.type = params['type'];
      if (params['prix_min']) this.filters.prix_min = Number(params['prix_min']);
      if (params['prix_max']) this.filters.prix_max = Number(params['prix_max']);
      if (params['surface_min']) this.filters.surface_min = Number(params['surface_min']);
      if (params['surface_max']) this.filters.surface_max = Number(params['surface_max']);
      if (params['nb_pieces']) this.filters.nb_pieces = Number(params['nb_pieces']);
      if (params['meuble']) this.filters.meuble = params['meuble'];
      if (params['disponibilite']) this.filters.disponibilite = params['disponibilite'];
      if (params['mode_reservation']) this.filters.mode_reservation = params['mode_reservation'];
      if (params['tri']) this.filters.tri = params['tri'];
      this.initQuartiersForVille();
      this.loadLogements();
    });

    this.logementService.getEquipements().subscribe(eqs => {
      this.equipementsList = eqs;
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => this.initMap(), 300);
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser && typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  setViewMode(mode: 'split' | 'list' | 'map'): void {
    this.viewMode = mode;
    if (mode !== 'list') {
      setTimeout(() => {
        if (!this.map) {
          this.initMap();
        } else {
          this.map.invalidateSize();
        }
      }, 200);
    }
  }

  loadLogements(): void {
    const params: any = { ...this.filters };
    if (this.selectedEquipements.size > 0) {
      params.equipements = Array.from(this.selectedEquipements).join(',');
    }

    this.logementService.getLogements(params).subscribe({
      next: (data) => {
        this.logements = data;
        this.currentCarouselIndex = 0;
        if (this.carouselTrackRef?.nativeElement) {
          this.carouselTrackRef.nativeElement.scrollLeft = 0;
        }
        this.cdr.markForCheck();
        if (this.map) {
          this.updateMapMarkers();
        }
      },
      error: (err) => {
        console.error(err);
        this.cdr.markForCheck();
      }
    });
  }

  private initMap(): void {
    if (!this.isBrowser || typeof L === 'undefined') return;
    const container = document.getElementById('mapContainer');
    if (!container || this.map) return;

    // Coordonnées par défaut : Dakar, Sénégal
    this.map = L.map(container).setView([14.7167, -17.4677], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(this.map);

    this.updateMapMarkers();
  }

  private updateMapMarkers(): void {
    if (!this.map || typeof L === 'undefined') return;

    // Nettoyer anciens marqueurs
    this.markersMap.forEach(m => this.map.removeLayer(m));
    this.markersMap.clear();

    const bounds: any[] = [];

    this.logements.forEach(logement => {
      let lat = logement.latitude;
      let lng = logement.longitude;

      if (!lat || !lng || lat < 11 || lat > 18) {
        const geo = geocodeSenegal(logement.ville, logement.quartier);
        lat = geo.lat;
        lng = geo.lng;
        logement.latitude = lat;
        logement.longitude = lng;
      }

      if (lat && lng) {
        const customIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `
            <div class="map-price-bubble" style="background:#0B3D91;color:#FFF;font-size:11px;font-weight:700;padding:4px 9px;border-radius:20px;border:2px solid #FFF;box-shadow:0 3px 10px rgba(0,0,0,0.3);white-space:nowrap;cursor:pointer;">
              <i class="bi bi-geo-alt-fill text-warning me-1"></i>${(logement.prix_par_mois / 1000).toFixed(0)}k CFA
            </div>
          `,
          iconSize: [80, 26],
          iconAnchor: [40, 13]
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(this.map);

        const popupContent = `
          <div style="max-width: 230px; font-family: 'Inter', sans-serif; padding: 6px;">
            <img src="${logement.image_principale}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;">
            <strong style="font-size: 13px; display: block; margin-bottom: 2px; color: #1F2937;">${logement.titre}</strong>
            <small style="color: #64748B; font-size: 11px; display: block; margin-bottom: 4px;">
              <i class="bi bi-geo-alt text-danger me-1"></i>${logement.quartier ? logement.quartier + ', ' : ''}${logement.ville}
            </small>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #0B3D91; font-weight: 700; font-size: 13px;">${Number(logement.prix_par_mois).toLocaleString('fr-FR')} FCFA</span>
              <span style="font-size: 10px; background: #EEF2FF; color: #0B3D91; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${(logement.type || '').toUpperCase()}</span>
            </div>
            <div>
              <a href="/logements/${logement.id}" style="display: block; text-align: center; background: #0B3D91; color: #FFF; padding: 5px 8px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: 600;">
                Voir la fiche & Réserver
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        this.markersMap.set(logement.id, marker);
        bounds.push([lat, lng]);
      }
    });

    if (bounds.length === 1) {
      this.map.setView(bounds[0], 15);
    } else if (bounds.length > 1) {
      this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }

  highlightMarker(logementId: number): void {
    const marker = this.markersMap.get(logementId);
    if (marker && this.map) {
      marker.openPopup();
    }
  }

  toggleEquipement(id: number): void {
    if (this.selectedEquipements.has(id)) {
      this.selectedEquipements.delete(id);
    } else {
      this.selectedEquipements.add(id);
    }
    this.loadLogements();
  }

  isEquipementSelected(id: number): boolean {
    return this.selectedEquipements.has(id);
  }

  toggleFav(logement: Logement): void {
    if (!this.auth.isLoggedIn()) {
      this.modalAlert.warning('Connexion requise : Vous devez être connecté à votre compte locataire pour ajouter un logement à vos favoris.', 'Compte Locataire Requis');
      this.router.navigate(['/login'], { queryParams: { redirect: '/logements' } });
      return;
    }
    this.favoriService.toggleFavori(logement);
    this.cdr.markForCheck();
  }

  isFav(id: number): boolean {
    return this.favoriService.isFavori(id);
  }

  onFilterChange(): void {
    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.loadLogements();
    }, 250);
  }

  onVilleChange(): void {
    this.initQuartiersForVille();
    this.filters.quartier = '';
    this.loadLogements();
  }

  initQuartiersForVille(): void {
    const v = (this.filters.ville || '').toLowerCase().trim();
    if (v.includes('saint-louis') || v === 'saint-louis') {
      this.quartiersDisponibles = ['Sanar', 'Sor', 'Ngallèle', 'Sanar Wolof', 'Sanar Peulh', 'Île', 'Ndar Toute', 'Guet Ndar', 'Bango', 'Hydrobase'];
    } else if (v === 'dakar') {
      this.quartiersDisponibles = ['Almadies', 'Ngor', 'Virage', 'Fann', 'Fann Résidence', 'Point E', 'Plateau', 'Mermoz', 'Sacré-Cœur', 'Liberté 6', 'Yoff', 'Mamelles', 'Ouakam', 'Maristes'];
    } else if (v.includes('saly')) {
      this.quartiersDisponibles = ['Saly Portudal', 'Somone', 'Ngaparou', 'Centre'];
    } else if (v.includes('thiès') || v === 'thies') {
      this.quartiersDisponibles = ['Cité Lamy', 'Dixième', 'Randoulène', 'Mbour 1', 'Grand Standing'];
    } else if (v.includes('mbour')) {
      this.quartiersDisponibles = ['Centre', 'Téfess', 'Grand Mbour', 'Saly Portudal'];
    } else if (v.includes('ziguinchor')) {
      this.quartiersDisponibles = ['Escale', 'Boucoum', 'Kandia', 'Kénia'];
    } else {
      this.quartiersDisponibles = [];
    }
  }

  setPrixPreset(min: number | null, max: number | null): void {
    this.filters.prix_min = min;
    this.filters.prix_max = max || 1500000;
    this.loadLogements();
  }

  toggleDisponibilite(event: any): void {
    this.filters.disponibilite = event.target?.checked ? 'disponible' : 'tous';
    this.loadLogements();
  }

  get hasActiveFilters(): boolean {
    return !!(
      (this.filters.q && this.filters.q.trim()) ||
      (this.filters.ville && this.filters.ville !== 'toutes') ||
      (this.filters.quartier && this.filters.quartier.trim()) ||
      (this.filters.type && this.filters.type !== 'tous') ||
      (this.filters.prix_min && Number(this.filters.prix_min) > 0) ||
      (this.filters.prix_max && Number(this.filters.prix_max) < 1500000) ||
      (this.filters.surface_min && Number(this.filters.surface_min) > 0) ||
      (this.filters.surface_max && Number(this.filters.surface_max) > 0) ||
      (this.filters.nb_pieces !== null && this.filters.nb_pieces !== undefined) ||
      (this.filters.meuble !== 'tous' && this.filters.meuble !== null && this.filters.meuble !== undefined) ||
      (this.filters.disponibilite && this.filters.disponibilite !== 'tous') ||
      (this.filters.mode_reservation && this.filters.mode_reservation !== 'tous') ||
      this.selectedEquipements.size > 0
    );
  }

  get activeFiltersCount(): number {
    let count = 0;
    if (this.filters.q && this.filters.q.trim()) count++;
    if (this.filters.ville && this.filters.ville !== 'toutes') count++;
    if (this.filters.quartier && this.filters.quartier.trim()) count++;
    if (this.filters.type && this.filters.type !== 'tous') count++;
    if (this.filters.prix_min && Number(this.filters.prix_min) > 0) count++;
    if (this.filters.prix_max && Number(this.filters.prix_max) < 1500000) count++;
    if (this.filters.surface_min && Number(this.filters.surface_min) > 0) count++;
    if (this.filters.surface_max && Number(this.filters.surface_max) > 0) count++;
    if (this.filters.nb_pieces !== null && this.filters.nb_pieces !== undefined) count++;
    if (this.filters.meuble !== 'tous' && this.filters.meuble !== null && this.filters.meuble !== undefined) count++;
    if (this.filters.disponibilite && this.filters.disponibilite !== 'tous') count++;
    if (this.filters.mode_reservation && this.filters.mode_reservation !== 'tous') count++;
    count += this.selectedEquipements.size;
    return count;
  }

  // =========================================================================
  // GESTION DU CARROUSEL HORIZONTAL MOBILE
  // =========================================================================
  scrollCarousel(direction: 'prev' | 'next'): void {
    if (!this.carouselTrackRef) return;
    const track = this.carouselTrackRef.nativeElement as HTMLElement;
    const slide = track.querySelector('.mobile-carousel-slide') as HTMLElement;
    const step = slide ? slide.offsetWidth + 14 : 320;
    track.scrollBy({
      left: direction === 'next' ? step : -step,
      behavior: 'smooth'
    });
  }

  onCarouselScroll(event: Event): void {
    const track = event.target as HTMLElement;
    if (!track) return;
    const slide = track.querySelector('.mobile-carousel-slide') as HTMLElement;
    const step = slide ? slide.offsetWidth + 14 : 320;
    const newIndex = Math.round(track.scrollLeft / step);
    if (newIndex >= 0 && newIndex < this.logements.length) {
      if (this.currentCarouselIndex !== newIndex) {
        this.currentCarouselIndex = newIndex;
        this.cdr.markForCheck();
      }
    }
  }

  onMobileCardClick(logement: Logement): void {
    if (this.viewMode === 'split') {
      this.highlightMarker(logement.id);
    }
  }

  // =========================================================================
  // GESTION DE LA MODALE DES FILTRES MOBILE (BOTTOM SHEET)
  // =========================================================================
  openMobileFilters(): void {
    // Clonage strict des filtres actifs pour permettre l'annulation sans effet de bord
    this.tempFilters = { ...this.filters };
    this.tempSelectedEquipements = new Set(this.selectedEquipements);
    this.initTempQuartiersForVille();
    this.isMobileFilterOpen = true;
    if (this.isBrowser && typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
    this.cdr.markForCheck();
  }

  closeMobileFilters(): void {
    this.isMobileFilterOpen = false;
    if (this.isBrowser && typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
    this.cdr.markForCheck();
  }

  applyMobileFilters(): void {
    this.filters = { ...this.tempFilters };
    this.selectedEquipements = new Set(this.tempSelectedEquipements);
    this.closeMobileFilters();
    this.loadLogements();
  }

  resetMobileFilters(): void {
    this.tempFilters = {
      q: '',
      ville: 'toutes',
      quartier: '',
      type: 'tous',
      prix_min: null,
      prix_max: 1500000,
      surface_min: null,
      surface_max: null,
      nb_pieces: null,
      meuble: 'tous',
      disponibilite: 'tous',
      mode_reservation: 'tous',
      tri: this.tempFilters.tri || 'pertinence'
    };
    this.tempSelectedEquipements.clear();
    this.tempQuartiersDisponibles = [];
    this.cdr.markForCheck();
  }

  toggleTempEquipement(id: number): void {
    if (this.tempSelectedEquipements.has(id)) {
      this.tempSelectedEquipements.delete(id);
    } else {
      this.tempSelectedEquipements.add(id);
    }
    this.cdr.markForCheck();
  }

  isTempEquipementSelected(id: number): boolean {
    return this.tempSelectedEquipements.has(id);
  }

  onTempVilleChange(): void {
    this.initTempQuartiersForVille();
    this.tempFilters.quartier = '';
    this.cdr.markForCheck();
  }

  initTempQuartiersForVille(): void {
    const v = (this.tempFilters.ville || '').toLowerCase().trim();
    if (v.includes('saint-louis') || v === 'saint-louis') {
      this.tempQuartiersDisponibles = ['Sanar', 'Sor', 'Ngallèle', 'Sanar Wolof', 'Sanar Peulh', 'Île', 'Ndar Toute', 'Guet Ndar', 'Bango', 'Hydrobase'];
    } else if (v === 'dakar') {
      this.tempQuartiersDisponibles = ['Almadies', 'Ngor', 'Virage', 'Fann', 'Fann Résidence', 'Point E', 'Plateau', 'Mermoz', 'Sacré-Cœur', 'Liberté 6', 'Yoff', 'Mamelles', 'Ouakam', 'Maristes'];
    } else if (v.includes('saly')) {
      this.tempQuartiersDisponibles = ['Saly Portudal', 'Somone', 'Ngaparou', 'Centre'];
    } else if (v.includes('thiès') || v === 'thies') {
      this.tempQuartiersDisponibles = ['Cité Lamy', 'Dixième', 'Randoulène', 'Mbour 1', 'Grand Standing'];
    } else if (v.includes('mbour')) {
      this.tempQuartiersDisponibles = ['Centre', 'Téfess', 'Grand Mbour', 'Saly Portudal'];
    } else if (v.includes('ziguinchor')) {
      this.tempQuartiersDisponibles = ['Escale', 'Boucoum', 'Kandia', 'Kénia'];
    } else {
      this.tempQuartiersDisponibles = [];
    }
  }

  setTempPrixPreset(min: number | null, max: number | null): void {
    this.tempFilters.prix_min = min;
    this.tempFilters.prix_max = max || 1500000;
    this.cdr.markForCheck();
  }

  resetFilters(): void {
    this.filters = {
      q: '',
      ville: 'toutes',
      quartier: '',
      type: 'tous',
      prix_min: null,
      prix_max: 1500000,
      surface_min: null,
      surface_max: null,
      nb_pieces: null,
      meuble: 'tous',
      disponibilite: 'tous',
      mode_reservation: 'tous',
      tri: 'pertinence'
    };
    this.selectedEquipements.clear();
    this.quartiersDisponibles = [];
    this.currentCarouselIndex = 0;
    if (this.carouselTrackRef?.nativeElement) {
      this.carouselTrackRef.nativeElement.scrollLeft = 0;
    }
    this.loadLogements();
  }
}
