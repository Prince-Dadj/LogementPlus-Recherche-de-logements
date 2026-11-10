import { Component, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild, AfterViewInit, PLATFORM_ID, Inject, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LogementService } from '../../services/logement.service';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { FavoriService } from '../../services/favori.service';
import { ModalAlertService } from '../../services/modal-alert.service';
import { Logement, ReservationCalculation } from '../../models/models';
import { geocodeSenegal } from '../../utils/geocoding';

declare let L: any;

@Component({
  selector: 'app-logement-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container py-3">
      @if (logement) {
        <!-- Fil d'ariane & En-tête -->
        <nav aria-label="breadcrumb" class="mt-3 mb-2">
          <ol class="breadcrumb small mb-1">
            <li class="breadcrumb-item"><a routerLink="/" class="text-decoration-none text-muted">Accueil</a></li>
            <li class="breadcrumb-item"><a routerLink="/logements" class="text-decoration-none text-muted">Sénégal</a></li>
            <li class="breadcrumb-item"><a routerLink="/logements" [queryParams]="{q: logement.ville}" class="text-decoration-none text-muted">{{ logement.ville }}</a></li>
            <li class="breadcrumb-item active text-primary fw-medium" aria-current="page">{{ logement.type | uppercase }}</li>
          </ol>
        </nav>

        <div class="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-3">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
              <!-- <span class="badge bg-primary bg-opacity-10 text-primary small px-2 py-1 text-uppercase fw-semibold" style="font-size: 11px;">
                {{ logement.type }} • Sénégal
              </span> -->
              <!-- <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 small px-2 py-1" style="font-size: 11px;">
                <i class="bi bi-shield-check me-1"></i> Logement Audité & Vérifié
              </span> -->
               <span class="badge rounded-2" [ngClass]="logement.mode_reservation === 'immediate' ? 'badge-status-confirmed' : 'badge-status-pending'" style="font-size: 11px;">
                <i class="bi" [class.bi-lightning-fill]="logement.mode_reservation === 'immediate'" [class.bi-hourglass-split]="logement.mode_reservation !== 'immediate'"></i>
                {{ logement.mode_reservation === 'immediate' ? 'Réservation Instantanée' : 'Validation sous 24h' }}
              </span>
            </div>
            <h1 class="h4 fw-bold mb-1 text-dark mt-3">{{ logement.titre }}</h1>
            <p class="text-muted small mb-0">
              <i class="bi bi-geo-alt-fill text-danger me-1"></i>
              {{ logement.adresse }}, {{ logement.quartier ? logement.quartier + ',' : '' }} {{ logement.ville }} (Sénégal)
              <span class="ms-3 text-warning fw-semibold">
                <i class="bi bi-star-fill me-1"></i>{{ logement.note_moyenne }} ({{ logement.nombre_avis }} avis locataires)
              </span>
            </p>
          </div>

          <!-- Actions de partage et contact rapide -->
          <div class="d-flex align-items-center gap-2">
            <a 
              [href]="getDirectWhatsAppUrl()" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="btn btn-whatsapp btn-sm rounded-2 px-3 py-2 d-flex align-items-center gap-1 shadow-sm">
              <i class="bi bi-whatsapp"></i>
              <span>WhatsApp</span>
            </a>
            <button class="btn btn-outline-secondary btn-sm rounded-2 px-3 py-2" (click)="share()">
              <i class="bi bi-share me-1"></i> Partager
            </button>
            <button 
              type="button"
              class="btn btn-sm rounded-2 px-3 py-2 d-flex align-items-center gap-1 shadow-sm"
              [class.btn-danger]="isFav(logement.id)"
              [class.btn-outline-danger]="!isFav(logement.id)"
              (click)="toggleFav(logement)">
              <i class="bi" [class.bi-heart-fill]="isFav(logement.id)" [class.bi-heart]="!isFav(logement.id)"></i>
              <span>{{ isFav(logement.id) ? '' : 'Favori' }}</span>
            </button>
          </div>
        </div>

        <!-- Galerie Photos Interactive avec visionneuse principale -->
        <div class="row g-2 mb-4">
          <div class="col-lg-8">
            <div class="position-relative rounded-2 overflow-hidden shadow-sm" style="height: 380px; background-color: #0f172a;">
              <img [src]="activePhoto || logement.image_principale" class="w-100 h-100 object-fit-cover transition-all" alt="Vue principale du logement">
              <span class="position-absolute bottom-0 start-0 m-3 badge bg-dark bg-opacity-75 text-white small px-3 py-2 rounded-2">
                <i class="bi bi-camera me-1"></i> Photo {{ getActivePhotoIndex() }} / {{ (logement.photos?.length || 0) + 1 }}
              </span>
            </div>
          </div>

          <!-- Miniatures cliquables pour changer instantanément de photo -->
          <div class="col-lg-4 d-flex flex-column gap-2">
            <div 
              class="position-relative rounded-2 overflow-hidden cursor-pointer border"
              [class.border-primary]="activePhoto === logement.image_principale"
              style="height: 120px; cursor: pointer;"
              (click)="setActivePhoto(logement.image_principale || '')">
              <img [src]="logement.image_principale" class="w-100 h-100 object-fit-cover" alt="Façade">
              <span class="position-absolute top-0 end-0 m-1 badge bg-dark bg-opacity-70 small" style="font-size: 10px;">Principale</span>
            </div>

            @for (photo of logement.photos; track photo.id; let idx = $index) {
              @if (idx <= 2 && logement.image_principale != photo.url) {
                <div 
                  class="position-relative rounded-2 overflow-hidden cursor-pointer border"
                  [class.border-primary]="activePhoto === photo.url"
                  style="height: 120px; cursor: pointer;"
                  (click)="setActivePhoto(photo.url)">
                  <img [src]="photo.url" class="w-100 h-100 object-fit-cover" [alt]="'Photo ' + (idx + 1)">
                  <span class="position-absolute top-0 end-0 m-1 badge rounded-2 bg-dark bg-opacity-70 small" style="font-size: 10px;">Vue {{ idx + 2 }}</span>
                </div>
              }
            }
          </div>
        </div>

        <!-- Contenu principal & Widget Réservation Style Professionnel -->
        <div class="row g-4">
          <!-- Colonne gauche : Caractéristiques, Description, Équipements, Règlement, Avis -->
          <div class="col-lg-8">
            
            <!-- 4 Caractéristiques clés -->
            <div class="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
              <div class="row text-center g-2">
                <div class="col-3 border-end">
                  <i class="bi bi-house fs-4 text-primary mb-1 d-block"></i>
                  <span class="d-block small text-muted" style="font-size: 11px;">Type</span>
                  <strong class="text-capitalize small">{{ logement.type }}</strong>
                </div>
                <div class="col-3 border-end">
                  <i class="bi bi-door-open fs-4 text-primary mb-1 d-block"></i>
                  <span class="d-block small text-muted" style="font-size: 11px;">Pièces</span>
                  <strong class="small">{{ logement.nb_pieces }} pièce(s)</strong>
                </div>
                <div class="col-3 border-end">
                  <i class="bi bi-aspect-ratio fs-4 text-primary mb-1 d-block"></i>
                  <span class="d-block small text-muted" style="font-size: 11px;">Surface</span>
                  <strong class="small">{{ logement.surface }} m²</strong>
                </div>
                <div class="col-3">
                  <i class="bi bi-lamp fs-4 text-primary mb-1 d-block"></i>
                  <span class="d-block small text-muted" style="font-size: 11px;">Ameublement</span>
                  <strong class="small">{{ logement.meuble ? 'Meublé' : 'Non meublé' }}</strong>
                </div>
              </div>
            </div>

            <!-- Description détaillée -->
            <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
              <h2 class="h6 fw-bold mb-3 text-dark">
                <i class="bi bi-text-left text-primary me-2"></i>À propos de ce logement à {{ logement.quartier || logement.ville }}
              </h2>
              <p class="text-dark text-muted leading-relaxed mb-0 small" style="white-space: pre-line; line-height: 1.6;">
                {{ logement.description }}
              </p>
            </div>

            <!-- Équipements indispensables au Sénégal -->
            <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <h2 class="h6 fw-bold mb-0 text-dark">
                  <i class="bi bi-check-all text-success me-2"></i>Équipements & Confort au Sénégal
                </h2>
                <span class="badge bg-success bg-opacity-10 text-success small" style="font-size: 11px;">Vérifié sur place</span>
              </div>
              <div class="row g-2">
                @for (eq of logement.equipements; track eq.id) {
                  <div class="col-sm-6">
                    <div class="p-2 rounded-3 bg-light d-flex align-items-center gap-2">
                      <span class="d-inline-flex align-items-center justify-content-center rounded-circle bg-white text-primary shadow-sm" style="width: 32px; height: 32px;">
                        <i class="bi fs-6" [ngClass]="eq.icone"></i>
                      </span>
                      <span class="small fw-medium text-dark">{{ eq.nom }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Points d'intérêt & Proximité -Données dynamiques saisies par le gestionnaire -->
            <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
              <h2 class="h6 fw-bold mb-3 text-dark">
                <i class="bi bi-geo-alt text-danger me-2"></i>Points d'intérêt & Accessibilité
              </h2>
              @if (logement.points_interet || logement.accessibilite) {
                <div class="row g-3">
                  @if (logement.points_interet) {
                    <div class="col-md-6">
                      <h3 class="small fw-bold text-dark mb-2"><i class="bi bi-pin-map text-primary me-1"></i>Points d'intérêt à proximité</h3>
                      <div class="text-muted small" style="font-size: 12px; white-space: pre-line; line-height: 1.7;">{{ logement.points_interet }}</div>
                    </div>
                  }
                  @if (logement.accessibilite) {
                    <div class="col-md-6">
                      <h3 class="small fw-bold text-dark mb-2"><i class="bi bi-sign-turn-right text-success me-1"></i>Accessibilité & Transport</h3>
                      <div class="text-muted small" style="font-size: 12px; white-space: pre-line; line-height: 1.7;">{{ logement.accessibilite }}</div>
                    </div>
                  }
                </div>
              } @else {
                <div class="row g-2 text-muted small" style="font-size: 12px;">
                  <div class="col-md-6 d-flex align-items-center gap-2">
                    <i class="bi bi-geo text-primary fs-6"></i>
                    <span><strong>Localisation :</strong> {{ logement.quartier || logement.ville }}, Sénégal</span>
                  </div>
                  <div class="col-md-6 d-flex align-items-center gap-2">
                    <i class="bi bi-shield-check text-warning fs-6"></i>
                    <span><strong>Zone résidentielle :</strong> Quartier calme et sécurisé</span>
                  </div>
                </div>
              }
            </div>

            <!-- CARTE INTERACTIVE DE LOCALISATION PRÉCISE DU BIEN -->
            <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white overflow-hidden">
              <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div>
                  <h2 class="h6 fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                    <i class="bi bi-geo-alt-fill text-danger fs-5"></i>
                    <span>Situation Géographique & Carte</span>
                  </h2>
                  <p class="text-muted small mb-0">
                    <i class="bi bi-pin-map me-1 text-primary"></i>
                    <strong>{{ logement.adresse }}</strong> - {{ logement.quartier ? logement.quartier + ', ' : '' }}{{ logement.ville }} (Sénégal)
                  </p>
                </div>
                <div class="d-flex align-items-center gap-3">
                  <span class="badge bg-light text-dark border px-3 py-2 small" style="font-size: 11px;">
                    <i class="bi bi-crosshair me-1 text-primary"></i> GPS : {{ logement.latitude | number:'1.4-4' }}, {{ logement.longitude | number:'1.4-4' }}
                  </span>
                  <a [href]="getGoogleMapsUrl()" target="_blank" rel="noopener noreferrer" class="d-lg-flex d-none btn btn-outline-primary btn-sm rounded-2 px-3 shadow-sm">
                    <i class="bi bi-box-arrow-up-right me-1"></i> Ouvrir dans Google Maps
                  </a>
                  <a [href]="getGoogleMapsUrl()" target="_blank" rel="noopener noreferrer" class="d-flex d-lg-none btn btn-outline-primary btn-sm rounded-2 px-3 shadow-sm">
                    <i class="bi bi-box-arrow-up-right me-1"></i> Maps
                  </a>
                </div>
              </div>

              <!-- Conteneur Carte Leaflet -->
              <div class="position-relative rounded-3 overflow-hidden border" style="height: 320px;">
                <div #detailMapContainer id="detailMapContainer" style="width: 100%; height: 100%; z-index: 1;"></div>
              </div>

              <div class="mt-2 d-flex align-items-center justify-content-between flex-wrap gap-2 text-muted small" style="font-size: 11px;">
                <span><i class="bi bi-info-circle me-1 text-primary"></i>Emplacement vérifié et géoréférencé avec précision sur la carte.</span>
                <span class="text-success fw-medium"><i class="bi bi-shield-check me-1"></i>Adresse certifiée SanarHousings Sénégal</span>
              </div>
            </div>

            <!-- Règlement intérieur et politique d'annulation -->
            <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
              <h2 class="h6 fw-bold mb-3 text-dark">
                <i class="bi bi-shield-check text-primary me-2"></i>Conditions de bail & Annulation
              </h2>
              <div class="p-3 rounded-3 bg-light mb-2">
                <h3 class="small fw-bold text-dark mb-1">Règlement de la résidence</h3>
                <p class="small text-muted mb-0" style="font-size: 12px;">
                  Respect de la tranquillité du voisinage, animaux admis sous condition d'accord préalable avec le bailleur.
                </p>
              </div>
              <div class="p-3 rounded-3 bg-light">
                <h3 class="small fw-bold text-dark mb-1">Annulation de réservation</h3>
                <p class="small text-muted mb-0" style="font-size: 12px;">
                  @if (logement.politique_annulation === 'gratuite') {
                    Annulation sans frais jusqu'à 48h avant la date d'entrée avec remboursement intégral immédiat sous séquestre (Wave ou Orange Money).
                  } @else {
                    Annulation soumise aux conditions du contrat de bail sénégalais.
                  }
                </p>
              </div>
            </div>

            <!-- Avis locataires avec notation dynamique -->
            <div class="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
              <div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2 flex-wrap gap-2">
                <div>
                  <h2 class="h6 fw-bold mb-0 text-dark">
                    <i class="bi bi-star-fill text-warning me-2"></i>Avis des locataires vérifiés ({{ logement.avis?.length || 0 }})
                  </h2>
                  <small class="text-muted" style="font-size: 11px;">Notes authentiques basées sur des séjours réels</small>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <span class="badge bg-warning text-dark fw-bold px-3 py-2 rounded-3 shadow-sm" style="font-size: 0.85rem;">
                    ★ {{ logement.note_moyenne }} / 5
                  </span>
                </div>
              </div>

              <!-- Liste des avis -->
              @if (logement.avis && logement.avis.length > 0) {
                <div class="avis-list-container">
                  @for (avis of logement.avis; track avis.id) {
                    <div class="border-bottom py-3">
                      <div class="d-flex align-items-center justify-content-between mb-1">
                        <div class="d-flex align-items-center gap-2">
                          <span class="d-inline-flex align-items-center justify-content-center bg-light text-primary rounded-circle fw-bold" style="width: 32px; height: 32px; font-size: 12px;">
                            {{ (avis.locataire?.name || 'L').charAt(0).toUpperCase() }}
                          </span>
                          <div>
                            <strong class="text-dark small d-block">{{ avis.locataire?.name || 'Locataire certifié' }}</strong>
                            <span class="badge bg-success bg-opacity-10 text-success p-0" style="font-size: 10px;">✓ Séjour certifié Sénégal</span>
                          </div>
                        </div>
                        <div class="text-warning small d-flex gap-1">
                          @for (star of [1,2,3,4,5]; track star) {
                            <i class="bi" [class.bi-star-fill]="star <= avis.note" [class.bi-star]="star > avis.note"></i>
                          }
                          <span class="text-muted ms-1 small fw-semibold" style="font-size: 11px;">({{ avis.note }}/5)</span>
                        </div>
                      </div>
                      <p class="text-secondary small mb-0 mt-2" style="font-size: 12.5px; line-height: 1.5;">{{ avis.commentaire }}</p>
                    </div>
                  }
                </div>
              } @else {
                <!-- Empty state stylisé & moderne s'il n'y a aucun avis -->
                <div class="text-center py-4 px-3 rounded-4 bg-light bg-opacity-60 border border-dashed border-2 my-2">
                  <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning bg-opacity-15 text-dark mb-2" style="width: 52px; height: 52px;">
                    <i class="bi bi-chat-square-heart fs-4"></i>
                  </div>
                  <h6 class="fw-bold text-dark mb-1">Aucun avis pour l'instant sur ce logement</h6>
                  <p class="text-muted small mb-0 mx-auto" style="max-width: 420px; font-size: 12px;">
                    Ce bien d'exception vient d'être mis en ligne. Soyez le tout premier locataire à séjourner et à partager votre expérience !
                  </p>
                </div>
              }

              <!-- FORMULAIRE DE NOTATION ET D'AVIS PAR UN LOCATAIRE AUTHENTIFIÉ -->
              <div class="mt-4 pt-3 border-top">
                @if (auth.isLoggedIn() && auth.isTenant()) {
                  <div class="p-3 rounded-4 bg-light border">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                      <h6 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                        <i class="bi bi-pencil-square text-primary"></i> Donner votre avis sur ce logement
                      </h6>
                      <span class="badge bg-primary bg-opacity-10 text-primary small">Compte Locataire actif</span>
                    </div>
                    <p class="text-muted small mb-3" style="font-size: 11.5px;">
                      Votre retour aide les futurs locataires et met en valeur les bailleurs sérieux au Sénégal.
                    </p>

                    @if (avisSuccessMessage) {
                      <div class="alert alert-success d-flex align-items-center gap-2 small py-2 rounded-3 mb-3">
                        <i class="bi bi-check-circle-fill fs-5"></i>
                        <div>{{ avisSuccessMessage }}</div>
                      </div>
                    }

                    @if (avisErrorMessage) {
                      <div class="alert alert-danger d-flex align-items-center gap-2 small py-2 rounded-3 mb-3">
                        <i class="bi bi-exclamation-triangle-fill fs-5"></i>
                        <div>{{ avisErrorMessage }}</div>
                      </div>
                    }

                    <div class="mb-3">
                      <label class="form-label small fw-semibold text-dark mb-1">
                        Votre note globale : <span class="text-warning fw-bold">{{ noteSaisie }} / 5</span>
                        <span class="text-muted fw-normal ms-1">({{ getNoteLabel(noteSaisie) }})</span>
                      </label>
                      <div class="d-flex align-items-center gap-2">
                        <div class="star-rating d-inline-flex gap-1 fs-5 text-warning" style="cursor: pointer;">
                          @for (star of [1,2,3,4,5]; track star) {
                            <i class="bi transition-all"
                               [class.bi-star-fill]="star <= (noteHover || noteSaisie)"
                               [class.bi-star]="star > (noteHover || noteSaisie)"
                               (mouseenter)="noteHover = star"
                               (mouseleave)="noteHover = 0"
                               (click)="setNote(star)">
                            </i>
                          }
                        </div>
                      </div>
                    </div>

                    <div class="mb-3">
                      <label class="form-label small fw-semibold text-dark mb-1">Votre commentaire d'expérience</label>
                      <textarea
                        class="form-control form-control-sm rounded-3"
                        rows="3"
                        placeholder="Partagez vos impressions : propreté, accueil du bailleur, calme du quartier, équipements..."
                        [(ngModel)]="commentaireSaisi">
                      </textarea>
                    </div>

                    <div class="d-flex justify-content-end">
                      <button
                        type="button"
                        class="btn btn-primary btn-sm px-4 py-2 rounded-3 fw-semibold shadow-sm d-flex align-items-center gap-2"
                        [disabled]="isSubmittingAvis || !commentaireSaisi.trim()"
                        (click)="soumettreAvis()">
                        @if (isSubmittingAvis) {
                          <span class="spinner-border spinner-border-sm"></span>
                          <span>Publication...</span>
                        } @else {
                          <i class="bi bi-send-fill"></i>
                          <span>Publier mon avis</span>
                        }
                      </button>
                    </div>
                  </div>
                } @else if (auth.isLoggedIn() && !auth.isTenant()) {
                  <!-- Connecté mais en tant que gestionnaire / admin -->
                  <div class="p-3 rounded-4 bg-light text-muted small d-flex align-items-center gap-3">
                    <i class="bi bi-info-circle-fill fs-4 text-secondary"></i>
                    <div>
                      Vous êtes actuellement connecté en tant que <strong>{{ auth.currentUser()?.role }}</strong>.
                      Seuls les comptes locataires peuvent noter et évaluer un logement particulier.
                    </div>
                  </div>
                } @else {
                  <!-- Visiteur non connecté : incitation élégante -->
                  <div class="p-3 rounded-4 bg-light border d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div class="d-flex align-items-center gap-3">
                      <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-white shadow-sm text-primary" style="width: 44px; height: 44px;">
                        <i class="bi bi-person-lock fs-5"></i>
                      </div>
                      <div>
                        <strong class="d-block small text-dark">Vous avez séjourné dans ce logement ?</strong>
                        <span class="text-muted small" style="font-size: 11.5px;">Connectez-vous avec votre compte locataire pour attribuer une note et laisser votre avis.</span>
                      </div>
                    </div>
                    <a routerLink="/login" [queryParams]="{role: 'locataire'}" class="btn btn-outline-primary btn-sm px-3 py-1 rounded-2 fw-semibold">
                      <i class="bi bi-box-arrow-in-right me-1"></i> Se connecter comme locataire
                    </a>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Colonne droite : WIDGET STICKY Style Professionnel AVEC GARANTIE SÉQUESTRE 24H -->
          <div class="col-lg-4">
            <div class="card border-0 shadow-lg rounded-4 p-3 bg-white sticky-top" style="top: 80px;">
              
              <!-- Prix et statut de disponibilité -->
              <div class="d-flex align-items-baseline justify-content-between mb-2 border-bottom pb-2">
                <div>
                  <span class="fs-5 fw-bold text-primary tabular-numbers">
                    {{ logement.prix_par_mois }}
                  </span>
                  <span class="text-muted small" style="font-size: 12px;"> FCFA / mois</span>
                </div>
                <span class="badge bg-success bg-opacity-10 text-success small" style="font-size: 11px;">
                  <i class="bi bi-patch-check-fill me-1"></i> Disponible
                </span>
              </div>

              <!-- BANDEAU SÉQUESTRE 24H Style Professionnel (RÉASSURANCE FORTE) -->
              <div class="p-2 mb-3 rounded-3" style="background: rgba(20, 184, 166, 0.08); border: 1px solid rgba(20, 184, 166, 0.3);">
                <div class="d-flex align-items-center gap-1 text-success fw-bold small mb-1" style="font-size: 11px;">
                  <i class="bi bi-shield-lock-fill fs-6"></i>
                  <span>Garantie Séquestre 24h SanarHousings</span>
                </div>
                <small class="text-muted d-block" style="font-size: 10px; line-height: 1.4;">
                  Vos fonds sont bloqués et ne sont versés au propriétaire que <strong>24h après la remise des clés</strong> et validation de l'état des lieux. Zéro risque d'arnaque.
                </small>
              </div>

              <!-- Choix des dates -->
              <div class="mb-3">
                <label class="form-label small fw-semibold">Période souhaitée</label>
                <div class="row g-2">
                  <div class="col-6">
                    <label class="small text-muted" style="font-size: 11px;">Entrée</label>
                    <input type="date" class="form-control form-control-sm" [(ngModel)]="dateDebut" (change)="onDateChange()">
                  </div>
                  <div class="col-6">
                    <label class="small text-muted" style="font-size: 11px;">Sortie</label>
                    <input type="date" class="form-control form-control-sm" [(ngModel)]="dateFin" (change)="onDateChange()">
                  </div>
                </div>
              </div>

              <!-- Simulateur de décomposition légale -->
              @if (calcul) {
                <div class="bg-light p-3 rounded-3 mb-3">
                  <div class="small fw-semibold text-secondary mb-2" style="font-size: 11px;">
                    <i class="bi bi-calculator me-1"></i>Décomposition du paiement sous séquestre
                  </div>
                  <div class="d-flex justify-content-between small text-muted mb-1" style="font-size: 12px;">
                    <span>Loyer ({{ calcul.nb_jours }} jours)</span>
                    <span class="tabular-numbers text-dark fw-medium">{{ calcul.montant_loyer | number }} FCFA</span>
                  </div>
                  <div class="d-flex justify-content-between small text-muted mb-1" style="font-size: 12px;">
                    <span>Caution légale sous séquestre</span>
                    <span class="tabular-numbers text-dark fw-medium">{{ calcul.montant_caution | number }} FCFA</span>
                  </div>
                  <div class="d-flex justify-content-between small text-muted mb-2" style="font-size: 12px;">
                    <span>Frais de sécurisation plateforme</span>
                    <span class="tabular-numbers text-dark fw-medium">{{ calcul.montant_frais_service | number }} FCFA</span>
                  </div>
                  <div class="d-flex justify-content-between border-top pt-2 fw-bold text-dark">
                    <span>Total à consigner</span>
                    <span class="tabular-numbers text-primary fs-6">{{ calcul.montant_total | number }} FCFA</span>
                  </div>
                </div>
              }

              @if (logement.est_occupe || logement.statut === 'occupe') {
                <div class="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3 mb-3">
                  <i class="bi bi-lock-fill fs-5 text-danger"></i>
                  <div class="small">
                    <strong>Logement actuellement occupé :</strong> Ce bien est déjà loué. Les réservations sont temporairement suspendues.
                  </div>
                </div>
              }

              <!-- Boutons d'action forte -->
              <div class="d-grid gap-2 mb-3">
                @if (logement.est_occupe || logement.statut === 'occupe') {
                  <button 
                    class="btn btn-secondary w-100 py-2 fs-6 fw-semibold d-flex align-items-center justify-content-center gap-2 disabled"
                    disabled>
                    <i class="bi bi-lock-fill"></i>
                    <span>Logement Occupé</span>
                  </button>
                } @else {
                  <button 
                    class="btn btn-accent w-100 py-2 fs-6 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                    (click)="startBooking()">
                    <i class="bi bi-shield-fill-check"></i>
                    <span>Réserver avec Dossier Certifié</span>
                  </button>
                }

                <div class="row g-1">
                  <div class="col-6">
                    <button type="button" class="btn btn-outline-primary btn-sm w-100 py-2 small" (click)="toggleQuestionModal()">
                      <i class="bi bi-chat-dots me-1"></i> Poser question
                    </button>
                  </div>
                  <div class="col-6">
                    <a 
                      [href]="getDirectWhatsAppUrl()" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      class="btn btn-whatsapp btn-sm w-100 py-2 d-flex align-items-center justify-content-center gap-1 small">
                      <i class="bi bi-whatsapp"></i>
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>

              <!-- Garanties SanarHousings incluses -->
              <div class="border-top pt-2">
                <ul class="list-unstyled small text-muted mb-0" style="font-size: 11px;">
                  <li class="mb-1"><i class="bi bi-check2-circle text-success me-1"></i>Fonds 100% remboursés si non-conformité constatée</li>
                  <li class="mb-1"><i class="bi bi-check2-circle text-success me-1"></i>Contrat de bail certifié généré numériquement</li>
                  <li><i class="bi bi-check2-circle text-success me-1"></i>Assistance conciergerie 7j/7 à Dakar et Saly</li>
                </ul>
              </div>

              <!-- Profil du Bailleur / Gestionnaire Certifié (Style Professionnel) -->
              @if (logement.admin) {
                <div class="border-top pt-3 mt-3">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style="width: 40px; height: 40px; font-size: 14px;">
                      {{ logement.admin.name.charAt(0) }}
                    </div>
                    <div class="flex-grow-1 min-w-0">
                      <strong class="d-block small text-dark text-truncate">{{ logement.admin.raison_sociale || logement.admin.name }}</strong>
                      <span class="badge bg-success bg-opacity-10 text-success small" style="font-size: 10px;">
                        <i class="bi bi-patch-check-fill me-1"></i>Bailleur Certifié
                      </span>
                    </div>
                  </div>
                  <div class="d-flex justify-content-between text-muted small bg-light p-2 rounded-2" style="font-size: 10px;">
                    <span><i class="bi bi-clock me-1 text-primary"></i>Rép. : &lt; 1 heure</span>
                    <span><i class="bi bi-award me-1 text-warning"></i>Taux rép. : 99%</span>
                    <span><i class="bi bi-buildings me-1 text-success"></i>Vérifié</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      } @else {
        <!-- État de secours / Chargement -->
        <div class="card border-0 shadow-sm rounded-4 p-5 text-center bg-white my-5">
          <div class="spinner-border text-primary mx-auto mb-3" role="status"></div>
          <h2 class="h5 fw-bold text-dark">Chargement des détails du logement...</h2>
          <p class="text-muted small">Veuillez patienter ou revenir à la liste des logements disponibles au Sénégal.</p>
          <div class="mt-3">
            <a routerLink="/logements" class="btn btn-outline-primary btn-sm rounded-2 px-4">
              <i class="bi bi-arrow-left me-1"></i> Retour aux logements disponibles
            </a>
          </div>
        </div>
      }

      <!-- Modale "Poser une question au propriétaire" (Style Messagerie SanarHousings) -->
      @if (showQuestionModal) {
        <div class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5); z-index: 1050;">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content rounded-4 border-0 shadow">
              <div class="modal-header border-bottom p-3">
                <h5 class="modal-title h6 fw-bold">
                  <i class="bi bi-chat-dots-fill text-primary me-2"></i>Contacter {{ logement?.admin?.name || 'le bailleur' }}
                </h5>
                <button type="button" class="btn-close" (click)="toggleQuestionModal()"></button>
              </div>
              <div class="modal-body p-4">
                @if (questionSent) {
                  <div class="alert alert-success small py-3 rounded-3 mb-0 text-center">
                    <i class="bi bi-check-circle-fill fs-3 text-success d-block mb-2"></i>
                    <strong>Message transmis avec succès !</strong>
                    <p class="mb-0 mt-1 text-muted">Le gestionnaire vous répondra directement sous moins d'une heure.</p>
                  </div>
                } @else {
                  <form (ngSubmit)="sendQuestion()">
                    <div class="mb-2">
                      <label class="form-label small fw-semibold">Votre Nom & Prénom *</label>
                      <input type="text" class="form-control form-control-sm" [(ngModel)]="visitorName" name="name" placeholder="Ex: Fatou Ndiaye" required>
                    </div>
                    <div class="mb-2">
                      <label class="form-label small fw-semibold">Votre Téléphone (WhatsApp) ou E-mail *</label>
                      <input type="text" class="form-control form-control-sm" [(ngModel)]="visitorContact" name="contact" placeholder="Ex: +221 77 123 45 67" required>
                    </div>
                    <div class="mb-3">
                      <label class="form-label small fw-semibold">Votre question sur ce logement</label>
                      <textarea class="form-control form-control-sm" rows="3" [(ngModel)]="visitorMessage" name="msg" placeholder="Bonjour, le logement est-il disponible pour une visite cette semaine ?" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary w-100 py-2 rounded-2 small fw-semibold" [disabled]="!visitorName || !visitorContact">
                      <i class="bi bi-send me-1"></i> Envoyer ma question
                    </button>
                  </form>
                }
              </div>
              @if (questionSent) {
                <div class="modal-footer border-top p-2">
                  <button type="button" class="btn btn-secondary btn-sm rounded-2" (click)="toggleQuestionModal()">Fermer</button>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class LogementDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private logementService = inject(LogementService);
  private reservationService = inject(ReservationService);
  public auth = inject(AuthService);
  public favoriService = inject(FavoriService);
  private cdr = inject(ChangeDetectorRef);
  private modalAlert = inject(ModalAlertService);
  @Inject(PLATFORM_ID) private platformId = inject(PLATFORM_ID);

  logement: Logement | null = null;
  activePhoto = '';
  dateDebut = '';
  dateFin = '';
  calcul: ReservationCalculation | null = null;
  private isBrowser: boolean;
  private sub?: Subscription;
  private detailMap: any = null;
  private detailMarker: any = null;

  // Modale SanarHousings "Poser une question"
  showQuestionModal = false;
  questionSent = false;
  visitorName = '';
  visitorContact = '';
  visitorMessage = '';

  // Notation et avis dynamique locataire
  noteSaisie = 5;
  noteHover = 0;
  commentaireSaisi = '';
  isSubmittingAvis = false;
  avisSuccessMessage = '';
  avisErrorMessage = '';

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);

    const today = new Date();
    const d1 = new Date(today);
    d1.setDate(today.getDate() + 5);
    const d2 = new Date(d1);
    d2.setDate(d1.getDate() + 30);

    this.dateDebut = d1.toISOString().split('T')[0];
    this.dateFin = d2.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id')) || 1;

      

      // 1. Initialisation synchrone immédiate (0 ms de latence)
      this.logement = this.logementService.getLogementSync(id);
      this.activePhoto = this.logement.image_principale || '';
      this.onDateChange();
      this.cdr.markForCheck();
      setTimeout(() => this.initDetailMap(), 300);

      

      // 2. Rafraîchissement asynchrone si API
      this.logementService.getLogement(id).subscribe({
        next: (data) => {
          if (data) {
            this.logement = data;
            console.log(data)
            this.activePhoto = data.image_principale || this.activePhoto;
            this.onDateChange();
            this.cdr.markForCheck();
            setTimeout(() => this.initDetailMap(), 250);
          }
        },
        error: (err) => console.log('Utilisation du catalogue Sénégal local pour le logement', id)
      });
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.detailMap) {
      this.detailMap.remove();
      this.detailMap = null;
      this.detailMarker = null;
    }
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
    if (this.isBrowser && this.logement) {
      setTimeout(() => this.initDetailMap(), 350);
    }
  }

  getGoogleMapsUrl(): string {
    if (!this.logement) return '#';
    const lat = this.logement.latitude || 16.0326;
    const lng = this.logement.longitude || -16.4818;
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  private initDetailMap(): void {
    if (!this.isBrowser || typeof L === 'undefined' || !this.logement) return;
    const container = document.getElementById('detailMapContainer');
    if (!container) return;

    if (this.detailMap) {
      this.detailMap.remove();
      this.detailMap = null;
      this.detailMarker = null;
    }

    let lat = this.logement.latitude;
    let lng = this.logement.longitude;

    if (!lat || !lng || lat < 11 || lat > 18) {
      const geo = geocodeSenegal(this.logement.ville, this.logement.quartier);
      lat = geo.lat;
      lng = geo.lng;
      this.logement.latitude = lat;
      this.logement.longitude = lng;
    }

    this.detailMap = L.map(container, {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.detailMap);

    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="background:#0B3D91;color:#FFF;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;box-shadow:0 3px 10px rgba(0,0,0,0.3);border:2px solid #FFF;white-space:nowrap;">
            <i class="bi bi-geo-alt-fill text-warning me-1"></i>${(this.logement.prix_par_mois / 1000).toFixed(0)}k CFA
          </div>
          <div class="map-location-pulse" style="margin-top:-4px;"></div>
        </div>
      `,
      iconSize: [80, 50],
      iconAnchor: [40, 48]
    });

    this.detailMarker = L.marker([lat, lng], { icon: customIcon }).addTo(this.detailMap);

    const popupHtml = `
      <div style="padding:10px 12px;font-family:'Inter',sans-serif;max-width:220px;">
        <strong style="font-size:13px;color:#0B3D91;display:block;margin-bottom:2px;">${this.logement.titre}</strong>
        <div style="font-size:11px;color:#64748B;margin-bottom:4px;">
          <i class="bi bi-geo-alt me-1 text-danger"></i>${this.logement.quartier ? this.logement.quartier + ', ' : ''}${this.logement.ville}
        </div>
        <div style="font-weight:700;color:#14B8A6;font-size:13px;">
          ${Number(this.logement.prix_par_mois).toLocaleString('fr-FR')} FCFA / mois
        </div>
      </div>
    `;

    this.detailMarker.bindPopup(popupHtml).openPopup();
  }

  setActivePhoto(url: string): void {
    this.activePhoto = url;
    this.cdr.markForCheck();
  }

  getActivePhotoIndex(): number {
    if (!this.logement) return 1;
    if (this.activePhoto === this.logement.image_principale) return 1;
    const idx = (this.logement.photos || []).findIndex(p => p.url === this.activePhoto);
    return idx >= 0 ? idx + 2 : 1;
  }

  onDateChange(): void {
    if (!this.logement || !this.dateDebut || !this.dateFin) return;
    this.reservationService.calculate(this.logement.id, this.dateDebut, this.dateFin).subscribe({
      next: (res) => {
        this.calcul = res;
        this.cdr.markForCheck();
      },
      error: (err) => console.log('Calcul local actif')
    });
  }

  getDirectWhatsAppUrl(): string {
    if (!this.logement) return 'https://wa.me/221770000000';
    const text = encodeURIComponent(
      `Bonjour, je vous contacte depuis SanarHousings Sénégal au sujet de l'annonce Réf #${this.logement.id} : "${this.logement.titre}" à ${this.logement.quartier || this.logement.ville} (${this.logement.prix_par_mois.toLocaleString('fr-FR')} FCFA/mois).`
    );
    return `https://wa.me/${this.logement.admin?.telephone}?text=${text}`;
  }

  toggleQuestionModal(): void {
    this.showQuestionModal = !this.showQuestionModal;
    this.questionSent = false;
    this.cdr.markForCheck();
  }

  sendQuestion(): void {
    if (!this.visitorName || !this.visitorContact) return;
    this.questionSent = true;
    this.cdr.markForCheck();
  }

  startBooking(): void {
    if (!this.logement || this.logement.est_occupe || this.logement.statut === 'occupe') return;
    if (!this.auth.isLoggedIn()) {
     // alert('Connexion requise : Vous devez être connecté avec un compte locataire pour effectuer une réservation.');
      this.router.navigate(['/login'], {
        queryParams: {
          redirect: `/reserver/${this.logement.id}`,
          debut: this.dateDebut,
          fin: this.dateFin
        }
      });
      return;
    }
    this.router.navigate(['/reserver', this.logement.id], {
      queryParams: {
        debut: this.dateDebut,
        fin: this.dateFin
      }
    });
    
  }

  share(): void {
    if (navigator.share) {
      navigator.share({
        title: this.logement?.titre,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      this.modalAlert.success('Le lien de cette annonce a été copié dans votre presse-papier.', 'Lien Partagé');
    }
  }

  // --- Gestion de la notation et des avis dynamiques ---
  setNote(star: number): void {
    this.noteSaisie = star;
    this.cdr.markForCheck();
  }

  getNoteLabel(note: number): string {
    switch (note) {
      case 1: return 'Médiocre';
      case 2: return 'Passable';
      case 3: return 'Correct & Conforme';
      case 4: return 'Très bon standing';
      case 5: return 'Exceptionnel & Coup de cœur';
      default: return 'Très bon';
    }
  }

  soumettreAvis(): void {
    if (!this.logement) return;
    const user = this.auth.currentUser();
  
    if (!user) {
      this.avisErrorMessage = 'Veuillez vous connecter pour laisser votre avis.';
      this.cdr.markForCheck();
      return;
    }

    if (!this.commentaireSaisi.trim()) {
      this.avisErrorMessage = 'Veuillez saisir votre commentaire.';
      this.cdr.markForCheck();
      return;
    }

    this.isSubmittingAvis = true;
    this.avisErrorMessage = '';
    this.avisSuccessMessage = '';

    const locataireInfo = {
      id: user.id,
      name: user.name || `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Locataire certifié'
    };

    this.logementService.ajouterAvisLogement(
      this.logement.id,
      this.noteSaisie,
      this.commentaireSaisi,
      locataireInfo
    ).subscribe({
      next: (res) => {
        this.isSubmittingAvis = false;
        this.avisSuccessMessage = 'Votre avis et votre note ont été enregistrés avec succès ! Merci pour votre contribution.';
        this.commentaireSaisi = '';
        this.noteSaisie = 5;

        // Mise à jour synchrone de l'instance locale
        if (this.logement) {
          const fresh = this.logementService.getLogementSync(this.logement.id);
          this.logement.avis = fresh.avis;
          this.logement.note_moyenne = fresh.note_moyenne;
          this.logement.nombre_avis = fresh.nombre_avis;
        }

        this.cdr.markForCheck();
      },
      error: () => {
        this.isSubmittingAvis = false;
        this.avisErrorMessage = 'Une erreur est survenue lors de l\'enregistrement de votre avis.';
        this.cdr.markForCheck();
      }
    });
  }

  toggleFav(logement: Logement): void {
    if (!this.auth.isLoggedIn()) {
      //alert('Connexion requise : Vous devez être connecté à votre compte locataire pour ajouter ce logement à vos favoris.');
      this.router.navigate(['/login'], { queryParams: { redirect: `/logements/${logement.id}` } });
      return;
    }
    this.favoriService.toggleFavori(logement);
    this.cdr.markForCheck();
  }

  isFav(id: number): boolean {
    return this.favoriService.isFavori(id);
  }
}
