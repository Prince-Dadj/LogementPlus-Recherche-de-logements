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
    <div class="container-fluid py-4 px-lg-4">
      <!-- Barre d'outils et filtres rapides -->
      <div class="row align-items-center mb-3 g-2">
        <div class="col-md-6">
          <h1 class="h4 fw-bold mb-1">Explorer les logements au Sénégal</h1>
          <p class="text-muted small mb-0">
            <span class="badge bg-primary rounded-1 me-1">{{ logements.length }}</span> 
            types de logements vérifiés
          </p>
        </div>
        <div class="col-md-6  d-flex align-items-center justify-content-md-end gap-2">
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

          <!-- Bascule vue Liste / Carte (CDC RF-13) -->
          <div class="btn-group btn-group-sm rounded-2 p-1 bg-white border d-md-block d-none">
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
          <div class="btn-group btn-group-sm rounded-2 p-1 bg-white border d-flex d-md-none">
            <button 
              type="button" 
              class="btn btn-sm rounded-2 px-3 me-1"
              [class.btn-primary]="viewMode === 'split'"
              [class.btn-light]="viewMode !== 'split'"
              (click)="setViewMode('split')">
               Mixte
            </button>
            <button 
              type="button" 
              class="btn btn-sm rounded-2 px-3 me-1"
              [class.btn-primary]="viewMode === 'list'"
              [class.btn-light]="viewMode !== 'list'"
              (click)="setViewMode('list')">
              Liste
            </button>
            <button 
              type="button" 
              class="btn btn-sm rounded-2 px-3"
              [class.btn-primary]="viewMode === 'map'"
              [class.btn-light]="viewMode !== 'map'"
              (click)="setViewMode('map')">
              Carte
            </button>
          </div>
        </div>
      </div>

      <!-- Corps principal : Filtres + Contenu (Liste & Carte) -->
      <div class="row g-3">
        <!-- Sidebar Filtres (CDC RF-11) -->
        <div class="col-lg-3">
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
            <!-- Colonne Liste (visible en mode split ou list) -->
            @if (viewMode === 'list' || viewMode === 'split') {
              <div [ngClass]="{'col-lg-6': viewMode === 'split', 'col-12': viewMode === 'list'}">
                <div class="row g-3">
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
              </div>
            }

            <!-- Colonne Carte Interactive Leaflet (CDC RF-13) -->
            @if (viewMode === 'map' || viewMode === 'split') {
              <div [ngClass]="{'col-lg-6': viewMode === 'split', 'col-12': viewMode === 'map'}">
                <div class="card border-0 shadow-sm rounded-4 overflow-hidden sticky-top" style="top: 80px; height: 75vh;">
                  <div #mapContainer id="mapContainer" style="width: 100%; height: 100%;"></div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class LogementListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainerRef?: ElementRef;

  logements: Logement[] = [];
  equipementsList: Equipement[] = [];
  selectedEquipements = new Set<number>();
  viewMode: 'split' | 'list' | 'map' = 'split';

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
    this.loadLogements();
  }
}
