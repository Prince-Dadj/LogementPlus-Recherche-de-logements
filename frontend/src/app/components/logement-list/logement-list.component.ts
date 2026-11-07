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
              <option value="recent">Plus récent</option>
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
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white sticky-top" style="top: 80px; z-index: 10;">
            <div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
              <h2 class="h6 fw-bold mb-0 text-dark">
                <i class="bi bi-funnel text-primary me-1"></i> Filtres précis
              </h2>
              <button class="btn btn-link btn-sm text-decoration-none text-muted p-0" (click)="resetFilters()">
                Réinitialiser
              </button>
            </div>

            <form (ngSubmit)="loadLogements()">
              <!-- Recherche mot clé -->
              <div class="mb-3">
                <label class="form-label small fw-semibold">Recherche libre</label>
                <div class="input-group input-group-md">
                  <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
                  <input type="text" class="form-control border-start-0" placeholder="Ville, quartier, mot..." [(ngModel)]="filters.q" name="q">
                </div>
              </div>

              <!-- Type de bien -->
              <div class="mb-3">
                <label class="form-label small fw-semibold">Type de logement</label>
                <select class="form-select form-select-sm" [(ngModel)]="filters.type" name="type" (change)="loadLogements()">
                  <option value="tous">Tous types</option>
                  <option value="appartement">Appartement</option>
                  <option value="studio">Studio</option>
                  <option value="maison">Maison / Villa</option>
                  <option value="chambre">Chambre</option>
                </select>
              </div>

              <!-- Fourchette de prix (RF-11) -->
              <div class="mb-3">
                <label class="form-label small fw-semibold d-flex justify-content-between">
                  <span>Loyer max (FCFA/mois)</span>
                  <span class="text-primary fw-bold tabular-numbers">{{ filters.prix_max | number }}</span>
                </label>
                <input 
                  type="range" 
                  class="form-range" 
                  min="50000" 
                  max="1500000" 
                  step="25000" 
                  [(ngModel)]="filters.prix_max" 
                  name="prix_max" 
                  (change)="loadLogements()">
              </div>

              <!-- Nombre de pièces & Surface (RF-11) -->
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <label class="form-label small fw-semibold">Pièces min</label>
                  <select class="form-select form-select-sm" [(ngModel)]="filters.nb_pieces" name="nb_pieces" (change)="loadLogements()">
                    <option [ngValue]="null">Peu importe</option>
                    <option [ngValue]="1">1+</option>
                    <option [ngValue]="2">2+</option>
                    <option [ngValue]="3">3+</option>
                    <option [ngValue]="4">4+</option>
                  </select>
                </div>
                <div class="col-6">
                  <label class="form-label small fw-semibold">Surface min (m²)</label>
                  <input type="number" class="form-control form-control-sm" placeholder="Ex: 30" [(ngModel)]="filters.surface_min" name="surface_min">
                </div>
              </div>

              <!-- Meublé -->
              <div class="form-check form-switch mb-3">
                <input class="form-check-input" type="checkbox" id="meubleSwitch" [(ngModel)]="filters.meuble" name="meuble" (change)="loadLogements()">
                <label class="form-check-label small fw-medium" for="meubleSwitch">Uniquement meublé</label>
              </div>

              <!-- Équipements clés (RF-11) -->
              <div class="mb-3">
                <label class="form-label small fw-semibold mb-2">Équipements indispensables</label>
                <div class="d-flex flex-wrap gap-1" style="max-height : 150px; overflow : auto;">
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

              <button type="submit" class="btn btn-accent btn-sm w-100 rounded-2 py-2">
                <i class="bi bi-filter me-1"></i> Appliquer les filtres
              </button>
            </form>
          </div>
        </div>

        <!-- Zone d'affichage : Liste et/ou Carte -->
        <div class="col-lg-9">
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

  filters: any = {
    q: '',
    type: 'tous',
    prix_max: 1000000,
    surface_min: null,
    nb_pieces: null,
    meuble: null,
    tri: 'pertinence'
  };

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
      if (params['type']) this.filters.type = params['type'];
      if (params['prix_max']) this.filters.prix_max = Number(params['prix_max']);
      this.loadLogements();
    });

    this.logementService.getEquipements().subscribe(eqs => {
      this.equipementsList = eqs;
      this.cdr.markForCheck();
    });
    //this.setViewMode('split')
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

  resetFilters(): void {
    this.filters = {
      q: '',
      type: 'tous',
      prix_max: 1000000,
      surface_min: null,
      nb_pieces: null,
      meuble: null,
      tri: 'pertinence'
    };
    this.selectedEquipements.clear();
    this.loadLogements();
  }
}
