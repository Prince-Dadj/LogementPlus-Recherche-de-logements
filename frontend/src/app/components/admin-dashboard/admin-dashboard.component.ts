import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { LogementService } from '../../services/logement.service';
import { ReservationService } from '../../services/reservation.service';
import { MessageService } from '../../services/message.service';
import { AgenceService } from '../../services/agence.service';
import { AuthService } from '../../services/auth.service';
import { ModalAlertService } from '../../services/modal-alert.service';
import { AdminStats, Logement, Reservation, Conversation, MessageItem, Agence, User } from '../../models/models';
import { Chart, registerables } from 'chart.js';
import { geocodeSenegal } from '../../utils/geocoding';
declare let L: any;

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container-fluid py-4 px-lg-4">
      <div class="row g-4">
        <!-- Barre latérale à gauche (CDC 8.6) -->
        <div class="col-lg-3">
          <div class="card border-0 shadow-sm rounded-2 p-3 bg-white sticky-top" style="top: 80px;">
            <div class="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
              <i class="bi bi-buildings-fill text-primary fs-4"></i>
              <div>
                <strong class="d-block text-dark">Espace Gestionnaire</strong>
                <span class="badge bg-warning text-dark small">Administrateur</span>
              </div>
            </div>

            <nav class="nav flex-column nav-pills gap-1">
              <button class="nav-link text-start py-2 px-3 rounded-3" [class.active]="activeTab === 'apercu'" (click)="setTab('apercu')">
                <i class="bi bi-speedometer2 me-2"></i> Vue d'ensemble
              </button>
              <button class="nav-link text-start py-2 px-3 rounded-3" [class.active]="activeTab === 'reservations'" (click)="setTab('reservations')">
                <i class="bi bi-calendar-check me-2"></i> Réservations
                @if (stats?.reservations_en_attente) {
                  <span class="badge bg-danger rounded-2 float-end">{{ stats?.reservations_en_attente }}</span>
                }
              </button>
              <button class="nav-link text-start py-2 px-3 rounded-3" [class.active]="activeTab === 'logements'" (click)="setTab('logements')">
                <i class="bi bi-house-door me-2"></i> Mes Logements
              </button>
              <button class="nav-link text-start py-2 px-3 rounded-3" [class.active]="activeTab === 'finances'" (click)="setTab('finances')">
                <i class="bi bi-cash-stack me-2"></i> Suivi Financier
              </button>
              <button class="nav-link text-start py-2 px-3 rounded-3 position-relative" [class.active]="activeTab === 'messagerie'" (click)="setTab('messagerie')">
                <i class="bi bi-chat-dots-fill me-2"></i> Messagerie
                @if (nbNonLusMessages > 0) {
                  <span class="badge bg-danger rounded-2 float-end">{{ nbNonLusMessages }}</span>
                }
              </button>
              <button class="nav-link text-start py-2 px-3 rounded-3" [class.active]="activeTab === 'agences'" (click)="setTab('agences')">
                <i class="bi bi-buildings me-2"></i> Agences
              </button>
              <button class="nav-link text-start py-2 px-3 rounded-3" [class.active]="activeTab === 'parametres'" (click)="setTab('parametres')">
                <i class="bi bi-gear-fill me-2"></i> Paramètres du compte
              </button>
            </nav>

            <div class="border-top pt-3 mt-4">
              <button class="btn btn-outline-primary btn-sm w-100 rounded-2 mb-2" (click)="exporterRapport()">
                <i class="bi bi-file-earmark-arrow-down me-1"></i> Export CSV
              </button>
            </div>
          </div>
        </div>

        <!-- Zone principale -->
        <div class="col-lg-9">
          <!-- BANDEAU DE NOTIFICATION EN TEMPS RÉEL POUR LE GESTIONNAIRE -->
          @if (nbDemandesEnAttente > 0) {
            <div class="alert alert-warning border border-warning border-opacity-50 shadow-sm rounded-2 p-3 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div class="d-flex align-items-center gap-3">
                <div class="rounded-circle bg-warning text-dark p-2 d-flex align-items-center justify-content-center shadow-sm" style="width: 44px; height: 44px;">
                  <i class="bi bi-bell-fill fs-5"></i>
                </div>
                <div>
                  <strong class="d-block text-dark">
                    🔔 {{ nbDemandesEnAttente }} nouvelle(s) demande(s) de réservation à traiter !
                  </strong>
                  <small class="text-muted">
                    Consultez le dossier du locataire (pièces d'identité et justificatifs de revenus) pour accepter ou rejeter la demande.
                  </small>
                </div>
              </div>
              <button class="btn btn-warning btn-sm text-dark fw-bold rounded-2 px-4 shadow-sm" (click)="setTab('reservations')">
                <i class="bi bi-folder-check me-1"></i> Examiner les demandes ({{ nbDemandesEnAttente }})
              </button>
            </div>
          }

          <!-- Indicateurs clés en haut (CDC 8.6 & Section 5) -->
          <div class="row g-3 mb-4">
            <div class="col-sm-6 col-xl-3">
              <div class="card border-0 shadow-sm rounded-2 p-3 bg-white">
                <span class="text-muted small">Logements gérés</span>
                <div class="d-flex align-items-baseline justify-content-between mt-1">
                  <h2 class="h3 fw-bold tabular-numbers text-primary mb-0">{{ stats?.nb_logements || 0 }}</h2>
                  <span class="badge bg-primary bg-opacity-10 text-primary small">Actifs</span>
                </div>
              </div>
            </div>

            <div class="col-sm-6 col-xl-3">
              <div class="card border-0 shadow-sm rounded-2 p-3 bg-white">
                <span class="text-muted small">Taux d'occupation estimé</span>
                <div class="d-flex align-items-baseline justify-content-between mt-1">
                  <h2 class="h3 fw-bold tabular-numbers text-success mb-0">{{ stats?.taux_occupation || 0 }}%</h2>
                  <span class="badge bg-success bg-opacity-10 text-success small">+4.2%</span>
                </div>
              </div>
            </div>

            <div class="col-sm-6 col-xl-3">
              <div class="card border-0 shadow-sm rounded-2 p-3 bg-white">
                <span class="text-muted small">Demandes en attente</span>
                <div class="d-flex align-items-baseline justify-content-between mt-1">
                  <h2 class="h3 fw-bold tabular-numbers text-warning mb-0">{{ stats?.reservations_en_attente || 0 }}</h2>
                  <span class="badge bg-warning bg-opacity-10 text-warning small">Sous 24h</span>
                </div>
              </div>
            </div>

            <div class="col-sm-6 col-xl-3">
              <div class="card border-0 shadow-sm rounded-2 p-3 bg-white">
                <span class="text-muted small">Revenus nets perçus</span>
                <div class="d-flex align-items-baseline justify-content-between mt-1">
                  <h2 class="h4 fw-bold tabular-numbers text-dark mb-0">{{ stats?.revenus_percus | number }} CFA</h2>
                  <span class="badge bg-info bg-opacity-10 text-info small">Net 90%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 1 : APERÇU AVEC GRAPHIQUES AU CENTRE (CDC 8.6 & RF-70) -->
          @if (activeTab === 'apercu') {
            <div class="row g-4 mb-4">
              <div class="col-lg-8">
                <div class="card border-0 shadow-sm rounded-2 p-4 bg-white h-100">
                  <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                    <h3 class="h6 fw-bold mb-0 text-dark">
                      <i class="bi bi-graph-up text-primary me-2"></i> Évolution mensuelle des revenus encaissés (FCFA)
                    </h3>
                    <div class="d-flex align-items-center gap-2">
                      <label class="small text-muted mb-0 fw-semibold">Année :</label>
                      <select class="form-select form-select-sm rounded-2 border-secondary-subtle" style="width: 105px;" [(ngModel)]="selectedAnnee" (change)="onAnneeChange()">
                        @for (an of anneesDisponibles; track an) {
                          <option [value]="an">{{ an }}</option>
                        }
                      </select>
                    </div>
                  </div>
                  <div style="height: 280px; position: relative;">
                    <canvas #revenueChart></canvas>
                  </div>
                </div>
              </div>

              <div class="col-lg-4">
                <div class="card border-0 shadow-sm rounded-2 p-4 bg-white h-100">
                  <h3 class="h6 fw-bold mb-3 text-dark">
                    <i class="bi bi-pie-chart text-primary me-2"></i> Répartition par type de bien
                  </h3>
                  <div style="height: 280px; position: relative;">
                    <canvas #typeChart></canvas>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- TAB 2 : DEMANDES DE RÉSERVATION (CDC RF-43) -->
          @if (activeTab === 'reservations' || activeTab === 'apercu') {
            <div class="card border-0 shadow-sm rounded-2 bg-white overflow-hidden mb-4">
              <div class="card-header bg-white border-bottom p-3 d-flex align-items-center justify-content-between">
                <h3 class="h6 fw-bold mb-0 text-dark">
                  <i class="bi bi-calendar2-check text-primary me-2"></i> Demandes de réservations à traiter (RF-43)
                </h3>
              </div>
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light small">
                    <tr>
                      <th>Réf</th>
                      <th>Logement</th>
                      <th>Locataire</th>
                      <th>Période</th>
                      <th>Montant Total</th>
                      <th>Statut</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (r of reservations; track r.id) {
                      <tr>
                        <td class="small fw-semibold font-monospace">#RES-{{ r.id }}</td>
                        <td>
                          <strong class="d-block small text-dark text-truncated" style="max-width: 120px;">{{ r.logement?.titre }}</strong>
                          <span class="text-muted small">{{ r.logement?.quartier }}</span>
                        </td>
                        <td>
                          <span class="small fw-medium">{{ r.locataire?.name }}</span>
                          <small class="d-block text-muted">{{ r.locataire?.telephone || r.locataire?.email }}</small>
                        </td>
                        <td class="small">Du {{ r.date_debut | date:'dd/MM/yyyy' }}<br>au {{ r.date_fin | date:'dd/MM/yyyy' }}</td>
                        <td class="fw-bold tabular-numbers text-primary small">{{ r.montant_total | number }} FCFA</td>
                        <td>
                          @if (r.statut === 'en_attente') {
                            <span class="badge-status-pending small rounded-2">En attente</span>
                          } @else if (r.statut === 'confirmee') {
                            <span class="badge-status-confirmed small rounded-2">Confirmée</span>
                          } @else if (r.statut === 'payee') {
                            <span class="badge-status-paid small rounded-2">Payée</span>
                          } @else if (r.statut === 'refusee') {
                            <span class="badge-status-cancelled small rounded-2">Refusée</span>
                          } @else {
                            <span class="badge bg-secondary small rounded-2">{{ r.statut }}</span>
                          }
                        </td>
                        <td class="text-end">
                          <div class="d-flex align-items-center justify-content-end gap-1">
                            <!-- <button class="btn btn-outline-secondary btn-sm" (click)="discuterAvecLocataire(r)" title="Discuter avec ce locataire dans la messagerie">
                              <i class="bi bi-chat-dots-fill text-primary"></i>
                            </button> -->
                            @if (r.statut === 'en_attente') {
                              <div class="btn-group btn-group-sm" style="p;">
                                <!-- Voir dossier locataire -->
                                <button class="btn btn-outline-primary" (click)="ouvrirDossier(r)"><i class="bi bi-folder2-open me-1"></i>Dossier</button>
                                <!-- Valider (CDC RF-43) -->
                                <button class="btn btn-success" (click)="valider(r.id)">
                                  <i class="bi bi-check-lg"></i> Accepter
                                </button>
                                <!-- Refuser avec motif (CDC RF-43) -->
                                <button class="btn btn-outline-danger" (click)="ouvrirRefusModal(r)">
                                  <i class="bi bi-x-lg"></i> Refuser
                                </button>
                              </div>
                            } @else {
                              <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-secondary btn-sm px-2" (click)="viewContrat(r)" title="Consulter le Contrat de Bail">
                                  <i class="bi bi-file-earmark-pdf"></i> Bail
                                </button>
                                <button class="btn btn btn-sm px-2" style="background: rgba(0,0,0,0.1);" (click)="viewRecu(r)" title="Consulter le Reçu Officiel">
                                  <i class="bi bi-receipt"></i> Reçu
                                </button>
                              </div>
                            }
                          </div>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="7" class="text-center py-4 text-muted">Aucune réservation pour le moment.</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- TAB 3 : MES LOGEMENTS (CDC RF-40 & RF-41) -->
          @if (activeTab === 'logements') {
            <div class="card border-0 shadow-sm rounded-2 bg-white overflow-hidden mb-4">
              <div class="card-header bg-white border-bottom p-3 d-flex align-items-center justify-content-between">
                <h3 class="h6 fw-bold mb-0 text-dark">
                  <i class="bi bi-house-door text-primary me-2"></i> Catalogue de mes logements (RF-40)
                </h3>
                <button class="btn btn-primary btn-sm rounded-2 px-3" (click)="ouvrirModalAjout()">
                  <i class="bi bi-plus-lg me-1"></i> Ajouter un logement
                </button>
              </div>

              <!-- Formulaire Ajout / Modification -->
              @if (showNewModal) {
                <div class="p-4 bg-light border-bottom">
                  <div class="d-flex align-items-center justify-content-between mb-3">
                    <h4 class="h6 fw-bold mb-0 text-primary">
                      <i class="bi {{ modeEditionLogement ? 'bi-pencil-square' : 'bi-plus-circle' }} me-1"></i>
                      {{ modeEditionLogement ? 'Modifier : ' + newLogement.titre : 'Nouveau logement à publier' }}
                    </h4>
                    <button class="btn-close" (click)="fermerModalLogement()"></button>
                  </div>

                  <form (ngSubmit)="sauvegarderLogement()">
                    <div class="row g-3">

                      <!-- Titre -->
                      <div class="col-md-8">
                        <label class="form-label small fw-semibold">Titre de l'annonce <span class="text-danger">*</span></label>
                        <input type="text" class="form-control form-control-sm" [(ngModel)]="newLogement.titre" name="titre" placeholder="Ex: Bel appartement meublé à Almadies..." required>
                      </div>

                      <!-- Type -->
                      <div class="col-md-4">
                        <label class="form-label small fw-semibold">Type de bien <span class="text-danger">*</span></label>
                        <select class="form-select form-select-sm" [(ngModel)]="newLogement.type" name="type">
                          <option value="appartement">Appartement</option>
                          <option value="studio">Studio</option>
                          <option value="maison">Maison / Villa</option>
                          <option value="chambre">Chambre</option>
                        </select>
                      </div>

                      <!-- Ville -->
                      <div class="col-md-4">
                        <label class="form-label small fw-semibold">Ville <span class="text-danger">*</span></label>
                        <select class="form-select form-select-sm" [(ngModel)]="newLogement.ville" name="ville" (change)="onVilleChange()">
                          @for (v of villesDisponibles; track v) {
                            <option [value]="v">{{ v }}</option>
                          }
                        </select>
                      </div>

                      <!-- Quartier -->
                      <div class="col-md-4">
                        <label class="form-label small fw-semibold">Quartier <span class="text-danger">*</span></label>
                        @if (quartiersDisponibles.length > 0) {
                          <select class="form-select form-select-sm" [(ngModel)]="newLogement.quartier" name="quartier" (change)="onAddressChange()">
                            <option value="">-- Choisir un quartier --</option>
                            @for (q of quartiersDisponibles; track q) {
                              <option [value]="q">{{ q }}</option>
                            }
                          </select>
                        } @else {
                          <input type="text" class="form-control form-control-sm" [(ngModel)]="newLogement.quartier" name="quartier" placeholder="Ex: Almadies, Fann..." (input)="onAddressChange()">
                        }
                      </div>

                      <!-- Adresse / Rue -->
                      <div class="col-md-4">
                        <label class="form-label small fw-semibold">Rue / Repère</label>
                        <input type="text" class="form-control form-control-sm" [(ngModel)]="newLogement.adresse" name="adresse" placeholder="Ex: Rue 10, près de la mosquée...">
                      </div>

                      <!-- Badge coordonnées GPS -->
                      <div class="col-12">
                        <div class="d-flex align-items-center gap-2 flex-wrap">
                          <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 small">
                            <i class="bi bi-geo-alt-fill me-1"></i>
                            Lat : {{ newLogement.latitude | number:'1.4-6' }} &nbsp;|&nbsp; Lng : {{ newLogement.longitude | number:'1.4-6' }}
                          </span>
                          <span class="text-muted small">
                            <i class="bi bi-info-circle me-1"></i>Coordonnées calculées automatiquement. Déplacez le marqueur sur la carte pour affiner.
                          </span>
                        </div>
                      </div>

                      <!-- Carte Leaflet interactive -->
                      <div class="col-12">
                        <label class="form-label small fw-semibold"><i class="bi bi-map me-1 text-primary"></i>Localisation sur la carte (marqueur déplaçable)</label>
                        <div #formMap style="height: 240px; border-radius: 8px; border: 1px solid #dee2e6; overflow: hidden;"></div>
                      </div>

                      <!-- Loyer & Surface & Pièces -->
                      <div class="col-md-4">
                        <label class="form-label small fw-semibold">Loyer mensuel (FCFA) <span class="text-danger">*</span></label>
                        <input type="number" class="form-control form-control-sm" [(ngModel)]="newLogement.prix_par_mois" name="prix_par_mois" min="10000" required>
                      </div>
                      <div class="col-md-4">
                        <label class="form-label small fw-semibold">Surface (m²) <span class="text-danger">*</span></label>
                        <input type="number" class="form-control form-control-sm" [(ngModel)]="newLogement.surface" name="surface" min="5" required>
                      </div>
                      <div class="col-md-4">
                        <label class="form-label small fw-semibold">Nombre de pièces</label>
                        <input type="number" class="form-control form-control-sm" [(ngModel)]="newLogement.nb_pieces" name="nb_pieces" min="1">
                      </div>

                      <!-- Meublé & Mode réservation -->
                      <div class="col-md-4">
                        <label class="form-label small fw-semibold">Meublé</label>
                        <select class="form-select form-select-sm" [(ngModel)]="newLogement.meuble" name="meuble">
                          <option [value]="true">Oui - meublé</option>
                          <option [value]="false">Non - vide</option>
                        </select>
                      </div>
                      <div class="col-md-4">
                        <label class="form-label small fw-semibold">Mode de réservation</label>
                        <select class="form-select form-select-sm" [(ngModel)]="newLogement.mode_reservation" name="mode_reservation">
                          <option value="immediate">Réservation immédiate</option>
                          <option value="sur_demande">Sur demande (24h)</option>
                        </select>
                      </div>
                      <div class="col-md-4">
                        <label class="form-label small fw-semibold">Politique d'annulation</label>
                        <select class="form-select form-select-sm" [(ngModel)]="newLogement.politique_annulation" name="politique_annulation">
                          <option value="gratuite">Gratuite (7 jours)</option>
                          <option value="moderee">Modérée (3 jours)</option>
                          <option value="stricte">Stricte (non remboursable)</option>
                        </select>
                      </div>

                      <!-- Points d'intérêt & Accessibilité -->
                      <div class="col-md-6">
                        <label class="form-label small fw-semibold">Points d'intérêt proches</label>
                        <input type="text" class="form-control form-control-sm" [(ngModel)]="newLogement.points_interet" name="points_interet" placeholder="Ex: UGB à 5 min, marché, pharmacie...">
                      </div>
                      <div class="col-md-6">
                        <label class="form-label small fw-semibold">Accessibilité</label>
                        <input type="text" class="form-control form-control-sm" [(ngModel)]="newLogement.accessibilite" name="accessibilite" placeholder="Ex: Bus ligne 5, taxi à 200m...">
                      </div>

                      <!-- Description -->
                      <div class="col-12">
                        <label class="form-label small fw-semibold">Description détaillée <span class="text-danger">*</span></label>
                        <textarea class="form-control form-control-sm" rows="3" [(ngModel)]="newLogement.description" name="description" placeholder="Décrivez le logement : équipements, vue, environnement..." required></textarea>
                      </div>

                      <!-- Upload Photos -->
                      <div class="col-12">
                        <label class="form-label small fw-semibold">
                          <i class="bi bi-images me-1 text-primary"></i>Photos du logement
                          <span class="text-muted fw-normal">(min. 3 recommandées - CDC RF-41)</span>
                        </label>
                        <div class="border rounded-3 p-3 bg-white">
                          <label class="btn btn-outline-primary btn-sm mb-3 d-inline-flex align-items-center gap-2" style="cursor:pointer;">
                            <i class="bi bi-cloud-upload"></i> Téléverser des photos depuis votre appareil
                            <input type="file" multiple accept="image/*" (change)="onHousingFilesSelected($event)" style="display:none;">
                          </label>

                          @if (uploadedPhotosPreviews.length > 0) {
                            <div class="row g-2">
                              @for (photo of uploadedPhotosPreviews; track photo; let i = $index) {
                                <div class="col-6 col-md-3 position-relative">
                                  <img [src]="photo" class="img-fluid rounded-3 object-fit-cover w-100" style="height: 100px;" alt="Photo {{ i + 1 }}">
                                  @if (i === 0) {
                                    <span class="position-absolute top-0 start-0 badge bg-primary m-1" style="font-size: 10px;">Principale</span>
                                  }
                                  <div class="position-absolute top-0 end-0 m-1 d-flex flex-column gap-1">
                                    <button type="button" class="btn btn-danger btn-sm p-0 d-flex align-items-center justify-content-center" style="width:22px;height:22px;" (click)="removeHousingPhoto(i)" title="Supprimer">
                                      <i class="bi bi-x" style="font-size:12px;"></i>
                                    </button>
                                    @if (i > 0) {
                                      <button type="button" class="btn btn-primary btn-sm p-0 d-flex align-items-center justify-content-center" style="width:22px;height:22px;" (click)="setPrimaryHousingPhoto(i)" title="Définir comme photo principale">
                                        <i class="bi bi-star" style="font-size:10px;"></i>
                                      </button>
                                    }
                                  </div>
                                </div>
                              }
                            </div>
                            <small class="text-muted d-block mt-2">{{ uploadedPhotosPreviews.length }} photo(s) sélectionnée(s). Cliquez ⭐ pour définir la photo principale.</small>
                          } @else {
                            <div class="text-center text-muted py-3 small">
                              <i class="bi bi-camera fs-3 d-block mb-1 text-secondary"></i>
                              Aucune photo sélectionnée. Téléversez au moins 3 photos.
                            </div>
                          }
                        </div>
                      </div>

                      <!-- Boutons -->
                      <div class="col-12 d-flex justify-content-end gap-2 pt-2 border-top">
                        <button type="button" class="btn btn-secondary btn-sm px-4" (click)="fermerModalLogement()">
                          <i class="bi bi-x me-1"></i>Annuler
                        </button>
                        <button type="submit" class="btn btn-primary btn-sm px-4 fw-semibold">
                          <i class="bi {{ modeEditionLogement ? 'bi-check-lg' : 'bi-cloud-upload' }} me-1"></i>
                          {{ modeEditionLogement ? 'Enregistrer les modifications' : 'Publier le logement' }}
                        </button>
                      </div>

                    </div>
                  </form>
                </div>
              }

              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light small">
                    <tr>
                      <th>Bien</th>
                      <th>Type & Surface</th>
                      <th>Loyer / mois</th>
                      <th>Mode réservation</th>
                      <th>Statut</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (logement of logements; track logement.id) {
                      <tr>
                        <td>
                          <div class="d-flex align-items-center gap-2">
                            <img [src]="logement.image_principale" class="rounded-3 object-fit-cover" style="width: 50px; height: 40px;" alt="">
                            <div>
                              <strong class="d-block small text-dark text-truncated" style="max-width: 150px;">{{ logement.titre }}</strong>
                              <span class="text-muted small">{{ logement.quartier }}, {{ logement.ville }}</span>
                            </div>
                          </div>
                        </td>
                        <td class="small">{{ logement.type | uppercase }} • {{ logement.surface }} m² ({{ logement.nb_pieces }} p.)</td>
                        <td class="fw-bold tabular-numbers text-primary small">{{ logement.prix_par_mois | number }} FCFA</td>
                        <td>
                          <span class="badge" [ngClass]="logement.mode_reservation === 'immediate' ? 'bg-success' : 'bg-warning text-dark'">
                            {{ logement.mode_reservation === 'immediate' ? 'Immédiate' : 'Sous 24h' }}
                          </span>
                        </td>
                        <td>
                          @if (logement.est_occupe) {
                            <span class="badge bg-danger me-1"><i class="bi bi-lock-fill me-1"></i>Occupé</span>
                          }
                          <span class="badge" [ngClass]="logement.statut === 'publie' ? 'bg-success' : 'bg-secondary'">
                            {{ logement.statut }}
                          </span>
                        </td>
                        <td class="text-end">
                          <div class="d-flex gap-1 justify-content-end flex-wrap">
                            <button class="btn btn-outline-secondary btn-sm rounded-2" (click)="toggleStatut(logement)" title="{{ logement.statut === 'publie' ? 'Mettre hors ligne' : 'Publier' }}">
                              <i class="bi" [class.bi-eye-slash]="logement.statut === 'publie'" [class.bi-eye]="logement.statut !== 'publie'"></i>
                              <!-- <span class="d-none d-lg-inline ms-1">{{ logement.statut === 'publie' ? 'Hors ligne' : 'Publier' }}</span> -->
                            </button>
                            <button class="btn btn-outline-primary btn-sm rounded-2" (click)="editerLogement(logement)" title="Modifier">
                              <i class="bi bi-pencil-square"></i>
                              <span class="d-none d-lg-inline ms-1"></span>
                            </button>
                            <button class="btn btn-outline-danger btn-sm rounded-2" (click)="confirmerSupprimerLogement(logement)" title="Supprimer">
                              <i class="bi bi-trash"></i>
                              <span class="d-none d-lg-inline ms-1"></span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- TAB 4 : SUIVI FINANCIER & REVERSEMENTS (CDC RF-36 & RF-45) -->
          @if (activeTab === 'finances') {
            <div class="card border-0 shadow-sm rounded-2 p-4 bg-white mb-4">
              <h3 class="h6 fw-bold mb-3 text-dark">
                <i class="bi bi-wallet2 text-primary me-2"></i> Suivi des encaissements & Reversements (CDC RF-45)
              </h3>
              <p class="text-muted small">
                La plateforme prélève une commission de 10% sur les réservations validées. Les reversements nets (90%) sont versés directement sur votre compte bancaire ou Mobile Money selon le calendrier convenu.
              </p>

              <div class="p-3 bg-light rounded-3 mb-4">
                <div class="row text-center g-3">
                  <div class="col-md-4 border-end">
                    <span class="small text-muted d-block">Montant brut des réservations</span>
                    <strong class="fs-5 text-dark tabular-numbers">{{ (stats?.revenus_percus || 0) * 1.11 | number:'1.0-0' }} FCFA</strong>
                  </div>
                  <div class="col-md-4 border-end">
                    <span class="small text-muted d-block">Commission plateforme (10%)</span>
                    <strong class="fs-5 text-danger tabular-numbers">- {{ (stats?.revenus_percus || 0) * 0.11 | number:'1.0-0' }} FCFA</strong>
                  </div>
                  <div class="col-md-4">
                    <span class="small text-muted d-block">Total reversé à votre agence</span>
                    <strong class="fs-5 text-success tabular-numbers">{{ stats?.revenus_percus | number }} FCFA</strong>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-end">
                <button class="btn btn-outline-primary rounded-2 px-4" (click)="exporterRapport()">
                  <i class="bi bi-file-earmark-excel me-1"></i> Télécharger l'état financier complet (CSV)
                </button>
              </div>
            </div>
          }

          <!-- TAB 5 : MESSAGERIE DYNAMIQUE DU GESTIONNAIRE -->
          @if (activeTab === 'messagerie') {
            <div class="card border-0 shadow-sm rounded-2 bg-white overflow-hidden mb-4">
              <div class="row g-0" style="min-height: 580px;">
                <!-- Liste des conversations locataires (responsive mobile) -->
                <div class="col-lg-4 border-end" [class.d-none]="mobileShowConversation" [class.d-lg-block]="true">
                  <div class="p-3 border-bottom bg-light d-flex align-items-center justify-content-between">
                    <div>
                      <h3 class="h6 fw-bold mb-0 text-dark">
                        <i class="bi bi-chat-dots-fill text-primary me-2"></i>Messagerie Locataires
                      </h3>
                      <small class="text-muted" style="font-size: 11px;">Échanges directs et validation des réservations</small>
                    </div>
                    @if (nbNonLusMessages > 0) {
                      <span class="badge bg-danger rounded-2">{{ nbNonLusMessages }} non lu(s)</span>
                    }
                  </div>

                  <div class="list-group list-group-flush overflow-y-auto" style="max-height: 520px;">
                    @if (conversations.length === 0) {
                      <div class="p-4 text-center text-muted">
                        <i class="bi bi-chat-left-text fs-3 d-block mb-2 text-secondary"></i>
                        <p class="small mb-0">Aucune conversation active avec un locataire.</p>
                      </div>
                    }
                    @for (conv of conversations; track conv.id) {
                      <button
                        type="button"
                        class="list-group-item list-group-item-action p-3 border-bottom text-start"
                        [class.bg-light]="activeConvId === conv.id"
                        [class.border-primary]="activeConvId === conv.id"
                        (click)="selectionnerConversation(conv.id)">
                        <div class="d-flex align-items-start gap-2">
                          <img [src]="conv.interlocuteur.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80'" 
                               class="rounded-circle object-fit-cover shadow-sm" 
                               style="width: 44px; height: 44px;" 
                               alt="Avatar">
                          <div class="flex-grow-1 min-w-0">
                            <div class="d-flex align-items-center justify-content-between mb-1">
                              <strong class="text-dark small text-truncate d-block" style="max-width: 150px;">
                                {{ conv.interlocuteur.name }}
                              </strong>
                              <span class="text-muted" style="font-size: 10px;">{{ messageService.getRelativeTime(conv.dateDernierMessage) }}</span>
                            </div>
                            @if (conv.logement_titre) {
                              <span class="badge bg-primary bg-opacity-10 text-primary small d-inline-block text-truncate mb-1" style="font-size: 9px; max-width: 160px;">
                                {{ conv.logement_titre }}
                              </span>
                            }
                            <p class="text-muted small text-truncate mb-0" style="font-size: 11px;">
                              {{ conv.dernierMessage }}
                            </p>
                          </div>
                          @if (conv.nonLus && conv.nonLus > 0) {
                            <span class="badge bg-danger rounded-2">{{ conv.nonLus }}</span>
                          }
                        </div>
                      </button>
                    }
                  </div>
                </div>

                <!-- Fil de discussion (responsive mobile) -->
                <div class="col-lg-8 d-flex flex-column" [class.d-none]="!mobileShowConversation" [class.d-lg-flex]="true">
                  @if (activeConversation) {
                    <!-- Entête conversation -->
                    <div class="p-3 border-bottom bg-white d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div class="d-flex align-items-center gap-2">
                        <!-- Bouton retour sur mobile -->
                        <button class="btn btn-sm btn-light border d-lg-none" type="button" (click)="retourListeConversations()" title="Retour à la liste">
                          <i class="bi bi-chevron-left me-1"></i> Messages
                        </button>
                        <img [src]="activeConversation.interlocuteur.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80'" 
                             class="rounded-circle object-fit-cover shadow-sm" 
                             style="width: 44px; height: 44px;" 
                             alt="Avatar">
                        <div>
                          <div class="d-flex align-items-center gap-2">
                            <h3 class="h6 fw-bold mb-0 text-dark">{{ activeConversation.interlocuteur.name }}</h3>
                            <span class="badge bg-secondary small">Locataire</span>
                          </div>
                          <small class="text-muted" style="font-size: 11px;">
                            {{ activeConversation.interlocuteur.telephone || '+221 77 100 00 01' }}
                            @if (activeConversation.logement_titre) {
                              • « {{ activeConversation.logement_titre }} »
                            }
                          </small>
                        </div>
                      </div>

                      <div class="d-flex gap-2">
                        @if (activeConversation.reservation_id) {
                          <button class="btn btn-outline-primary btn-sm rounded-2 px-3" (click)="setTab('reservations')">
                            <i class="bi bi-folder-check me-1"></i> Voir la réservation
                          </button>
                        }
                      </div>
                    </div>

                    <!-- Messages scrollables -->
                    <div class="p-4 flex-grow-1 overflow-y-auto bg-light" style="max-height: 420px;">
                      @for (msg of activeConversation.messages; track msg.id) {
                        <div class="d-flex mb-3" [class.justify-content-end]="msg.expediteur?.role === 'gestionnaire'" [class.justify-content-start]="msg.expediteur?.role !== 'gestionnaire'">
                          <div class="card border-0 shadow-sm rounded-2 p-3" 
                               [style.max-width]="'85%'"
                               [class.bg-primary]="msg.expediteur?.role === 'gestionnaire'"
                               [class.text-white]="msg.expediteur?.role === 'gestionnaire'"
                               [class.bg-white]="msg.expediteur?.role !== 'gestionnaire'">
                            
                            <div class="d-flex align-items-center justify-content-between mb-1 gap-3">
                              <small class="fw-semibold" [class.text-white-50]="msg.expediteur?.role === 'gestionnaire'" [class.text-primary]="msg.expediteur?.role !== 'gestionnaire'">
                                {{ msg.expediteur?.name }}
                              </small>
                              <small [class.text-white-50]="msg.expediteur?.role === 'gestionnaire'" [class.text-muted]="msg.expediteur?.role !== 'gestionnaire'" style="font-size: 10px;">
                                {{ msg.created_at | date:'HH:mm' }}
                              </small>
                            </div>

                            <p class="mb-0 small" style="white-space: pre-line; line-height: 1.5;">
                              {{ msg.contenu }}
                            </p>
                          </div>
                        </div>
                      }
                    </div>

                    <!-- Zone de réponse -->
                    <div class="p-3 border-top bg-white">
                      <form (ngSubmit)="envoyerMessage()" class="d-flex gap-2">
                        <input type="text" 
                               class="form-control rounded-2 px-3" 
                               placeholder="Répondre à ce locataire..." 
                               [(ngModel)]="newMessageContenu" 
                               name="messageInputAdmin"
                               required>
                        <button type="submit" 
                                class="btn btn-primary rounded-2 px-3 px-sm-4 d-flex align-items-center gap-2 fw-semibold"
                                [disabled]="!newMessageContenu.trim()">
                          <span class="d-none d-sm-inline">Envoyer</span>
                          <i class="bi bi-send-fill"></i>
                        </button>
                      </form>
                    </div>
                  } @else {
                    <div class="d-flex flex-column align-items-center justify-content-center h-100 p-5 text-center text-muted" [class.d-none]="mobileShowConversation">
                      <i class="bi bi-chat-left-dots text-primary display-4 mb-3"></i>
                      <h4 class="h6 fw-bold text-dark">Sélectionnez une conversation</h4>
                      <p class="small text-muted mb-0">Choisissez un locataire pour consulter les échanges et lui répondre en direct.</p>
                    </div>
                  }
                </div>
              </div>
            </div>
          }

          <!-- ============================================================
               ONGLET GESTION DES AGENCES IMMOBILIÈRES
               ============================================================ -->
          @if (activeTab === 'agences') {
            <div class="card border-0 shadow-sm rounded-2 overflow-hidden bg-white mb-4">
              <div class="card-header bg-white border-bottom p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div>
                  <h2 class="h5 fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                    <i class="bi bi-buildings text-primary"></i> Gestion des Agences Partenaires
                  </h2>
                  <p class="text-muted small mb-0">Enregistrez, certifiez et administrez les agences immobilières partenaires de LogementPlus.</p>
                </div>
                <button class="btn btn-primary rounded-2 px-4 fw-semibold shadow-sm d-flex align-items-center gap-2" (click)="ouvrirAddAgenceModal()">
                  <i class="bi bi-plus-circle-fill"></i>
                  <span>Ajouter une agence</span>
                </button>
              </div>

              <div class="card-body p-4">
                @if (agenceLoading) {
                  <div class="text-center py-5">
                    <div class="spinner-border text-primary" style="width: 2.5rem; height: 2.5rem;" role="status">
                      <span class="visually-hidden">Chargement...</span>
                    </div>
                    <p class="text-muted mt-3 small">Chargement des agences en cours...</p>
                  </div>
                } @else if (agencesAdmin.length > 0) {
                  <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                      <thead class="table-light text-muted small">
                        <tr>
                          <th>Agence & Logo</th>
                          <th>Localisation</th>
                          <th>Contact</th>
                          <th>Biens</th>
                          <th>Statut</th>
                          <th class="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (ag of agencesAdmin; track ag.id) {
                          <tr>
                            <td>
                              <div class="d-flex align-items-center gap-3">
                                @if (ag.logo_url) {
                                  <img [src]="ag.logo_url" [alt]="ag.nom" class="rounded-3 object-fit-cover shadow-sm border" style="width: 44px; height: 44px;">
                                } @else {
                                  <div class="rounded-3 d-flex align-items-center justify-content-center shadow-sm" style="width: 44px; height: 44px; background: rgba(20, 184, 166, 0.12); color: #0d9488;">
                                    <i class="bi {{ ag.icone || 'bi-buildings' }} fs-4"></i>
                                  </div>
                                }
                                <div>
                                  <strong class="d-block text-dark small ">{{ ag.nom }}</strong>
                                  <small class="text-muted d-block text-truncate" style="max-width: 120px;">
                                    {{ ag.description || 'Agence immobilière partenaire' }}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span class="small fw-medium text-dark"><i class="bi bi-geo-alt text-danger me-1"></i>{{ ag.ville }}</span>
                              @if (ag.adresse) {
                                <small class="d-block text-muted">{{ ag.adresse }}</small>
                              }
                            </td>
                            <td>
                              @if (ag.telephone) {
                                <div class="small"><i class="bi bi-telephone text-primary me-1"></i>{{ ag.telephone }}</div>
                              }
                              @if (ag.email) {
                                <small class="text-muted d-block"><i class="bi bi-envelope text-secondary me-1"></i>{{ ag.email }}</small>
                              }
                            </td>
                            <td>
                              <span class="badge bg-light text-dark border px-2 py-1 small">
                                {{ ag.nombre_biens || 0 }} bien(s)
                              </span>
                            </td>
                            <td>
                              @if (ag.est_partenaire_certifie) {
                                <span class="badge rounded-2 px-3 py-1" style="background: rgba(20, 184, 166, 0.15); color: #0f766e;">
                                  <i class="bi bi-patch-check-fill me-1"></i> Partenaire Certifié
                                </span>
                              } @else {
                                <span class="badge rounded-2 bg-secondary bg-opacity-10 text-secondary px-3 py-1">
                                  Standard
                                </span>
                              }
                            </td>
                            <td class="text-end">
                              @if (ag.site_web) {
                                <a [href]="ag.site_web" target="_blank" rel="noopener noreferrer" class="btn btn-outline-secondary btn-sm rounded-2 px-3" title="Visiter le site web">
                                  <i class="bi bi-box-arrow-up-right me-1"></i> Site
                                </a>
                              }
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                } @else {
                  <div class="text-center py-5">
                    <div class="mb-3 d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary" style="width: 64px; height: 64px;">
                      <i class="bi bi-buildings-fill fs-2"></i>
                    </div>
                    <h3 class="h5 fw-bold text-dark mb-2">Aucune agence enregistrée</h3>
                    <p class="text-muted small mb-4" style="max-width: 420px; margin: 0 auto;">
                      Aucune agence immobilière n'est répertoriée dans la base de données. Ajoutez dès maintenant la première agence.
                    </p>
                    <button class="btn btn-primary rounded-2 px-4 shadow-sm" (click)="ouvrirAddAgenceModal()">
                      <i class="bi bi-plus-circle-fill me-2"></i> Ajouter une agence
                    </button>
                  </div>
                }
              </div>
            </div>
          }

          <!-- ============================================================
               ONGLET PARAMÈTRES DU COMPTE GESTIONNAIRE
               ============================================================ -->
          @if (activeTab === 'parametres') {
            <div class="row g-4 mb-4">
              <!-- Profil Header & Avatar -->
              <div class="col-12">
                <div class="card border-0 shadow-sm rounded-2 bg-white p-4">
                  <div class="d-flex align-items-center gap-4 flex-wrap">
                    <!-- Photo de profil avec badge caméra modifiable -->
                    <div class="position-relative">
                      <img [src]="avatarPreview || currentUser()?.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80'" 
                           class="rounded-circle object-fit-cover shadow-sm border border-3 border-primary-subtle" 
                           style="width: 88px; height: 88px;" 
                           alt="Photo de profil">
                      <label class="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 shadow-sm d-flex align-items-center justify-content-center" 
                             style="width: 32px; height: 32px; cursor: pointer;" 
                             title="Changer ma photo de profil">
                        <i class="bi bi-camera-fill" style="font-size: 13px;"></i>
                        <input type="file" accept="image/*" class="d-none" (change)="onAvatarFileSelected($event)">
                      </label>
                    </div>

                    <div>
                      <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
                        <h2 class="h5 fw-bold text-dark mb-0">{{ currentUser()?.name || 'Gestionnaire' }}</h2>
                        <span class="badge bg-warning text-dark border border-warning border-opacity-25 rounded-2 px-2 py-1 small fw-semibold">
                          <i class="bi bi-shield-check me-1"></i>Gestionnaire Immobilier
                        </span>
                        <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-2 px-2 py-1 small fw-semibold">
                          <i class="bi bi-check-circle-fill me-1"></i>Actif
                        </span>
                      </div>
                      <div class="text-muted small d-flex align-items-center gap-3 flex-wrap">
                        <span><i class="bi bi-envelope me-1 text-primary"></i>{{ currentUser()?.email }}</span>
                        <span><i class="bi bi-telephone me-1 text-primary"></i>{{ currentUser()?.telephone || 'Non renseigné' }}</span>
                        @if (currentUser()?.raison_sociale) {
                          <span><i class="bi bi-buildings me-1 text-primary"></i>{{ currentUser()?.raison_sociale }}</span>
                        }
                      </div>
                    </div>
                  </div>

                  <!-- Si photo sélectionnée en preview -->
                  @if (selectedAvatarFile) {
                    <div class="p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center gap-3 mt-3">
                      <div>
                        <strong class="d-block small text-dark"><i class="bi bi-image text-primary me-1"></i>Nouvelle photo sélectionnée</strong>
                        <small class="text-muted" style="font-size: 11px;">{{ selectedAvatarFile.name }}</small>
                      </div>
                      <div class="d-flex gap-2">
                        <button type="button" class="btn btn-sm btn-outline-secondary rounded-2 px-3" (click)="annulerAvatarPreview()" [disabled]="isUploadingAvatar">
                          Annuler
                        </button>
                        <button type="button" class="btn btn-sm btn-primary rounded-2 px-3 fw-semibold shadow-sm" (click)="sauvegarderAvatar()" [disabled]="isUploadingAvatar">
                          @if (isUploadingAvatar) {
                            <span class="spinner-border spinner-border-sm me-1"></span>
                          } @else {
                            <i class="bi bi-check-lg me-1"></i>
                          }
                          Enregistrer la photo
                        </button>
                      </div>
                    </div>
                  }

                  @if (avatarSuccessMessage) {
                    <div class="alert alert-success d-flex align-items-center gap-2 small py-2 rounded-3 mt-3 mb-0">
                      <i class="bi bi-check-circle-fill"></i>
                      <div>{{ avatarSuccessMessage }}</div>
                    </div>
                  }
                  @if (avatarErrorMessage) {
                    <div class="alert alert-danger d-flex align-items-center gap-2 small py-2 rounded-3 mt-3 mb-0">
                      <i class="bi bi-exclamation-triangle-fill"></i>
                      <div>{{ avatarErrorMessage }}</div>
                    </div>
                  }
                </div>
              </div>

              <!-- Colonne 1 : Informations personnelles (Consultation & Modification) -->
              <div class="col-lg-7">
                <div class="card border-0 shadow-sm rounded-2 bg-white p-4 h-100">
                  <div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3 flex-wrap gap-2">
                    <div class="d-flex align-items-center gap-2">
                      <div class="rounded-circle bg-primary bg-opacity-10 text-primary p-2 d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
                        <i class="bi bi-person-vcard fs-5"></i>
                      </div>
                      <div>
                        <h2 class="h6 fw-bold text-dark mb-0">Informations Personnelles</h2>
                        <small class="text-muted" style="font-size: 11px;">Gérez vos coordonnées officielles enregistrées</small>
                      </div>
                    </div>

                    @if (!modeEditionProfil) {
                      <button type="button" class="btn btn-outline-primary btn-sm rounded-2 px-3 fw-semibold shadow-sm" (click)="activerEditionProfil()">
                        <i class="bi bi-pencil-square me-1"></i> Modifier mes coordonnées
                      </button>
                    } @else {
                      <button type="button" class="btn btn-light btn-sm rounded-2 px-3 border" (click)="annulerEditionProfil()" [disabled]="isSavingProfile">
                        Annuler
                      </button>
                    }
                  </div>

                  @if (profileSuccess) {
                    <div class="alert alert-success d-flex align-items-center gap-2 small py-2 rounded-3 mb-3">
                      <i class="bi bi-check-circle-fill"></i>
                      <div>{{ profileSuccessMessage || 'Vos informations ont été mises à jour avec succès en base de données.' }}</div>
                    </div>
                  }

                  @if (profileError) {
                    <div class="alert alert-danger d-flex align-items-center gap-2 small py-2 rounded-3 mb-3">
                      <i class="bi bi-exclamation-triangle-fill"></i>
                      <div>{{ profileErrorMessage }}</div>
                    </div>
                  }

                  @if (!modeEditionProfil) {
                    <!-- Mode Consultation -->
                    <div class="row g-3 py-2">
                      <div class="col-sm-6">
                        <label class="text-muted small d-block mb-1">Prénom</label>
                        <div class="p-2 rounded-3 bg-light border text-dark fw-semibold small">
                          {{ profilePrenom || currentUser()?.prenom || 'Non renseigné' }}
                        </div>
                      </div>
                      <div class="col-sm-6">
                        <label class="text-muted small d-block mb-1">Nom de famille</label>
                        <div class="p-2 rounded-3 bg-light border text-dark fw-semibold small">
                          {{ profileNom || currentUser()?.nom || 'Non renseigné' }}
                        </div>
                      </div>
                      <div class="col-12">
                        <label class="text-muted small d-block mb-1">Adresse E-mail</label>
                        <div class="p-2 rounded-3 bg-light border text-dark fw-semibold small d-flex align-items-center justify-content-between">
                          <span>{{ profileEmail || currentUser()?.email }}</span>
                          <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25" style="font-size: 10px;">Vérifié</span>
                        </div>
                      </div>
                      <div class="col-12">
                        <label class="text-muted small d-block mb-1">Numéro de Téléphone (Sénégal)</label>
                        <div class="p-2 rounded-3 bg-light border text-dark fw-semibold small">
                          {{ currentUser()?.telephone || (profileTelephone ? '+221 ' + profileTelephone : 'Non renseigné') }}
                        </div>
                      </div>
                      <div class="col-12 mt-3">
                        <div class="p-3 rounded-3 border bg-light text-muted small" style="font-size: 11px;">
                          <i class="bi bi-info-circle-fill text-primary me-1"></i>
                          Ces informations apparaissent sur vos contrats de bail générés, mandats de gestion et notifications adressées aux locataires.
                        </div>
                      </div>
                    </div>
                  } @else {
                    <!-- Mode Édition -->
                    <form (ngSubmit)="confirmerEtSauvegarderProfil()">
                      <div class="row g-3 mb-3">
                        <div class="col-sm-6">
                          <label class="form-label small fw-semibold text-dark">Prénom <span class="text-danger">*</span></label>
                          <input type="text" class="form-control form-control-sm rounded-3" [(ngModel)]="profilePrenom" name="prenom" required>
                        </div>
                        <div class="col-sm-6">
                          <label class="form-label small fw-semibold text-dark">Nom de famille <span class="text-danger">*</span></label>
                          <input type="text" class="form-control form-control-sm rounded-3" [(ngModel)]="profileNom" name="nom" required>
                        </div>
                      </div>

                      <div class="mb-3">
                        <label class="form-label small fw-semibold text-dark">Adresse E-mail <span class="text-danger">*</span></label>
                        <input type="email" class="form-control form-control-sm rounded-3" [(ngModel)]="profileEmail" name="email" required>
                        <small class="text-muted" style="font-size: 11px;">Sert d'identifiant officiel pour la connexion à votre compte gestionnaire.</small>
                      </div>

                      <div class="mb-3">
                        <label class="form-label small fw-semibold text-dark">Numéro de Téléphone (Sénégal)</label>
                        <div class="input-group input-group-sm">
                          <span class="input-group-text bg-light text-muted">+221</span>
                          <input type="text" class="form-control rounded-end-3" placeholder="77 000 00 00" [(ngModel)]="profileTelephone" name="telephone">
                        </div>
                        <small class="text-muted" style="font-size: 11px;">Transmis aux locataires lors des prises de contact et des confirmations de réservations.</small>
                      </div>

                      <div class="d-flex justify-content-end gap-2 pt-2 border-top mt-3">
                        <button type="button" class="btn btn-light btn-sm rounded-2 px-3" (click)="annulerEditionProfil()" [disabled]="isSavingProfile">
                          Annuler
                        </button>
                        <button type="submit" class="btn btn-primary btn-sm rounded-2 px-4 fw-semibold shadow-sm" [disabled]="isSavingProfile || !profilePrenom.trim() || !profileNom.trim() || !profileEmail.trim()">
                          @if (isSavingProfile) {
                            <span class="spinner-border spinner-border-sm me-1"></span> Enregistrement...
                          } @else {
                            <i class="bi bi-check2 me-1"></i> Enregistrer les modifications
                          }
                        </button>
                      </div>
                    </form>
                  }
                </div>
              </div>

              <!-- Colonne 2 : Sécurité & Changement de mot de passe -->
              <div class="col-lg-5">
                <div class="card border-0 shadow-sm rounded-2 bg-white p-4 h-100">
                  <div class="d-flex align-items-center gap-2 mb-3 border-bottom pb-3">
                    <div class="rounded-circle bg-warning bg-opacity-10 text-warning p-2 d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
                      <i class="bi bi-shield-lock-fill fs-5"></i>
                    </div>
                    <div>
                      <h2 class="h6 fw-bold text-dark mb-0">Sécurité & Mot de Passe</h2>
                      <small class="text-muted" style="font-size: 11px;">Modifier votre mot de passe d'accès</small>
                    </div>
                  </div>

                  @if (passwordSuccess) {
                    <div class="alert alert-success d-flex align-items-center gap-2 small py-2 rounded-3 mb-3">
                      <i class="bi bi-check-circle-fill"></i>
                      <div>{{ passwordSuccessMessage }}</div>
                    </div>
                  }

                  @if (passwordError) {
                    <div class="alert alert-danger d-flex align-items-center gap-2 small py-2 rounded-3 mb-3">
                      <i class="bi bi-exclamation-triangle-fill"></i>
                      <div>{{ passwordErrorMessage }}</div>
                    </div>
                  }

                  <form (ngSubmit)="confirmerEtChangerMotDePasse()">
                    <div class="mb-3">
                      <label class="form-label small fw-semibold text-dark">Mot de passe actuel <span class="text-danger">*</span></label>
                      <div class="input-group input-group-sm">
                        <input [type]="showOldPassword ? 'text' : 'password'" 
                               class="form-control rounded-start-3" 
                               [(ngModel)]="oldPassword" 
                               name="oldPassword" 
                               placeholder="Votre mot de passe actuel"
                               required>
                        <button class="btn btn-outline-secondary" type="button" (click)="showOldPassword = !showOldPassword">
                          <i class="bi" [class.bi-eye]="!showOldPassword" [class.bi-eye-slash]="showOldPassword"></i>
                        </button>
                      </div>
                    </div>

                    <div class="mb-3">
                      <label class="form-label small fw-semibold text-dark">Nouveau mot de passe <span class="text-danger">*</span></label>
                      <div class="input-group input-group-sm">
                        <input [type]="showNewPassword ? 'text' : 'password'" 
                               class="form-control rounded-start-3" 
                               [(ngModel)]="newPassword" 
                               name="newPassword" 
                               placeholder="Minimum 6 caractères"
                               required>
                        <button class="btn btn-outline-secondary" type="button" (click)="showNewPassword = !showNewPassword">
                          <i class="bi" [class.bi-eye]="!showNewPassword" [class.bi-eye-slash]="showNewPassword"></i>
                        </button>
                      </div>
                    </div>

                    <div class="mb-3">
                      <label class="form-label small fw-semibold text-dark">Confirmer le nouveau mot de passe <span class="text-danger">*</span></label>
                      <div class="input-group input-group-sm">
                        <input [type]="showConfirmPassword ? 'text' : 'password'" 
                               class="form-control rounded-start-3" 
                               [(ngModel)]="confirmPassword" 
                               name="confirmPassword" 
                               placeholder="Répétez le mot de passe"
                               required>
                        <button class="btn btn-outline-secondary" type="button" (click)="showConfirmPassword = !showConfirmPassword">
                          <i class="bi" [class.bi-eye]="!showConfirmPassword" [class.bi-eye-slash]="showConfirmPassword"></i>
                        </button>
                      </div>
                    </div>

                    <div class="d-flex justify-content-end pt-2">
                      <button type="submit" 
                              class="btn btn-warning text-dark btn-sm rounded-2 px-4 fw-semibold shadow-sm" 
                              [disabled]="isChangingPassword || !oldPassword || !newPassword || !confirmPassword">
                        @if (isChangingPassword) {
                          <span class="spinner-border spinner-border-sm me-1"></span> Modification...
                        } @else {
                          <i class="bi bi-key-fill me-1"></i> Mettre à jour le mot de passe
                        }
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- ============================================================
         MODAL DOSSIER LOCATAIRE 
         ============================================================ -->
    @if (showDossierModal && selectedReservation) {
      <div class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);" (click)="fermerDossierModal()">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" (click)="$event.stopPropagation()">
          <div class="modal-content rounded-2 border-0 shadow-lg">
            <div class="modal-header border-0 pb-0 px-4 pt-4">
              <div>
                <h5 class="fw-bold mb-0 text-dark"><i class="bi bi-person-badge me-2 text-primary"></i>Dossier Locataire</h5>
                <small class="text-muted">Réservation #{{ selectedReservation.id }} - {{ selectedReservation.logement?.titre }}</small>
              </div>
              <button class="btn-close" (click)="fermerDossierModal()"></button>
            </div>
            <div class="modal-body px-4 py-3">
              <!-- Infos locataire -->
              <div class="card border-0 bg-light rounded-3 p-3 mb-3">
                <h6 class="fw-bold mb-2 text-dark"><i class="bi bi-person-circle me-2 text-primary"></i>Identité du locataire</h6>
                <div class="row g-2 small">
                  <div class="col-sm-6"><span class="text-muted">Nom complet</span><br><strong>{{ selectedReservation.locataire?.name || 'Non renseigné' }}</strong></div>
                  <div class="col-sm-6"><span class="text-muted">Email</span><br><strong>{{ selectedReservation.locataire?.email || 'Non renseigné' }}</strong></div>
                  <div class="col-sm-6"><span class="text-muted">Téléphone</span><br><strong>{{ selectedReservation.locataire?.telephone || '+221 -' }}</strong></div>
                  <div class="col-sm-6"><span class="text-muted">Logement demandé</span><br><strong>{{ selectedReservation.logement?.titre }}</strong></div>
                </div>
              </div>

              <!-- Pièce d'identité -->
              <div class="card border-0 rounded-3 p-3 mb-3"
                   [class.bg-success]="selectedReservation.locataire_details?.piece_identite_statut === 'valide'"
                   [class.bg-opacity-10]="selectedReservation.locataire_details?.piece_identite_statut === 'valide'"
                   [class.bg-danger]="selectedReservation.locataire_details?.piece_identite_statut === 'rejete'"
                   [class.bg-warning]="!selectedReservation.locataire_details?.piece_identite_statut || selectedReservation.locataire_details?.piece_identite_statut === 'non_fourni'"
                   [class.border-success]="selectedReservation.locataire_details?.piece_identite_statut === 'valide'"
                   [class.border-danger]="selectedReservation.locataire_details?.piece_identite_statut === 'rejete'">
                <div class="d-flex align-items-center gap-2 mb-2">
                  <i class="bi bi-card-heading fs-5"
                     [class.text-success]="selectedReservation.locataire_details?.piece_identite_statut === 'valide'"
                     [class.text-danger]="selectedReservation.locataire_details?.piece_identite_statut === 'rejete'"
                     [class.text-warning]="!selectedReservation.locataire_details?.piece_identite_statut"></i>
                  <h6 class="fw-bold mb-0 text-dark">Pièce d'Identité</h6>
                  @if (selectedReservation.locataire_details?.piece_identite_statut === 'valide') {
                    <span class="badge bg-success ms-auto">Certifiée ✓</span>
                  } @else if (selectedReservation.locataire_details?.piece_identite_statut === 'rejete') {
                    <span class="badge bg-danger ms-auto">Rejetée ✗</span>
                  } @else {
                    <span class="badge bg-warning text-dark ms-auto">Non fournie</span>
                  }
                </div>
                <div class="small text-muted">
                  @if (selectedReservation.locataire_details?.piece_identite_type) {
                    <div>Type : <strong class="text-dark">{{ selectedReservation.locataire_details?.piece_identite_type }}</strong></div>
                  }
                  @if (selectedReservation.locataire_details?.piece_identite_numero) {
                    <div>N° : <code class="text-dark">{{ selectedReservation.locataire_details?.piece_identite_numero }}</code></div>
                  }
                  @if (selectedReservation.locataire_details?.piece_identite_certificat) {
                    <div>Certificat d'authenticité : <code class="text-success">{{ selectedReservation.locataire_details?.piece_identite_certificat }}</code></div>
                  }
                </div>
              </div>

              <!-- Revenus -->
              <div class="card border-0 rounded-3 p-3 mb-3"
                   [class.bg-success]="selectedReservation.locataire_details?.revenus_statut === 'valide'"
                   [class.bg-opacity-10]="selectedReservation.locataire_details?.revenus_statut === 'valide'"
                   [class.bg-warning]="!selectedReservation.locataire_details?.revenus_statut || selectedReservation.locataire_details?.revenus_statut === 'non_fourni'"
                   [class.border-success]="selectedReservation.locataire_details?.revenus_statut === 'valide'">
                <div class="d-flex align-items-center gap-2 mb-2">
                  <i class="bi bi-cash-coin fs-5"
                     [class.text-success]="selectedReservation.locataire_details?.revenus_statut === 'valide'"
                     [class.text-warning]="selectedReservation.locataire_details?.revenus_statut !== 'valide'"></i>
                  <h6 class="fw-bold mb-0 text-dark">Justificatifs de Revenus</h6>
                  @if (selectedReservation.locataire_details?.revenus_statut === 'valide') {
                    <span class="badge bg-success ms-auto">Vérifiés ✓</span>
                  } @else {
                    <span class="badge bg-warning text-dark ms-auto">Non fournis</span>
                  }
                </div>
                <div class="small text-muted">
                  @if (selectedReservation.locataire_details?.revenus_type) {
                    <div>Type : <strong class="text-dark">{{ selectedReservation.locataire_details?.revenus_type }}</strong></div>
                  }
                  @if (selectedReservation.locataire_details?.revenu_mensuel) {
                    <div>Revenus mensuels déclarés : <strong class="text-dark">{{ selectedReservation.locataire_details?.revenu_mensuel | number }} FCFA/mois</strong></div>
                  }
                </div>
              </div>

              <!-- Score & Certification -->
              <div class="card border-0 bg-light rounded-3 p-3 mb-3">
                <h6 class="fw-bold mb-2 text-dark"><i class="bi bi-bar-chart-line me-2 text-primary"></i>Score & Certification Dossier</h6>
                <div class="mb-2">
                  <div class="d-flex justify-content-between small mb-1">
                    <span class="text-muted">Score global dossier</span>
                    <strong [class.text-success]="(selectedReservation.locataire_details?.score_global || 0) >= 80"
                            [class.text-warning]="(selectedReservation.locataire_details?.score_global || 0) > 0 && (selectedReservation.locataire_details?.score_global || 0) < 80"
                            [class.text-danger]="(selectedReservation.locataire_details?.score_global || 0) === 0">
                      {{ selectedReservation.locataire_details?.score_global || 0 }}%
                    </strong>
                  </div>
                  <div class="progress" style="height: 8px;">
                    <div class="progress-bar"
                         [class.bg-success]="(selectedReservation.locataire_details?.score_global || 0) >= 80"
                         [class.bg-warning]="(selectedReservation.locataire_details?.score_global || 0) > 0 && (selectedReservation.locataire_details?.score_global || 0) < 80"
                         [class.bg-danger]="(selectedReservation.locataire_details?.score_global || 0) === 0"
                         [style.width]="(selectedReservation.locataire_details?.score_global || 0) + '%'">
                    </div>
                  </div>
                </div>
                @if (selectedReservation.locataire_details?.est_certifie) {
                  <div class="d-flex align-items-center gap-2 mt-2">
                    <i class="bi bi-patch-check-fill text-success fs-5"></i>
                    <strong class="text-success small">Dossier 100% Certifié Authentique</strong>
                  </div>
                }
                @if (selectedReservation.locataire_details?.garantie_type) {
                  <div class="small text-muted mt-1">
                    <i class="bi bi-shield-check text-primary me-1"></i>Garantie : {{ selectedReservation.locataire_details?.garantie_type }}
                  </div>
                }
              </div>
            </div>
            <div class="modal-footer border-0 px-4 pb-4 gap-2">
              <button class="btn btn-outline-secondary" (click)="fermerDossierModal()">Fermer</button>
              <button class="btn btn-danger" (click)="ouvrirRefusModal(selectedReservation!)">
                <i class="bi bi-x-circle me-1"></i> Refuser
              </button>
              <button class="btn btn-success" (click)="valider(selectedReservation!.id)">
                <i class="bi bi-check-circle me-1"></i> Valider la réservation
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- ============================================================
         MODAL REFUS AVEC MOTIF
         ============================================================ -->
    @if (showRefusModal && selectedReservation) {
      <div class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.6);" (click)="fermerRefusModal()">
        <div class="modal-dialog modal-dialog-centered" (click)="$event.stopPropagation()">
          <div class="modal-content rounded-2 border-0 shadow-lg">
            <div class="modal-header border-0 pb-0 px-4 pt-4">
              <h5 class="fw-bold text-danger mb-0"><i class="bi bi-x-circle me-2"></i>Refuser la réservation</h5>
              <button class="btn-close" (click)="fermerRefusModal()"></button>
            </div>
            <div class="modal-body px-4">
              <p class="text-muted small mb-3">Sélectionnez ou saisissez un motif de refus. Le locataire sera automatiquement notifié dans sa messagerie.</p>

              <!-- Motifs prédéfinis -->
              <div class="mb-3">
                <label class="form-label small fw-semibold">Motifs fréquents</label>
                <div class="d-flex flex-wrap gap-2">
                  @for (motif of refusMotifPredifinis; track motif) {
                    <button class="btn btn-sm btn-outline-secondary rounded-2" 
                            [class.btn-danger]="refusMotif === motif"
                            [class.btn-outline-secondary]="refusMotif !== motif"
                            (click)="appliquerMotifPredifini(motif)">
                      {{ motif }}
                    </button>
                  }
                </div>
              </div>

              <!-- Motif personnalisé -->
              <div class="mb-3">
                <label class="form-label small fw-semibold">Motif détaillé (obligatoire)</label>
                <textarea class="form-control" rows="3" [(ngModel)]="refusMotif" placeholder="Ex: Logement attribué à un locataire prioritaire avec dossier complet..."></textarea>
              </div>
            </div>
            <div class="modal-footer border-0 px-4 pb-4 gap-2">
              <button class="btn btn-outline-secondary" (click)="fermerRefusModal()">Annuler</button>
              <button class="btn btn-danger" (click)="confirmerRefus()" [disabled]="!refusMotif.trim()">
                <i class="bi bi-x-circle me-1"></i> Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- ============================================================
         MODAL AJOUT AGENCE IMMOBILIÈRE (ADMIN)
         ============================================================ -->
    @if (showAddAgenceModal) {
      <div class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.55); z-index: 1065;" (click)="fermerAddAgenceModal()">
        <div class="modal-dialog modal-lg modal-dialog-centered" (click)="$event.stopPropagation()">
          <div class="modal-content rounded-2 border-0 shadow-lg overflow-hidden">
            <div class="modal-header border-bottom p-4 bg-light">
              <div class="d-flex align-items-center gap-2">
                <div class="rounded-3 d-flex align-items-center justify-content-center shadow-sm" style="width: 40px; height: 40px; background: rgba(11, 61, 145, 0.12); color: #0B3D91;">
                  <i class="bi bi-buildings-fill fs-5"></i>
                </div>
                <div>
                  <h5 class="modal-title fw-bold mb-0 text-dark">Ajouter une Agence Immobilière</h5>
                  <small class="text-muted">Enregistrez une agence partenaire certifiée dans la base de données</small>
                </div>
              </div>
              <button type="button" class="btn-close" (click)="fermerAddAgenceModal()"></button>
            </div>

            <div class="modal-body p-4">
              @if (agenceSuccessMsg) {
                <div class="alert alert-success d-flex align-items-center gap-2 rounded-3 mb-3">
                  <i class="bi bi-check-circle-fill fs-5"></i>
                  <span>{{ agenceSuccessMsg }}</span>
                </div>
              }
              @if (agenceErrorMsg) {
                <div class="alert alert-danger d-flex align-items-center gap-2 rounded-3 mb-3">
                  <i class="bi bi-exclamation-triangle-fill fs-5"></i>
                  <span>{{ agenceErrorMsg }}</span>
                </div>
              }

              <form (ngSubmit)="soumettreAgence()">
                <div class="row g-3">
                  <!-- Nom -->
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-dark">Nom de l'agence <span class="text-danger">*</span></label>
                    <input type="text" class="form-control rounded-3" placeholder="Ex: Teranga Prestige Immobilier" [(ngModel)]="newAgence.nom" name="agenceNom" required>
                  </div>

                  <!-- Ville -->
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-dark">Ville <span class="text-danger">*</span></label>
                    <input type="text" class="form-control rounded-3" placeholder="Ex: Dakar, Saly, Thiès..." [(ngModel)]="newAgence.ville" name="agenceVille" required>
                  </div>

                  <!-- Adresse -->
                  <div class="col-12">
                    <label class="form-label small fw-semibold text-dark">Adresse complète</label>
                    <input type="text" class="form-control rounded-3" placeholder="Ex: Route des Almadies, en face Pharmacie des Almadies" [(ngModel)]="newAgence.adresse" name="agenceAdresse">
                  </div>

                  <!-- Téléphone -->
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-dark">Numéro de téléphone</label>
                    <input type="tel" class="form-control rounded-3" placeholder="+221 77 000 00 00" [(ngModel)]="newAgence.telephone" name="agenceTelephone">
                  </div>

                  <!-- Email -->
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-dark">Adresse e-mail</label>
                    <input type="email" class="form-control rounded-3" placeholder="contact@teranga-immo.sn" [(ngModel)]="newAgence.email" name="agenceEmail">
                  </div>

                  <!-- Site web -->
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-dark">Site web officiel</label>
                    <input type="url" class="form-control rounded-3" placeholder="https://teranga-immo.sn" [(ngModel)]="newAgence.site_web" name="agenceSiteWeb">
                  </div>

                  <!-- Logo Upload -->
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-dark">Logo ou photo de l'agence</label>
                    <input type="file" class="form-control rounded-3" accept="image/*" (change)="onLogoSelect($event)">
                    <small class="text-muted" style="font-size: 11px;">PNG, JPG ou WEBP (max 5 Mo)</small>
                  </div>

                  <!-- Description -->
                  <div class="col-12">
                    <label class="form-label small fw-semibold text-dark">Description de l'agence</label>
                    <textarea class="form-control rounded-3" rows="3" placeholder="Présentation de l'agence, domaines d'expertise, quartiers couverts..." [(ngModel)]="newAgence.description" name="agenceDescription"></textarea>
                  </div>

                  <!-- Statut Partenaire Certifié -->
                  <div class="col-12">
                    <div class="form-check form-switch p-3 bg-light rounded-3 d-flex align-items-center gap-3">
                      <input class="form-check-input ms-0" type="checkbox" id="checkPartenaireCertifie" [(ngModel)]="newAgence.est_partenaire_certifie" name="agencePartenaire">
                      <label class="form-check-label small fw-semibold text-dark mb-0" for="checkPartenaireCertifie">
                        <span class="d-block">Statut : Partenaire Certifié & Actif</span>
                        <small class="text-muted fw-normal">L'agence sera immédiatement visible sur la page d'accueil dans la section des agences partenaires.</small>
                      </label>
                    </div>
                  </div>
                </div>

                <div class="modal-footer border-0 px-0 pb-0 pt-4 gap-2">
                  <button type="button" class="btn btn-outline-secondary rounded-2 px-4" (click)="fermerAddAgenceModal()">
                    Annuler
                  </button>
                  <button type="submit" class="btn btn-primary rounded-2 px-4 fw-semibold" [disabled]="agenceSaving || !newAgence.nom.trim() || !newAgence.ville.trim()">
                    @if (agenceSaving) {
                      <span class="spinner-border spinner-border-sm me-1" role="status"></span>
                      <span>Enregistrement en cours...</span>
                    } @else {
                      <i class="bi bi-check-circle-fill me-1"></i>
                      <span>Enregistrer l'agence</span>
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('revenueChart') revenueChartRef?: ElementRef;
  @ViewChild('typeChart') typeChartRef?: ElementRef;
  @ViewChild('formMap') formMapRef?: ElementRef;

  activeTab: 'apercu' | 'reservations' | 'logements' | 'finances' | 'messagerie' | 'agences' | 'parametres' = 'apercu';
  stats: AdminStats | null = null;
  reservations: Reservation[] = [];
  logements: Logement[] = [];
  showNewModal = false;
  modeEditionLogement = false;
  editingLogementId: number | null = null;
  formMapInstance: any = null;
  formMapMarker: any = null;
  uploadedPhotosPreviews: string[] = [];
  quartiersDisponibles: string[] = [];
  villesDisponibles = ['Saint-Louis', 'Dakar', 'Saly Portudal', 'Thiès', 'Mbour', 'Ziguinchor'];
  showDossierModal = false;
  showRefusModal = false;
  selectedReservation: Reservation | null = null;
  refusMotif = '';
  refusMotifPredifinis = [
    "Pièce d'identité non fournie ou invalide",
    "Justificatif de revenus insuffisant",
    "Logement déjà attribué à un autre locataire",
    "Dossier incomplet (pièces manquantes)",
    "Profil locataire ne correspond pas aux critères"
  ];

  // Filtrage annuel dynamique de l'évolution mensuelle
  selectedAnnee: number = 2026;
  anneesDisponibles: number[] = [2026, 2025, 2024];

  // Gestion des agences partenaires
  agencesAdmin: Agence[] = [];
  agenceLoading = false;
  showAddAgenceModal = false;
  agenceSaving = false;
  agenceSuccessMsg = '';
  agenceErrorMsg = '';
  selectedLogoFile: File | null = null;
  newAgence = {
    nom: '',
    ville: '',
    adresse: '',
    telephone: '',
    email: '',
    site_web: '',
    description: '',
    est_partenaire_certifie: true
  };

  // Messagerie dynamique intégrée pour le gestionnaire (avec support responsive mobile)
  conversations: Conversation[] = [];
  activeConvId: string | null = null;
  newMessageContenu = '';
  mobileShowConversation = false;
  private convSub?: Subscription;

  // Paramètres du compte Gestionnaire (consultation, coordonnées, avatar et mot de passe)
  modeEditionProfil = false;
  profilePrenom = '';
  profileNom = '';
  profileEmail = '';
  profileTelephone = '';
  isSavingProfile = false;
  profileSuccess = false;
  profileSuccessMessage = '';
  profileError = false;
  profileErrorMessage = '';

  avatarPreview: string | null = null;
  selectedAvatarFile: File | null = null;
  isUploadingAvatar = false;
  avatarSuccessMessage = '';
  avatarErrorMessage = '';

  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  isChangingPassword = false;
  passwordSuccess = false;
  passwordSuccessMessage = '';
  passwordError = false;
  passwordErrorMessage = '';

  get activeConversation(): Conversation | undefined {
    return this.conversations.find(c => c.id === this.activeConvId);
  }

  get nbNonLusMessages(): number {
    return this.messageService.getNbNonLusTotal();
  }

  get nbDemandesEnAttente(): number {
    return this.reservations.filter(r => r.statut === 'en_attente').length;
  }

  newLogement: any = {
    titre: '',
    description: '',
    type: 'appartement',
    adresse: '',
    ville: 'Dakar',
    quartier: 'Almadies',
    prix_par_mois: 350000,
    surface: 75,
    nb_pieces: 3,
    meuble: true,
    mode_reservation: 'immediate',
    politique_annulation: 'gratuite',
    latitude: 14.7167,
    longitude: -17.4677,
    points_interet: '',
    accessibilite: '',
    photos: []
  };

  private revChartInstance?: Chart;
  private typeChartInstance?: Chart;

  constructor(
    private dashboardService: DashboardService,
    private logementService: LogementService,
    private reservationService: ReservationService,
    public messageService: MessageService,
    private agenceService: AgenceService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private modalAlert: ModalAlertService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      this.router.navigate(['/admin/login']);
      return;
    }
    this.loadAll();

    // Abonnement aux messages du gestionnaire
    this.convSub = this.messageService.conversations$.subscribe(convs => {
      this.conversations = convs || [];
      if (!this.activeConvId && this.conversations.length > 0) {
        this.activeConvId = this.conversations[0].id;
      }
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.convSub?.unsubscribe();
  }

  ngAfterViewInit(): void {
    if (this.stats && this.activeTab === 'apercu') {
      setTimeout(() => this.renderCharts(), 300);
    }
  }

  setTab(tab: 'apercu' | 'reservations' | 'logements' | 'finances' | 'messagerie' | 'agences' | 'parametres'): void {
    this.activeTab = tab;
    if (tab === 'apercu') {
      setTimeout(() => this.renderCharts(), 200);
    } else if (tab === 'messagerie') {
      this.messageService.rechargerConversations();
      if (this.activeConvId) {
        this.messageService.marquerConversationLue(this.activeConvId);
      }
    } else if (tab === 'agences') {
      if (this.agencesAdmin.length === 0) {
        this.loadAdminAgences();
      }
    } else if (tab === 'parametres') {
      this.initProfileFields();
    }
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  selectionnerConversation(convId: string): void {
    this.activeConvId = convId;
    this.mobileShowConversation = true;
    this.messageService.marquerConversationLue(convId);
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  retourListeConversations(): void {
    this.mobileShowConversation = false;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  envoyerMessage(): void {
    if (!this.activeConvId || !this.newMessageContenu.trim()) return;
    this.messageService.envoyerMessage(this.activeConvId, this.newMessageContenu);
    this.newMessageContenu = '';
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  discuterAvecLocataire(res: Reservation): void {
    const convId = `conv_res_${res.id}`;
    this.setTab('messagerie');
    const exist = this.conversations.find(c => c.id === convId || c.reservation_id === res.id);
    if (exist) {
      this.selectionnerConversation(exist.id);
    } else {
      this.messageService.creerConversationPourReservation(res);
      this.messageService.rechargerConversations();
      setTimeout(() => {
        const found = this.conversations.find(c => c.id === convId || c.reservation_id === res.id);
        if (found) {
          this.selectionnerConversation(found.id);
        } else if (this.conversations.length > 0) {
          this.selectionnerConversation(this.conversations[0].id);
        }
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }, 100);
    }
  }

  onAnneeChange(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.dashboardService.getAdminStats(this.selectedAnnee).subscribe(s => {
      this.stats = s;
      if (s.annee) this.selectedAnnee = s.annee;
      if (s.annees_disponibles && s.annees_disponibles.length > 0) {
        this.anneesDisponibles = s.annees_disponibles;
      }
      this.cdr.markForCheck();
      this.cdr.detectChanges();
      if (this.activeTab === 'apercu') {
        setTimeout(() => this.renderCharts(), 150);
      }
    });
  }

  loadAll(): void {
    this.loadStats();

    this.reservationService.getReservationsGestionnaire().subscribe(r => {
      this.reservations = r;
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    });

    this.logementService.getMesLogements().subscribe(l => {
      this.logements = l;
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    });
  }

  renderCharts(): void {
    if (!this.revenueChartRef || !this.typeChartRef || !this.stats) return;

    // Destroy existing
    if (this.revChartInstance) this.revChartInstance.destroy();
    if (this.typeChartInstance) this.typeChartInstance.destroy();

    // 1. Évolution revenus (12 mois fiables & dynamiques)
    const revCtx = this.revenueChartRef.nativeElement.getContext('2d');
    this.revChartInstance = new Chart(revCtx, {
      type: 'bar',
      data: {
        labels: this.stats.evolution_mensuelle.map(e => e.mois),
        datasets: [{
          label: 'Revenus encaissés (FCFA)',
          data: this.stats.evolution_mensuelle.map(e => e.revenus),
          backgroundColor: '#0B3D91',
          hoverBackgroundColor: '#1D4ED8',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const val = Number(context.raw) || 0;
                return ` Revenus : ${val.toLocaleString('fr-FR')} FCFA`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `${Number(value).toLocaleString('fr-FR')} F`
            }
          }
        }
      }
    });

    // 2. Répartition types
    const typeCtx = this.typeChartRef.nativeElement.getContext('2d');
    this.typeChartInstance = new Chart(typeCtx, {
      type: 'doughnut',
      data: {
        labels: this.stats.repartition_types.map(t => t.type.toUpperCase()),
        datasets: [{
          data: this.stats.repartition_types.map(t => t.total),
          backgroundColor: ['#0B3D91', '#14B8A6', '#F59E0B', '#16A34A', '#8B5CF6']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  ouvrirDossier(reservation: Reservation): void {
    this.selectedReservation = reservation;
    this.showDossierModal = true;
  }

  fermerDossierModal(): void {
    this.showDossierModal = false;
    this.selectedReservation = null;
  }

  valider(id: number | string): void {
    const res = this.reservations.find(r => String(r.id) === String(id));
    if (res) {
      this.selectedReservation = res;
    }

    this.modalAlert.confirm(
      'Confirmer la validation de cette réservation ? Un message automatique avec le lien de paiement Phase 2 (Étape 3) sera immédiatement transmis au locataire.',
      'Validation de Réservation',
      'Valider et Notifier',
      'Annuler'
    ).then((confirmed) => {
      if (!confirmed) return;

      this.reservationService.validerReservation(Number(id)).subscribe({
        next: () => {
          this.showDossierModal = false;
          this.selectedReservation = null;
          this.modalAlert.success('Réservation validée avec succès ! Le locataire a été notifié dans sa messagerie avec le lien vers la phase de paiement.', 'Réservation Validée');
          this.loadAll();
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        },
        error: (err) => this.modalAlert.error(err.error?.message || 'Erreur lors de la validation', 'Erreur')
      });
    });
  }

  viewContrat(res: Reservation): void {
    this.modalAlert.showContrat(res);
  }

  viewRecu(res: Reservation): void {
    this.modalAlert.showRecu(res);
  }

  ouvrirRefusModal(reservation: Reservation): void {
    this.selectedReservation = reservation;
    this.refusMotif = '';
    this.showRefusModal = true;
  }

  fermerRefusModal(): void {
    this.showRefusModal = false;
    this.refusMotif = '';
  }

  appliquerMotifPredifini(motif: string): void {
    this.refusMotif = motif;
  }

  confirmerRefus(): void {
    if (!this.selectedReservation || !this.refusMotif.trim()) {
      this.modalAlert.warning('Veuillez indiquer ou sélectionner le motif du refus.', 'Motif Requis');
      return;
    }

    this.reservationService.refuserReservation(this.selectedReservation.id, this.refusMotif).subscribe({
      next: () => {
        this.showRefusModal = false;
        this.showDossierModal = false;
        this.selectedReservation = null;
        this.refusMotif = '';
        this.modalAlert.warning('La réservation a été refusée. Le locataire a été notifié avec le motif de rejet dans sa messagerie.', 'Réservation Rejetée');
        this.loadAll();
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => this.modalAlert.error(err.error?.message || 'Erreur lors du refus', 'Erreur')
    });
  }

  toggleStatut(logement: Logement): void {
    this.logementService.toggleStatut(logement.id).subscribe({
      next: (res) => {
        logement.statut = res?.logement?.statut || res?.statut || (logement.statut === 'publie' ? 'brouillon' : 'publie');
        this.modalAlert.info(`Statut du logement mis à jour : ${logement.statut === 'publie' ? 'Publié en ligne' : 'Brouillon privé'}.`, 'Statut Modifié');
        this.loadStats();
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => this.modalAlert.error(err.error?.message || 'Erreur lors du changement de statut', 'Erreur')
    });
  }

  // ============================================================
  // FORMULAIRE LOGEMENT : AJOUT / MODIFICATION
  // ============================================================

  private resetNewLogement(): void {
    this.newLogement = {
      titre: '',
      description: '',
      type: 'appartement',
      adresse: '',
      ville: 'Dakar',
      quartier: 'Almadies',
      prix_par_mois: 350000,
      surface: 75,
      nb_pieces: 3,
      meuble: true,
      mode_reservation: 'immediate',
      politique_annulation: 'gratuite',
      latitude: 14.7167,
      longitude: -17.4677,
      points_interet: '',
      accessibilite: '',
      photos: []
    };
    this.uploadedPhotosPreviews = [];
  }

  ouvrirModalAjout(): void {
    this.resetNewLogement();
    this.modeEditionLogement = false;
    this.editingLogementId = null;
    this.showNewModal = true;
    this.loadQuartiersForVille(this.newLogement.ville);
    setTimeout(() => {
      this.onAddressChange();
      this.initFormMap();
    }, 300);
  }

  editerLogement(logement: any): void {
    this.newLogement = {
      titre: logement.titre || '',
      description: logement.description || '',
      type: logement.type || 'appartement',
      adresse: logement.adresse || '',
      ville: logement.ville || 'Dakar',
      quartier: logement.quartier || '',
      prix_par_mois: logement.prix_par_mois || 350000,
      surface: logement.surface || 75,
      nb_pieces: logement.nb_pieces || 3,
      meuble: logement.meuble !== undefined ? logement.meuble : true,
      mode_reservation: logement.mode_reservation || 'immediate',
      politique_annulation: logement.politique_annulation || 'gratuite',
      latitude: logement.latitude || 14.7167,
      longitude: logement.longitude || -17.4677,
      points_interet: logement.points_interet || '',
      accessibilite: logement.accessibilite || '',
      photos: []
    };
    this.uploadedPhotosPreviews = (logement.photos || []).map((p: any) => p?.url || p || '').filter((u: string) => !!u);
    this.modeEditionLogement = true;
    this.editingLogementId = logement.id;
    this.showNewModal = true;
    this.loadQuartiersForVille(this.newLogement.ville);
    setTimeout(() => {
      this.onAddressChange();
      this.initFormMap();
    }, 300);
  }

  fermerModalLogement(): void {
    this.showNewModal = false;
    if (this.formMapInstance) {
      try { this.formMapInstance.remove(); } catch(e) {}
      this.formMapInstance = null;
      this.formMapMarker = null;
    }
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  loadQuartiersForVille(ville: string): void {
    this.logementService.getQuartiers().subscribe({
      next: (quartiers) => {
        const v = (ville || '').toLowerCase().trim();
        this.quartiersDisponibles = quartiers
          .filter(q => (q.ville || '').toLowerCase().trim() === v)
          .map(q => q.name || (q as any).quartier || '')
          .filter(q => !!q);
        if (this.quartiersDisponibles.length === 0) {
          // Fallback basé sur ville
          if (v.includes('saint-louis') || v === 'saint-louis') {
            this.quartiersDisponibles = ['Sanar', 'Sor', 'Ngallèle', 'Sanar Wolof', 'Sanar Peulh', 'Île', 'Ndar Toute', 'Guet Ndar', 'Bango', 'Hydrobase'];
          } else if (v === 'dakar') {
            this.quartiersDisponibles = ['Almadies', 'Ngor', 'Virage', 'Fann', 'Fann Résidence', 'Point E', 'Plateau', 'Mermoz', 'Sacré-Cœur', 'Liberté 6', 'Yoff', 'Mamelles', 'Ouakam', 'Maristes'];
          } else if (v.includes('saly')) {
            this.quartiersDisponibles = ['Saly Portudal', 'Somone', 'Centre'];
          } else if (v === 'thiès' || v === 'thies') {
            this.quartiersDisponibles = ['Centre', 'Randoulène', 'Nguinth', 'Mbambilor'];
          } else if (v === 'mbour') {
            this.quartiersDisponibles = ['Centre', 'Escale', 'Téfess'];
          }
        }
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }

  onVilleChange(): void {
    this.loadQuartiersForVille(this.newLogement.ville);
    this.onAddressChange();
  }

  onAddressChange(): void {
    const geo = geocodeSenegal(this.newLogement.ville, this.newLogement.quartier);
    this.newLogement.latitude = geo.lat;
    this.newLogement.longitude = geo.lng;
    if (this.formMapInstance && this.formMapMarker) {
      try {
        this.formMapInstance.setView([geo.lat, geo.lng], geo.zoom || 15);
        this.formMapMarker.setLatLng([geo.lat, geo.lng]);
      } catch(e) {}
    }
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  initFormMap(): void {
    if (typeof L === 'undefined') return;
    const el = this.formMapRef?.nativeElement;
    if (!el) return;
    if (this.formMapInstance) {
      try { this.formMapInstance.remove(); } catch(e) {}
      this.formMapInstance = null;
      this.formMapMarker = null;
    }
    const lat = this.newLogement.latitude || 14.7167;
    const lng = this.newLogement.longitude || -17.4677;
    this.formMapInstance = L.map(el, { zoomControl: true }).setView([lat, lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19
    }).addTo(this.formMapInstance);
    const icon = L.divIcon({
      html: '<div style="background:#0B3D91;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      className: ''
    });
    this.formMapMarker = L.marker([lat, lng], { draggable: true, icon }).addTo(this.formMapInstance);
    this.formMapMarker.on('dragend', (e: any) => {
      this.ngZone.run(() => {
        const pos = e.target.getLatLng();
        this.newLogement.latitude = Math.round(pos.lat * 1000000) / 1000000;
        this.newLogement.longitude = Math.round(pos.lng * 1000000) / 1000000;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      });
    });
    setTimeout(() => {
      if (this.formMapInstance) {
        this.formMapInstance.invalidateSize();
      }
    }, 200);
  }

  onHousingFilesSelected(event: any): void {
    const files: FileList = event.target?.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        this.uploadedPhotosPreviews.push(dataUrl);
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    });
  }

  removeHousingPhoto(index: number): void {
    this.uploadedPhotosPreviews.splice(index, 1);
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  setPrimaryHousingPhoto(index: number): void {
    if (index === 0) return;
    const primary = this.uploadedPhotosPreviews.splice(index, 1)[0];
    this.uploadedPhotosPreviews.unshift(primary);
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  sauvegarderLogement(): void {
    const payload = {
      ...this.newLogement,
      photos: this.uploadedPhotosPreviews
    };

    if (this.modeEditionLogement && this.editingLogementId) {
      this.logementService.updateLogement(this.editingLogementId, payload).subscribe({
        next: () => {
          this.modalAlert.success('Logement modifié avec succès !', 'Logement Mis à Jour');
          this.fermerModalLogement();
          this.loadAll();
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        },
        error: (err: any) => this.modalAlert.error(err.error?.message || 'Erreur lors de la modification', 'Erreur')
      });
    } else {
      this.logementService.createLogement(payload).subscribe({
        next: () => {
          this.modalAlert.success('Logement créé et publié avec succès !', 'Logement Publié');
          this.fermerModalLogement();
          this.loadAll();
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        },
        error: (err: any) => this.modalAlert.error(err.error?.message || 'Erreur lors de la création', 'Erreur')
      });
    }
  }

  confirmerSupprimerLogement(logement: any): void {
    this.modalAlert.confirm(
      `Supprimer le logement "${logement.titre}" ? Cette action est irréversible.`,
      'Supprimer le logement',
      'Supprimer',
      'Annuler'
    ).then((confirmed: boolean) => {
      if (!confirmed) return;
      this.logementService.deleteLogement(logement.id).subscribe({
        next: () => {
          this.modalAlert.success('Logement supprimé avec succès.', 'Supprimé');
          this.loadAll();
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        },
        error: (err: any) => this.modalAlert.error(err.error?.message || 'Erreur lors de la suppression', 'Erreur')
      });
    });
  }

  creerLogement(): void {
    this.sauvegarderLogement();
  }

  exporterRapport(): void {
    this.dashboardService.exportCsv('reservations');
  }

  // ============================================================
  // GESTION DES AGENCES PARTENAIRES (ADMIN)
  // ============================================================
  loadAdminAgences(): void {
    this.agenceLoading = true;
    this.agenceService.getAdminAgences().subscribe({
      next: (data) => {
        this.agencesAdmin = data || [];
        this.agenceLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement agences admin:', err);
        this.agenceLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  ouvrirAddAgenceModal(): void {
    this.showAddAgenceModal = true;
    this.agenceSuccessMsg = '';
    this.agenceErrorMsg = '';
    this.agenceSaving = false;
    this.selectedLogoFile = null;
    this.newAgence = {
      nom: '',
      ville: '',
      adresse: '',
      telephone: '',
      email: '',
      site_web: '',
      description: '',
      est_partenaire_certifie: true
    };
    this.cdr.markForCheck();
  }

  fermerAddAgenceModal(): void {
    this.showAddAgenceModal = false;
    this.selectedLogoFile = null;
    this.cdr.markForCheck();
  }

  onLogoSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedLogoFile = input.files[0];
    }
  }

  soumettreAgence(): void {
    if (!this.newAgence.nom?.trim() || !this.newAgence.ville?.trim()) {
      this.agenceErrorMsg = 'Veuillez renseigner le nom et la ville de l\'agence.';
      return;
    }

    this.agenceSaving = true;
    this.agenceSuccessMsg = '';
    this.agenceErrorMsg = '';

    let payload: FormData | Partial<Agence>;

    if (this.selectedLogoFile) {
      const fd = new FormData();
      fd.append('nom', this.newAgence.nom.trim());
      fd.append('ville', this.newAgence.ville.trim());
      if (this.newAgence.adresse) fd.append('adresse', this.newAgence.adresse.trim());
      if (this.newAgence.telephone) fd.append('telephone', this.newAgence.telephone.trim());
      if (this.newAgence.email) fd.append('email', this.newAgence.email.trim());
      if (this.newAgence.site_web) fd.append('site_web', this.newAgence.site_web.trim());
      if (this.newAgence.description) fd.append('description', this.newAgence.description.trim());
      fd.append('est_partenaire_certifie', this.newAgence.est_partenaire_certifie ? '1' : '0');
      fd.append('logo', this.selectedLogoFile);
      payload = fd;
    } else {
      payload = {
        nom: this.newAgence.nom.trim(),
        ville: this.newAgence.ville.trim(),
        adresse: this.newAgence.adresse?.trim() || undefined,
        telephone: this.newAgence.telephone?.trim() || undefined,
        email: this.newAgence.email?.trim() || undefined,
        site_web: this.newAgence.site_web?.trim() || undefined,
        description: this.newAgence.description?.trim() || undefined,
        est_partenaire_certifie: this.newAgence.est_partenaire_certifie,
        icone: 'bi-buildings'
      };
    }

    this.agenceService.ajouterAgence(payload).subscribe({
      next: (created) => {
        this.agenceSaving = false;
        this.agenceSuccessMsg = `L'agence « ${created.nom} » a été enregistrée avec succès !`;
        // Actualiser immédiatement la liste locale
        this.agencesAdmin = [created, ...this.agencesAdmin.filter(a => a.id !== created.id)];
        // Notification globale stylisée
        this.modalAlert.success(`L'agence « ${created.nom} » a été enregistrée avec succès et ajoutée au réseau de la plateforme.`, 'Agence Ajoutée');
        setTimeout(() => {
          this.fermerAddAgenceModal();
        }, 1500);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.agenceSaving = false;
        this.agenceErrorMsg = err?.error?.message || 'Erreur lors de l\'enregistrement de l\'agence. Veuillez vérifier les informations.';
        this.cdr.markForCheck();
      }
    });
  }

  // ============================================================
  // MÉTHODES PARAMÈTRES DU COMPTE GESTIONNAIRE
  // ============================================================

  currentUser(): User | null {
    return this.auth.currentUser();
  }

  initProfileFields(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.profilePrenom = user.prenom || (user.name ? user.name.split(' ')[0] : '');
      this.profileNom = user.nom || (user.name ? user.name.split(' ').slice(1).join(' ') : '');
      this.profileEmail = user.email || '';
      this.profileTelephone = user.telephone || '';
      let av = user.avatar_url || null;
      if (av && !av.startsWith('http') && !av.startsWith('data:')) {
        av = `http://localhost:8000${av.startsWith('/') ? '' : '/'}${av}`;
      }
      this.avatarPreview = av;
    }
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  activerEditionProfil(): void {
    this.initProfileFields();
    this.modeEditionProfil = true;
    this.profileSuccess = false;
    this.profileError = false;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  annulerEditionProfil(): void {
    this.modeEditionProfil = false;
    this.initProfileFields();
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  confirmerEtSauvegarderProfil(): void {
    if (!this.profilePrenom.trim() || !this.profileNom.trim() || !this.profileEmail.trim()) {
      this.profileError = true;
      this.profileErrorMessage = 'Veuillez renseigner votre prénom, nom et adresse e-mail.';
      this.cdr.markForCheck();
      this.cdr.detectChanges();
      return;
    }

    this.isSavingProfile = true;
    this.profileError = false;
    this.profileSuccess = false;

    const payload: Partial<User> = {
      prenom: this.profilePrenom.trim(),
      nom: this.profileNom.trim(),
      name: `${this.profilePrenom.trim()} ${this.profileNom.trim()}`,
      email: this.profileEmail.trim(),
      telephone: this.profileTelephone.trim()
    };

    this.auth.updateProfile(payload).subscribe({
      next: (res) => {
        this.isSavingProfile = false;
        this.modeEditionProfil = false;
        this.profileSuccess = true;
        this.profileSuccessMessage = res.message || 'Vos coordonnées ont été enregistrées avec succès en base de données.';
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSavingProfile = false;
        this.profileError = true;
        this.profileErrorMessage = err.error?.message || 'Erreur lors de la mise à jour des coordonnées.';
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }

  onAvatarFileSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.avatarErrorMessage = 'Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).';
      this.cdr.markForCheck();
      this.cdr.detectChanges();
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.avatarErrorMessage = "L'image ne doit pas dépasser 5 Mo.";
      this.cdr.markForCheck();
      this.cdr.detectChanges();
      return;
    }

    this.selectedAvatarFile = file;
    this.avatarErrorMessage = '';
    this.avatarSuccessMessage = '';

    const reader = new FileReader();
    reader.onload = (e) => {
      this.avatarPreview = e.target?.result as string;
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  annulerAvatarPreview(): void {
    this.selectedAvatarFile = null;
    let av = this.currentUser()?.avatar_url || null;
    if (av && !av.startsWith('http') && !av.startsWith('data:')) {
      av = `http://localhost:8000${av.startsWith('/') ? '' : '/'}${av}`;
    }
    this.avatarPreview = av;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  sauvegarderAvatar(): void {
    if (!this.selectedAvatarFile) return;

    this.isUploadingAvatar = true;
    this.avatarErrorMessage = '';
    this.avatarSuccessMessage = '';

    this.auth.uploadAvatar(this.selectedAvatarFile).subscribe({
      next: (res) => {
        this.isUploadingAvatar = false;
        this.avatarSuccessMessage = res.message || 'Photo de profil mise à jour avec succès.';
        let newAv = res.avatar_url || this.avatarPreview;
        if (newAv && !newAv.startsWith('http') && !newAv.startsWith('data:')) {
          newAv = `http://localhost:8000${newAv.startsWith('/') ? '' : '/'}${newAv}`;
        }
        this.avatarPreview = newAv;
        this.selectedAvatarFile = null;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isUploadingAvatar = false;
        this.avatarErrorMessage = err.error?.message || 'Erreur lors du téléversement de la photo.';
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }

  confirmerEtChangerMotDePasse(): void {
    this.passwordError = false;
    this.passwordSuccess = false;

    if (!this.oldPassword) {
      this.passwordError = true;
      this.passwordErrorMessage = 'Veuillez saisir votre mot de passe actuel.';
      this.cdr.markForCheck();
      this.cdr.detectChanges();
      return;
    }

    if (!this.newPassword || this.newPassword.length < 6) {
      this.passwordError = true;
      this.passwordErrorMessage = 'Le nouveau mot de passe doit comporter au moins 6 caractères.';
      this.cdr.markForCheck();
      this.cdr.detectChanges();
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = true;
      this.passwordErrorMessage = 'Les deux mots de passe ne correspondent pas.';
      this.cdr.markForCheck();
      this.cdr.detectChanges();
      return;
    }

    this.isChangingPassword = true;
    this.auth.changePassword(this.oldPassword, this.newPassword, this.confirmPassword).subscribe({
      next: (res) => {
        this.isChangingPassword = false;
        this.passwordSuccess = true;
        this.passwordSuccessMessage = res.message || 'Votre mot de passe a été modifié avec succès.';
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isChangingPassword = false;
        this.passwordError = true;
        this.passwordErrorMessage = err.error?.message || "Erreur lors du changement de mot de passe. Vérifiez l'ancien mot de passe.";
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }
}
