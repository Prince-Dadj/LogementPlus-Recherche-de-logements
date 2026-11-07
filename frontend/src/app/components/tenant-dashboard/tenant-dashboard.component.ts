import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { FavoriService } from '../../services/favori.service';
import { DossierLocataireService } from '../../services/dossier-locataire.service';
import { MessageService } from '../../services/message.service';
import { ModalAlertService } from '../../services/modal-alert.service';
import { DossierLocataire, Logement, Reservation, User, Conversation, MessageItem } from '../../models/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container py-4">
      <!-- En-tête principal -->
      <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <h1 class="h3 fw-bold mb-0 text-dark">Espace Locataire</h1>
            @if (dossier.estCertifie) {
              <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-2 px-3 py-1 small fw-semibold">
                <i class="bi bi-patch-check-fill me-1"></i> Dossier 100% Certifié
              </span>
            } @else if (dossier.identite.statut === 'rejete') {
              <span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-2 px-3 py-1 small fw-semibold">
                <i class="bi bi-x-octagon-fill me-1"></i> Dossier Non Conforme (Pièce Rejetée)
              </span>
            } @else if (dossier.scoreGlobal > 0) {
              <span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 rounded-2 px-3 py-1 small fw-semibold">
                <i class="bi bi-hourglass-split me-1"></i> Dossier en cours de vérification ({{ dossier.scoreGlobal }}%)
              </span>
            } @else {
              <span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-2 px-3 py-1 small">
                <i class="bi bi-shield-slash me-1"></i> Dossier Non Vérifié
              </span>
            }
          </div>
          <p class="text-muted small mb-0 mt-lg-2 mt-3">
            Bienvenue, <span class="fw-bold text-dark fs-5">{{ currentUser()?.name }}</span> . Gérez vos réservations, vos favoris, votre profil et vos pièces justificatives certifiées.
          </p>
        </div>
        <div class="d-lg-flex d-md-flex gap-2 d-none">
          <a routerLink="/logements" class="btn btn-outline-primary btn-sm rounded-2 px-3">
            <i class="bi bi-search me-1"></i> Explorer les logements
          </a>
        </div>
         <div class="d-flex d-md-none d-lg-none w-100 mt-3">
          <a routerLink="/logements" class="btn btn-outline-primary btn-sm rounded-2 px-3 w-100">
            <i class="bi bi-search me-1"></i> Explorer les logements
          </a>
        </div>
      </div>

      <!-- BANDEAU NOTIFICATION : RÉSERVATION VALIDÉE PAR LE GESTIONNAIRE -->
      @if (reservationValidee) {
        <div class="alert alert-success border border-success border-opacity-50 shadow-sm rounded-4 p-3 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div class="d-flex align-items-center gap-3">
            <div class="rounded-circle bg-success text-white p-2 d-flex align-items-center justify-content-center shadow-sm" style="width: 44px; height: 44px;">
              <i class="bi bi-patch-check-fill fs-5"></i>
            </div>
            <div>
              <strong class="d-block text-dark">
                🎉 Bonne nouvelle ! Votre demande pour « {{ reservationValidee.logement?.titre }} » a été validée par le gestionnaire !
              </strong>
              <small class="text-muted">
                Votre dossier est approuvé. Vous devez maintenant lire le contrat de bail et procéder au règlement sécurisé (Séquestre 24h).
              </small>
            </div>
          </div>
          <a [routerLink]="['/reserver', reservationValidee.logement_id]" 
             [queryParams]="{ reservation_id: reservationValidee.id, step: 3 }"
             class="btn btn-success btn-sm rounded-2 px-4 fw-bold shadow-sm">
            <i class="bi bi-file-earmark-check me-1"></i> Lire le contrat & Payer
          </a>
        </div>
      }

      <!-- 1. MODULE DYNAMIQUE : LE DOSSIER LOCATAIRE & PIÈCES JUSTIFICATIVES -->
      <div class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4"
           [style.border-left]="dossier.estCertifie ? '5px solid #14B8A6 !important' : (dossier.identite.statut === 'rejete' ? '5px solid #EF4444 !important' : (dossier.scoreGlobal > 0 ? '5px solid #F59E0B !important' : '5px solid #94A3B8 !important'))">
        <div class="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-3">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
              <span class="d-inline-flex align-items-center justify-content-center rounded-circle text-white shadow-sm"
                    [style.background-color]="dossier.estCertifie ? '#14B8A6' : (dossier.identite.statut === 'rejete' ? '#EF4444' : (dossier.scoreGlobal > 0 ? '#F59E0B' : '#64748B'))"
                    style="width: 32px; height: 32px;">
                <i class="bi" 
                   [class.bi-patch-check-fill]="dossier.estCertifie" 
                   [class.bi-x-octagon-fill]="!dossier.estCertifie && dossier.identite.statut === 'rejete'"
                   [class.bi-file-earmark-lock-fill]="!dossier.estCertifie && dossier.identite.statut !== 'rejete'"></i>
              </span>
              <h2 class="h5 fw-bold mb-0 text-dark">Mon Dossier Locataire</h2>
              @if (dossier.estCertifie) {
                <span class="badge bg-success small px-2 py-1">100% Complet & Validé</span>
              } @else if (dossier.identite.statut === 'rejete') {
                <span class="badge bg-danger small px-2 py-1">Audit Anti-Fraude : Rejet</span>
              } @else if (dossier.scoreGlobal > 0) {
                <span class="badge bg-warning text-dark small px-2 py-1">{{ dossier.scoreGlobal }}% Complété</span>
              } @else {
                <span class="badge bg-secondary small px-2 py-1">Pièce requise pour réservation prioritaire</span>
              }
            </div>
            <p class="text-muted small mb-0" style="max-width: 760px;">
              @if (dossier.estCertifie) {
                Votre pièce d'identité a été certifiée authentique. Vos demandes bénéficient d'une <strong>priorité immédiate</strong> auprès de tous les propriétaires et agences partenaires de Dakar, Saint-Louis et Saly.
              } @else if (dossier.identite.statut === 'rejete') {
                <span class="text-danger">Votre pièce d'identité a été <strong>rejetée par le moteur d'audit anti-fraude</strong> (capture d'écran d'application ou fichier non régalien détecté). Cliquez sur « Gérer mes pièces » pour corriger votre document.</span>
              } @else {
                Pour un nouveau locataire, la pièce d'identité (CNI, Passeport ou Carte d'étudiant) n'est pas validée automatiquement. Cliquez sur <strong>« Gérer mes pièces »</strong> pour téléverser votre document. L'audit d'authenticité démarre automatiquement à chaque envoi.
              }
            </p>
          </div>
          <div>
            <button class="btn btn-primary btn-sm rounded-2 px-3 shadow-sm d-flex align-items-center gap-1" (click)="toggleDossierModal()">
              <i class="bi bi-folder2-open"></i>
              <span>Gérer mes pièces</span>
            </button>
          </div>
        </div>

        <!-- Les pièces du dossier locataire avec statuts dynamiques réels (Adapté Étudiants & Professionnels) -->
        <div class="row g-3">
          <!-- 1. Pièce d'identité -->
          <div class="col-md-6">
            <div class="p-3 rounded-2 bg-light border d-flex align-items-center justify-content-between h-100"
                 [style.border-color]="dossier.identite.statut === 'rejete' ? '#EF4444 !important' : (dossier.identite.statut === 'valide' ? '#10B981 !important' : '')">
              <div class="d-flex align-items-center gap-2">
                <i class="bi fs-4" 
                   [class.bi-patch-check-fill]="dossier.identite.statut === 'valide'"
                   [class.text-success]="dossier.identite.statut === 'valide'"
                   [class.bi-hourglass-split]="dossier.identite.statut === 'en_analyse'"
                   [class.text-warning]="dossier.identite.statut === 'en_analyse'"
                   [class.bi-x-octagon-fill]="dossier.identite.statut === 'rejete'"
                   [class.text-danger]="dossier.identite.statut === 'rejete'"
                   [class.bi-card-heading]="dossier.identite.statut === 'non_fourni'"
                   [class.text-secondary]="dossier.identite.statut === 'non_fourni'"></i>
                <div>
                  <strong class="d-block small text-dark">Pièce d'Identité</strong>
                  @if (dossier.identite.statut === 'valide') {
                    <small class="text-success" style="font-size: 11px;"><i class="bi bi-check-circle-fill me-1"></i>{{ dossier.identite.libelleType }} certifié</small>
                  } @else if (dossier.identite.statut === 'en_analyse') {
                    <small class="text-warning fw-semibold" style="font-size: 11px;"><i class="bi bi-hourglass-split me-1"></i>Audit d'authenticité...</small>
                  } @else if (dossier.identite.statut === 'rejete') {
                    <small class="text-danger fw-semibold" style="font-size: 11px;"><i class="bi bi-x-circle-fill me-1"></i>Rejeté (Capture d'écran)</small>
                  } @else {
                    <small class="text-muted" style="font-size: 11px;"><i class="bi bi-exclamation-circle me-1"></i>Non fournie (CNI / Passeport / Carte Étudiant)</small>
                  }
                </div>
              </div>
              <div>
                @if (dossier.identite.statut === 'valide') {
                  <span class="badge bg-success text-white small" style="font-size: 10px;">Authentifié ✓</span>
                } @else if (dossier.identite.statut === 'en_analyse') {
                  <span class="badge bg-warning text-dark small" style="font-size: 10px;">En cours ⏳</span>
                } @else if (dossier.identite.statut === 'rejete') {
                  <button class="btn btn-sm btn-outline-danger rounded-2 py-0 px-2" style="font-size: 11px;" (click)="toggleDossierModal()">Corriger</button>
                } @else {
                  <button class="btn btn-sm btn-outline-primary rounded-2 py-0 px-2" style="font-size: 11px;" (click)="toggleDossierModal()">Ajouter</button>
                }
              </div>
            </div>
          </div>

          <!-- 2. Garantie & Séquestre -->
          <div class="col-md-6">
            <div class="p-3 rounded-2 bg-light border d-flex align-items-center justify-content-between h-100">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-shield-shaded fs-4 text-success"></i>
                <div>
                  <strong class="d-block small text-dark">Garantie Séquestre</strong>
                  <small class="text-success" style="font-size: 11px;"><i class="bi bi-check-circle-fill me-1"></i>Séquestre 24h Wave & OM</small>
                </div>
              </div>
              <span class="badge bg-success text-white small rounded-2" style="font-size: 11px;">Actif ✓</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. NAVIGATION PAR ONGLETS : MES RÉSERVATIONS | MES FAVORIS | MESSAGERIE | PARAMÈTRES DU COMPTE -->
      <ul class="nav nav-pills gap-2 mb-4 p-3 bg-white rounded-4 shadow-sm border flex-wrap">
        <li class="nav-item">
          <button
            type="button"
            class="nav-link rounded-2 fw-semibold small d-flex align-items-center gap-2 px-3 py-2"
            [class.active]="activeTab === 'reservations'"
            (click)="setTab('reservations')">
            <i class="bi bi-calendar2-range"></i>
            <span>Mes Réservations</span>
            <span class="badge rounded-pill" [class.bg-white]="activeTab === 'reservations'" [class.text-primary]="activeTab === 'reservations'" [class.bg-light]="activeTab !== 'reservations'" [class.text-dark]="activeTab !== 'reservations'">
              {{ reservations.length }}
            </span>
          </button>
        </li>
        <li class="nav-item">
          <button
            type="button"
            class="nav-link rounded-2 fw-semibold small d-flex align-items-center gap-2 px-3 py-2"
            [class.active]="activeTab === 'favoris'"
            (click)="setTab('favoris')">
            <i class="bi bi-heart-fill text-danger"></i>
            <span>Mes Favoris</span>
            <span class="badge rounded-pill" [class.bg-white]="activeTab === 'favoris'" [class.text-primary]="activeTab === 'favoris'" [class.bg-light]="activeTab !== 'favoris'" [class.text-dark]="activeTab !== 'favoris'">
              {{ favoris.length }}
            </span>
          </button>
        </li>
        <li class="nav-item">
          <button
            type="button"
            class="nav-link rounded-2 fw-semibold small d-flex align-items-center gap-2 px-3 py-2 position-relative"
            [class.active]="activeTab === 'messagerie'"
            (click)="setTab('messagerie')">
            <i class="bi bi-chat-dots-fill"></i>
            <span>Messagerie</span>
            @if (nbNonLus > 0) {
              <span class="badge bg-danger rounded-pill" style="font-size: 10px; min-width: 18px;">{{ nbNonLus }}</span>
            }
          </button>
        </li>
        <li class="nav-item">
          <button
            type="button"
            class="nav-link rounded-2 fw-semibold small d-flex align-items-center gap-2 px-3 py-2"
            [class.active]="activeTab === 'parametres'"
            (click)="setTab('parametres')">
            <i class="bi bi-gear-fill"></i>
            <span>Paramètres du compte</span>
          </button>
        </li>
      </ul>

      <!-- =================================================================== -->
      <!-- CONTENU ONGLET 1 : MES RÉSERVATIONS                                 -->
      <!-- =================================================================== -->
      @if (activeTab === 'reservations') {
        <!-- Indicateurs personnels & Séquestre -->
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <span class="text-muted small">Total Réservations</span>
              <h2 class="h4 fw-bold tabular-numbers text-primary mb-0">{{ reservations.length }}</h2>
              <small class="text-muted" style="font-size: 11px;">Demandes effectuées</small>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <span class="text-muted small">Séjours confirmés & payés</span>
              <h2 class="h4 fw-bold tabular-numbers text-success mb-0">
                {{ countByStatut(['payee', 'confirmee']) }}
              </h2>
              <small class="text-success" style="font-size: 11px;"><i class="bi bi-check-circle me-1"></i>Baux sécurisés en cours</small>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <span class="text-muted small">Protection Séquestre 24h</span>
              <div class="d-flex align-items-center gap-1 text-primary fw-bold small">
                <i class="bi bi-lock-fill fs-5 text-primary"></i>
                <span>Fonds protégés à 100%</span>
              </div>
              <small class="text-muted" style="font-size: 11px;">Reversé 24h après votre emménagement</small>
            </div>
          </div>
        </div>

        <!-- Tableau des Réservations -->
        <div class="card border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-4">
          <div class="card-header bg-white border-bottom p-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
            <h2 class="h6 fw-bold mb-0 text-dark">
              <i class="bi bi-calendar-check me-2 text-primary"></i> Mes réservations & Statut du Séquestre
            </h2>
            <span class="badge bg-light text-dark border rounded-2 small" style="font-size: 11px;">
              Garantie Séquestre LogementPlus active
            </span>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light small">
                <tr>
                  <th>Logement</th>
                  <th>Séjours</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <!-- <th>Protection Séquestre</th> -->
                  <th>Contrat & Reçu</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (res of reservations; track res.id) {
                  <tr>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        @if (res.logement?.image_principale) {
                          <img [src]="res.logement?.image_principale" class="rounded-2 object-fit-cover" style="width: 50px; height: 40px;" alt="Logement">
                        }
                        <div class="text-truncate" style="max-width: 180px; min-width: 0;">
                          <strong class="d-block small text-dark">{{ res.logement?.titre }}</strong>
                          <span class="text-muted small">{{ res.logement?.quartier }}, {{ res.logement?.ville }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="small">
                      Du {{ res.date_debut | date: 'dd/MM/yyyy'}}<br>au {{ res.date_fin | date: 'dd/MM/yyyy' }}
                    </td>
                    <td class="fw-bold tabular-numbers text-primary small">
                      {{ res.montant_total | number }} FCFA
                    </td>
                    <td>
                      @if (res.statut === 'en_attente') {
                        <span class="badge bg-warning text-dark small px-2 py-1 rounded-2">
                          <i class="bi bi-hourglass-split me-1"></i> En attente
                        </span>
                      } @else if (res.statut === 'confirmee') {
                        <span class="badge bg-success small px-2 py-1 rounded-2">
                          <i class="bi bi-patch-check-fill me-1"></i> Validée
                        </span>
                      } @else if (res.statut === 'payee') {
                        <span class="badge bg-success small px-2 py-1 rounded-2">
                          <i class="bi bi-cash-coin me-1"></i> Payée
                        </span>
                      } @else if (res.statut === 'refusee') {
                        <span class="badge bg-danger small px-2 py-1 rounded-2" [title]="res.motif_refus || 'Refusée'">
                          <i class="bi bi-x-circle me-1"></i> Refusée
                        </span>
                      } @else if (res.statut === 'annulee') {
                        <span class="badge bg-danger small px-2 py-1 rounded-2">
                          <i class="bi bi-dash-circle me-1"></i> Annulée
                        </span>
                      }
                    </td>
                    <!-- <td>
                      <span class="badge bg-primary bg-opacity-10 text-primary small d-inline-flex align-items-center gap-1" style="font-size: 11px;">
                        <i class="bi bi-shield-check"></i> Séquestre garanti 24h
                      </span>
                    </td> -->
                    <td>
                      <div class="d-lg-flex d-none align-items-center gap-1">
                        <button class="btn btn-outline-secondary btn-sm py-0 px-2 rounded-2" (click)="viewContrat(res)" title="Consulter le Contrat de Bail">
                          <i class="bi bi-file-earmark-pdf me-0"></i> Bail
                        </button>
                        @if (estPayee(res)) {
                          <button class="btn btn-sm py-0 px-2 rounded-2 shadow-sm" style="background: rgba(0, 0, 0, 0.1);" (click)="viewRecu(res)" title="Consulter le Reçu Officiel">
                            <i class="bi bi-receipt"></i> Reçu
                          </button>
                        } 
                        
                        <!-- @else {
                          <span class="badge bg-light text-muted border rounded-2" style="font-size: 10px;" title="Le reçu est délivré uniquement après paiement effectif">
                            Pas de reçu (non payé)
                          </span>
                        } -->
                      </div>
                      <div class="d-lg-none d-flex align-items-center gap-1">
                        <button class="btn btn-outline-secondary btn-sm py-0 px-2 rounded-2" (click)="viewContrat(res)" title="Consulter le Contrat de Bail">
                          Bail
                        </button>
                        @if (estPayee(res)) {
                          <button class="btn btn-sm py-0 px-2 rounded-2 shadow-sm" style="background: rgba(0, 0, 0, 0.1);" (click)="viewRecu(res)" title="Consulter le Reçu Officiel">
                            Reçu
                          </button>
                        } 
                        
                        <!-- @else {
                          <span class="badge bg-light text-muted border rounded-2" style="font-size: 10px;" title="Le reçu est délivré uniquement après paiement effectif">
                            Pas de reçu (non payé)
                          </span>
                        } -->
                      </div>
                    </td>
                    
                    <td class="text-end">
                      <div class="d-flex align-items-center justify-content-end gap-1">
                        @if (res.statut === 'confirmee') {
                          <a [routerLink]="['/reserver', res.logement_id]" 
                             [queryParams]="{ reservation_id: res.id, step: 3 }" 
                             class="btn btn-success btn-sm fw-bold px-3 p-0 rounded-2 shadow-sm text-nowrap text-white">
                            <i class="bi bi-credit-card-2-front me-1"></i> Paiement
                          </a>
                        }
                        <!-- <button class="btn btn-outline-warning btn-sm text-dark px-2 py-1 rounded-2 small" 
                                (click)="discuterAvecGestionnaire(res)" 
                                title="Discuter directement avec le gestionnaire qui traite votre réservation">
                          <i class="bi bi-chat-dots me-1"></i> Messagerie
                        </button> -->

                        @if (res.statut !== 'annulee' && res.statut !== 'terminee' && res.statut !== 'payee') {
                          <button class="btn btn-outline-danger btn-sm rounded-2 px-2 p-0" (click)="annuler(res.id)">
                            Annuler
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="text-center py-5 text-muted">
                      <div class="py-3">
                        <i class="bi bi-calendar-x fs-1 text-muted d-block mb-2"></i>
                        <h6 class="fw-bold text-dark mb-1">Aucune réservation pour l'instant</h6>
                        <p class="small text-muted mb-3">Découvrez nos logements vérifiés à Dakar, Saly et sur la Petite Côte.</p>
                        <a routerLink="/logements" class="btn btn-primary btn-sm rounded-2 px-4">
                          Rechercher un logement
                        </a>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- =================================================================== -->
      <!-- CONTENU ONGLET 2 : MES FAVORIS                                      -->
      <!-- =================================================================== -->
      @if (activeTab === 'favoris') {
        <div class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
          <div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3 flex-wrap gap-2">
            <div>
              <h2 class="h5 fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                <i class="bi bi-heart-fill text-danger"></i> Mes Logements Coup de Cœur
              </h2>
              <p class="text-muted small mb-0">Retrouvez les biens que vous avez sauvegardés pour préparer vos visites et réservations.</p>
            </div>
            <span class="badge bg-danger bg-opacity-10 text-danger rounded-2 px-3 py-1 small fw-semibold">
              {{ favoris.length }} favori{{ favoris.length > 1 ? 's' : '' }}
            </span>
          </div>

          @if (favoris && favoris.length > 0) {
            <div class="row g-3">
              @for (fav of favoris; track fav.id) {
                <div class="col-md-6 col-lg-4">
                  <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white d-flex flex-column justify-content-between">
                    <div>
                      <div class="position-relative" style="height: 180px;">
                        <img [src]="fav.image_principale" class="w-100 h-100 object-fit-cover" [alt]="fav.titre">
                        <span class="badge bg-dark bg-opacity-75 text-white position-absolute top-0 start-0 m-2 rounded-2 small text-uppercase">
                          {{ fav.type }}
                        </span>
                        <button
                          type="button"
                          class="btn btn-light btn-sm rounded-circle position-absolute top-0 end-0 m-2 shadow-sm text-danger d-flex align-items-center justify-content-center"
                          style="width: 32px; height: 32px;"
                          title="Retirer des favoris"
                          (click)="retirerFavori(fav.id)">
                          <i class="bi bi-heart-fill"></i>
                        </button>
                      </div>

                      <div class="p-3">
                        <div class="d-flex align-items-center justify-content-between mb-1">
                          <span class="text-muted small" style="font-size: 11.5px;">
                            <i class="bi bi-geo-alt-fill text-danger me-1"></i>{{ fav.quartier || fav.ville }}
                          </span>
                          <span class="text-warning small fw-semibold" style="font-size: 11px;">
                            ★ {{ fav.note_moyenne }} ({{ fav.nombre_avis }} avis)
                          </span>
                        </div>
                        <h3 class="h6 fw-bold text-dark text-truncate mb-2" [title]="fav.titre">{{ fav.titre }}</h3>
                        <div class="text-primary fw-bold tabular-numbers mb-2" style="font-size: 1.05rem;">
                          {{ fav.prix_par_mois }} FCFA <span class="text-muted fw-normal" style="font-size: 11px;">/ mois</span>
                        </div>
                      </div>
                    </div>

                    <div class="p-3 pt-0 border-top mt-2">
                      <div class="d-flex gap-2 pt-2">
                        <a [routerLink]="['/logements', fav.id]" class="btn btn-outline-primary btn-sm rounded-2 flex-grow-1">
                          Voir détails
                        </a>
                        <a [routerLink]="['/reserver', fav.id]" class="btn btn-primary btn-sm rounded-2 px-3">
                          Réserver
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <!-- Empty state favoris -->
            <div class="text-center py-5">
              <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10 text-danger mb-3" style="width: 64px; height: 64px;">
                <i class="bi bi-heart fs-2"></i>
              </div>
              <h5 class="fw-bold text-dark mb-1">Vous n'avez aucun favori pour le moment</h5>
              <p class="text-muted small mx-auto mb-4" style="max-width: 440px;">
                Lors de votre exploration du catalogue de logements au Sénégal, cliquez sur le petit cœur d'une annonce pour la sauvegarder ici.
              </p>
              <a routerLink="/logements" class="btn btn-primary btn-sm rounded-2 px-4">
                <i class="bi bi-search me-1"></i> Parcourir les logements
              </a>
            </div>
          }
        </div>
      }

      <!-- =================================================================== -->
      <!-- CONTENU ONGLET MESSAGERIE (CDC 8.6 & Échanges Gestionnaires)        -->
      <!-- =================================================================== -->
      @if (activeTab === 'messagerie') {
        <div class="card border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-4">
          <div class="row g-0" style="min-height: 600px;">
            <!-- Colonne 1 : Liste des conversations (Desktop: visible, Mobile: masquée si discussion ouverte) -->
            <div class="col-12 col-lg-4 border-end" [class.d-none]="mobileShowConversation" [class.d-lg-block]="true">
              <div class="p-3 border-bottom bg-light">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <h2 class="h6 fw-bold mb-0 text-dark">
                    <i class="bi bi-chat-dots-fill text-primary me-2"></i>Mes Conversations
                  </h2>
                  @if (nbNonLus > 0) {
                    <span class="badge bg-danger rounded-2">{{ nbNonLus }} non lu(s)</span>
                  }
                </div>
                <small class="text-muted d-block" style="font-size: 11px;">
                  Échanges sécurisés avec vos gestionnaires et le support plateforme
                </small>
              </div>

              <!-- Liste des items -->
              <div class="list-group list-group-flush overflow-y-auto" style="max-height: 540px;">
                @if (conversations.length === 0) {
                  <div class="p-4 text-center text-muted">
                    <i class="bi bi-chat-square-text fs-3 d-block mb-2 text-secondary"></i>
                    <h6 class="small fw-bold text-dark mb-1">Aucune conversation active</h6>
                    <p class="small text-muted mb-0" style="font-size: 11px;">
                      Dès que vous soumettez une demande de réservation, la discussion avec le gestionnaire qui a publié le logement s'ouvrira automatiquement ici.
                    </p>
                  </div>
                }
                @for (conv of conversations; track conv.id) {
                  <button
                    type="button"
                    class="list-group-item list-group-item-action p-3 border-bottom text-start"
                    [class.bg-modify]="activeConvId === conv.id"
                    [class.border-dark]="activeConvId === conv.id"
                    (click)="selectionnerConversation(conv.id)">
                    <div class="d-flex align-items-start gap-2">
                      <div class="position-relative flex-shrink-0">
                        <img [src]="conv.interlocuteur.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'" 
                             class="rounded-circle object-fit-cover shadow-sm" 
                             style="width: 44px; height: 44px;" 
                             alt="Avatar">
                        @if (conv.interlocuteur.role === 'superadmin') {
                          <span class="position-absolute bottom-0 end-0 badge rounded-2 bg-danger p-1" title="Support Plateforme">
                            <i class="bi bi-shield-check" style="font-size: 8px;"></i>
                          </span>
                        } @else {
                          <span class="position-absolute bottom-0 end-0 badge rounded-2 bg-primary p-1" title="Gestionnaire Partenaire">
                            <i class="bi bi-buildings" style="font-size: 8px;"></i>
                          </span>
                        }
                      </div>

                      <div class="flex-grow-1 min-w-0">
                        <div class="d-flex align-items-center justify-content-between mb-1">
                          <strong class="text-dark small text-truncate d-block" style="max-width: 150px;">
                            {{ conv.interlocuteur.name }}
                          </strong>
                          <span class="text-muted" style="font-size: 10px;">{{ getRelativeTime(conv.dateDernierMessage) }}</span>
                        </div>

                        <div class="d-flex align-items-center gap-1 mb-1">
                          @if (conv.interlocuteur.role === 'superadmin') {
                            <span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25" style="font-size: 9px;">Superadmin</span>
                          } @else {
                            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25" style="font-size: 9px;">Gestionnaire</span>
                          }
                          @if (conv.logement_titre) {
                            <span class="text-muted text-truncate" style="font-size: 10px; max-width: 130px;">
                              • {{ conv.logement_titre }}
                            </span>
                          }
                        </div>

                        <p class="text-muted small text-truncate mb-0" style="font-size: 12px; max-width: 250px;">
                          {{ conv.dernierMessage }}
                        </p>
                      </div>

                      @if (conv.nonLus && conv.nonLus > 0) {
                        <span class="badge bg-danger rounded-2 align-self-center flex-shrink-0">{{ conv.nonLus }}</span>
                      }
                    </div>
                  </button>
                }
              </div>
            </div>

            <!-- Colonne 2 : Fil de la conversation sélectionnée (Desktop: visible, Mobile: plein écran avec bouton retour) -->
            <div class="col-12 col-lg-8 d-flex flex-column" [class.d-none]="!mobileShowConversation" [class.d-lg-flex]="true">
              @if (activeConversation) {
                <!-- Entête conversation -->
                <div class="p-3 border-bottom bg-white d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div class="d-flex align-items-center gap-2">
                    <!-- Bouton Retour visible sur Mobile (< lg) -->
                    <button type="button" 
                            class="btn btn-outline-secondary btn-sm rounded-2 d-lg-none me-1 d-flex align-items-center gap-1 shadow-sm px-2 py-1"
                            (click)="retourListeConversations()"
                            title="Retour aux conversations">
                      <i class="bi bi-arrow-left"></i>
                      <span class="small fw-semibold">Retour</span>
                    </button>

                    <img [src]="activeConversation.interlocuteur.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'" 
                         class="rounded-circle object-fit-cover shadow-sm flex-shrink-0" 
                         style="width: 42px; height: 42px;" 
                         alt="Avatar">
                    <div class="min-w-0">
                      <div class="d-flex align-items-center gap-2 flex-wrap">
                        <h3 class="h6 fw-bold mb-0 text-dark text-truncate">{{ activeConversation.interlocuteur.name }}</h3>
                        @if (activeConversation.interlocuteur.role === 'superadmin') {
                          <span class="badge bg-danger small" style="font-size: 10px;">Support</span>
                        } @else {
                          <span class="badge bg-primary small" style="font-size: 10px;">Gestionnaire</span>
                        }
                      </div>
                      <small class="text-muted d-block text-truncate" style="font-size: 11px;">
                        @if (activeConversation.interlocuteur.entreprise) {
                          {{ activeConversation.interlocuteur.entreprise }} • 
                        }
                        {{ activeConversation.interlocuteur.telephone || '+221 33 800 20 26' }}
                      </small>
                    </div>
                  </div>

                  <div class="d-flex align-items-center gap-2 flex-shrink-0">
                    <a [href]="'tel:' + (activeConversation.interlocuteur.telephone || '+221338002026')" class="btn btn-outline-primary btn-sm rounded-2 px-3">
                      <i class="bi bi-telephone-fill me-1"></i>
                      <span class="d-none d-sm-inline">Appeler</span>
                    </a>
                  </div>
                </div>

                <!-- Messages scrollables avec overflow horizontal évité et bulles responsives -->
                <div class="p-3 p-md-4 flex-grow-1 overflow-y-auto bg-light" style="max-height: 480px; min-height: 340px; overflow-x: hidden;">
                  <!-- Note d'information sécurisée -->
                  <div class="text-center mb-3">
                    <span class="badge bg-white text-muted border px-3 py-2 rounded-2 shadow-sm text-wrap" style="font-size: 11px; line-height: 1.4;">
                      <i class="bi bi-shield-lock-fill text-success me-1"></i>
                      Échanges cryptés conformes CDP Sénégal (Loi 2008-12) & Séquestre LogementPlus
                    </span>
                  </div>

                  @for (msg of activeConversation.messages; track msg.id) {
                    <div class="d-flex mb-3" [class.justify-content-end]="msg.expediteur?.role === 'locataire'" [class.justify-content-start]="msg.expediteur?.role !== 'locataire'">
                      <div class="card border-0 shadow-sm rounded-4 p-3" 
                           [style.max-width]="'85%'"
                           [style.word-break]="'break-word'"
                           [class.bg-primary]="msg.expediteur?.role === 'locataire'"
                           [class.text-white]="msg.expediteur?.role === 'locataire'"
                           [class.bg-white]="msg.expediteur?.role !== 'locataire'">
                        
                        <div class="d-flex align-items-center justify-content-between mb-1 gap-3">
                          <small class="fw-semibold" [class.text-white-50]="msg.expediteur?.role === 'locataire'" [class.text-primary]="msg.expediteur?.role !== 'locataire'">
                            {{ msg.expediteur?.name || 'Utilisateur' }}
                          </small>
                          <small [class.text-white-50]="msg.expediteur?.role === 'locataire'" [class.text-muted]="msg.expediteur?.role !== 'locataire'" style="font-size: 10px;">
                            {{ formatMessageDate(msg.created_at) }}
                          </small>
                        </div>

                        <p class="mb-0 small" style="white-space: pre-line; line-height: 1.5;">
                          {{ msg.contenu }}
                        </p>

                        <!-- ACTION SPÉCIALE DANS LE MESSAGE (Ex: Bouton de paiement Phase 2) -->
                        @if (msg.lien_action) {
                          <div class="mt-3 pt-2 border-top" [class.border-white]="msg.expediteur?.role === 'locataire'" [class.border-opacity-25]="msg.expediteur?.role === 'locataire'">
                            <div class="p-3 rounded-2" [class.bg-white]="msg.expediteur?.role !== 'locataire'" [class.bg-light]="msg.expediteur?.role !== 'locataire'" style="border: 1px solid rgba(16, 185, 129, 0.4);">
                              <div class="d-flex align-items-center gap-2 mb-2 text-success">
                                <i class="bi bi-shield-check fs-5"></i>
                                <strong class="small">Validation accordée — Phase 2 accessible</strong>
                              </div>
                              <p class="text-muted small mb-2" style="font-size: 11px;">
                                Votre caution et premier loyer restent sous séquestre 24h après remise des clés.
                              </p>
                              <a [routerLink]="msg.lien_action.url" 
                                 class="btn btn-success btn-sm w-100 fw-bold shadow-sm rounded-2 py-2 text-uppercase">
                                <i class="bi bi-credit-card-2-front me-2"></i>{{ msg.lien_action.label }}
                              </a>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>

                <!-- Zone de saisie du message optimisée pour mobile et clavier virtuel -->
                <div class="p-2 p-md-3 border-top bg-white position-sticky bottom-0">
                  <form (ngSubmit)="envoyerMessage()" class="d-flex align-items-center gap-2">
                    <input type="text" 
                           class="form-control rounded-pill px-3 py-2" 
                           placeholder="Écrivez votre message..." 
                           [(ngModel)]="newMessageContenu" 
                           name="messageInput"
                           autocomplete="off"
                           required>
                    <button type="submit" 
                            class="btn btn-primary rounded-pill px-3 px-md-4 py-2 d-flex align-items-center gap-2 fw-semibold flex-shrink-0 shadow-sm"
                            [disabled]="!newMessageContenu.trim()">
                      <span class="d-none d-sm-inline">Envoyer</span>
                      <i class="bi bi-send-fill"></i>
                    </button>
                  </form>
                </div>
              } @else {
                <!-- Aucune conversation active -->
                <div class="d-flex flex-column align-items-center justify-content-center h-100 p-5 text-center text-muted">
                  <div class="rounded-circle bg-light p-4 mb-3">
                    <i class="bi bi-chat-left-dots text-primary display-4"></i>
                  </div>
                  <h3 class="h5 fw-bold text-dark mb-1">Sélectionnez une conversation</h3>
                  <p class="small text-muted" style="max-width: 320px;">
                    Discutez en direct avec vos gestionnaires de biens et le support officiel LogementPlus Sénégal.
                  </p>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- =================================================================== -->
      <!-- CONTENU ONGLET 3 : PARAMÈTRES DU COMPTE LOCATAIRE                   -->
      <!-- =================================================================== -->
      @if (activeTab === 'parametres') {
        <div class="row g-4 mb-4">
          <!-- En-tête / Carte de profil récapitulative avec Avatar -->
          <div class="col-12">
            <div class="card border-0 shadow-sm rounded-4 bg-white p-4 overflow-hidden position-relative"
                 style="background: linear-gradient(135deg, rgba(11,61,145,0.04) 0%, rgba(20,184,166,0.06) 100%); border-left: 5px solid #0B3D91 !important;">
              <div class="d-flex align-items-center justify-content-between flex-wrap gap-4">
                <div class="d-flex align-items-center gap-3 flex-wrap">
                  <!-- Avatar avec bouton de changement -->
                  <div class="position-relative">
                    <img [src]="avatarPreviewUrl || currentUser()?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80'" 
                         class="rounded-circle object-fit-cover shadow border border-3 border-white"
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
                      <h2 class="h5 fw-bold text-dark mb-0">{{ currentUser()?.name || 'Locataire' }}</h2>
                      <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-2 px-2 py-1 small fw-semibold">
                        <i class="bi bi-person-badge me-1"></i>Compte Locataire
                      </span>
                      <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-2 px-2 py-1 small fw-semibold">
                        <i class="bi bi-check-circle-fill me-1"></i>Actif
                      </span>
                    </div>
                    <div class="text-muted small d-flex align-items-center gap-3 flex-wrap">
                      <span><i class="bi bi-envelope me-1 text-primary"></i>{{ currentUser()?.email }}</span>
                      <span><i class="bi bi-telephone me-1 text-primary"></i>{{ currentUser()?.telephone || 'Non renseigné' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Si photo sélectionnée en preview -->
                @if (selectedAvatarFile) {
                  <div class="p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center gap-3">
                    <div>
                      <strong class="d-block small text-dark"><i class="bi bi-image text-primary me-1"></i>Nouvelle photo sélectionnée</strong>
                      <small class="text-muted" style="font-size: 11px;">{{ selectedAvatarFile.name }}</small>
                    </div>
                    <div class="d-flex gap-2">
                      <button type="button" class="btn btn-sm btn-outline-secondary rounded-2" (click)="annulerAvatarPreview()" [disabled]="isUploadingAvatar">
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
              </div>

              @if (avatarSuccessMessage) {
                <div class="alert alert-success d-flex align-items-center gap-2 small py-2 rounded-2 mt-3 mb-0">
                  <i class="bi bi-check-circle-fill"></i>
                  <div>{{ avatarSuccessMessage }}</div>
                </div>
              }
              @if (avatarErrorMessage) {
                <div class="alert alert-danger d-flex align-items-center gap-2 small py-2 rounded-2 mt-3 mb-0">
                  <i class="bi bi-exclamation-triangle-fill"></i>
                  <div>{{ avatarErrorMessage }}</div>
                </div>
              }
            </div>
          </div>

          <!-- Colonne 1 : Informations personnelles (Consultation & Modification) -->
          <div class="col-lg-7">
            <div class="card border-0 shadow-sm rounded-4 bg-white p-4 h-100">
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
                <div class="alert alert-success d-flex align-items-center gap-2 small py-2 rounded-2 mb-3">
                  <i class="bi bi-check-circle-fill"></i>
                  <div>{{ profileSuccessMessage || 'Vos informations ont été mises à jour avec succès en base de données.' }}</div>
                </div>
              }

              @if (profileError) {
                <div class="alert alert-danger d-flex align-items-center gap-2 small py-2 rounded-2 mb-3">
                  <i class="bi bi-exclamation-triangle-fill"></i>
                  <div>{{ profileErrorMessage }}</div>
                </div>
              }

              @if (!modeEditionProfil) {
                <!-- Mode Consultation claire -->
                <div class="row g-3 py-2">
                  <div class="col-sm-6">
                    <label class="text-muted small d-block mb-1">Prénom</label>
                    <div class="p-2 rounded-2 bg-light border text-dark fw-semibold small">
                      {{ profilePrenom || currentUser()?.prenom || 'Non renseigné' }}
                    </div>
                  </div>
                  <div class="col-sm-6">
                    <label class="text-muted small d-block mb-1">Nom de famille</label>
                    <div class="p-2 rounded-2 bg-light border text-dark fw-semibold small">
                      {{ profileNom || currentUser()?.nom || 'Non renseigné' }}
                    </div>
                  </div>
                  <div class="col-12">
                    <label class="text-muted small d-block mb-1">Adresse E-mail</label>
                    <div class="p-2 rounded-2 bg-light border text-dark fw-semibold small d-flex align-items-center justify-content-between">
                      <span>{{ profileEmail || currentUser()?.email }}</span>
                      <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25" style="font-size: 10px;">Vérifié</span>
                    </div>
                  </div>
                  <div class="col-12">
                    <label class="text-muted small d-block mb-1">Numéro de Téléphone (Sénégal)</label>
                    <div class="p-2 rounded-2 bg-light border text-dark fw-semibold small">
                      {{ currentUser()?.telephone || (profileTelephone ? '+221 ' + profileTelephone : 'Non renseigné') }}
                    </div>
                  </div>
                  <div class="col-12 mt-3">
                    <div class="p-3 rounded-2 border bg-light text-muted small" style="font-size: 11px;">
                      <i class="bi bi-info-circle-fill text-primary me-1"></i>
                      Ces informations apparaissent sur vos contrats de bail générés automatiquement et sont transmises aux gestionnaires partenaires après validation de vos réservations.
                    </div>
                  </div>
                </div>
              } @else {
                <!-- Mode Édition -->
                <form (ngSubmit)="confirmerEtSauvegarderProfil()">
                  <div class="row g-3 mb-3">
                    <div class="col-sm-6">
                      <label class="form-label small fw-semibold text-dark">Prénom <span class="text-danger">*</span></label>
                      <input type="text" class="form-control form-control-sm rounded-2" [(ngModel)]="profilePrenom" name="prenom" required>
                    </div>
                    <div class="col-sm-6">
                      <label class="form-label small fw-semibold text-dark">Nom de famille <span class="text-danger">*</span></label>
                      <input type="text" class="form-control form-control-sm rounded-2" [(ngModel)]="profileNom" name="nom" required>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label small fw-semibold text-dark">Adresse E-mail <span class="text-danger">*</span></label>
                    <input type="email" class="form-control form-control-sm rounded-2" [(ngModel)]="profileEmail" name="email" required>
                    <small class="text-muted" style="font-size: 11px;">Important : cet e-mail sert également d'identifiant de connexion à votre compte.</small>
                  </div>

                  <div class="mb-3">
                    <label class="form-label small fw-semibold text-dark">Numéro de Téléphone (Sénégal)</label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-light text-muted">+221</span>
                      <input type="text" class="form-control rounded-end-2" placeholder="77 000 00 00" [(ngModel)]="profileTelephone" name="telephone">
                    </div>
                    <small class="text-muted" style="font-size: 11px;">Nécessaire pour les notifications de visite et reçus de séquestre.</small>
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
            <div class="card border-0 shadow-sm rounded-4 bg-white p-4 h-100">
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
                <div class="alert alert-success d-flex align-items-center gap-2 small py-2 rounded-2 mb-3">
                  <i class="bi bi-check-circle-fill"></i>
                  <div>{{ passwordSuccessMessage }}</div>
                </div>
              }

              @if (passwordError) {
                <div class="alert alert-danger d-flex align-items-center gap-2 small py-2 rounded-2 mb-3">
                  <i class="bi bi-exclamation-triangle-fill"></i>
                  <div>{{ passwordErrorMessage }}</div>
                </div>
              }

              <form (ngSubmit)="confirmerEtChangerMotDePasse()">
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-dark">Mot de passe actuel <span class="text-danger">*</span></label>
                  <div class="input-group input-group-sm">
                    <input [type]="showOldPassword ? 'text' : 'password'" 
                           class="form-control rounded-start-2" 
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
                           class="form-control rounded-start-2" 
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
                           class="form-control rounded-start-2" 
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

              <div class="border-top mt-4 pt-3 text-center">
                <button type="button" class="btn btn-outline-danger btn-sm rounded-2 px-3" (click)="logout()">
                  <i class="bi bi-box-arrow-right me-1"></i> Se déconnecter de mon compte
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>

    <!-- =================================================================== -->
    <!-- MODALE : GÉRER MES PIÈCES & VÉRIFICATION D'AUTHENTICITÉ             -->
    <!-- =================================================================== -->
    @if (showDossierModal) {
      <div class="modal fade show d-block" style="background-color: rgba(0,0,0,0.6); z-index: 1060; backdrop-filter: blur(4px);">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
            <div class="modal-header border-bottom p-3 bg-light">
              <div>
                <h5 class="modal-title h4 fw-bold mb-0 d-flex align-items-center gap-2 text-dark">
                  <i class="bi bi-shield-check text-success"></i> Gestion du Dossier Locataire & Certification
                </h5>
                <small class="text-muted" style="font-size: 11px;">Système de vérification d'authenticité conforme aux normes de la CDP Sénégal</small>
              </div>
              <button type="button" class="btn-close" (click)="toggleDossierModal()"></button>
            </div>

            <div class="modal-body p-4">
              @if (verifGlobalMessage) {
                <div class="alert d-flex align-items-center gap-2 small py-2 rounded-2 mb-3"
                     [ngClass]="verifGlobalSuccess ? 'alert-success' : 'alert-danger'">
                  <i class="bi fs-5" [ngClass]="verifGlobalSuccess ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
                  <div>{{ verifGlobalMessage }}</div>
                </div>
              }

              <!-- Barre de test rapide pour spécimens conformes -->
              <!-- <div class="p-3 mb-3 rounded-2 bg-light border border-dashed">
                <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div>
                    <span class="fw-bold text-dark d-block small">
                      <i class="bi bi-shield-lock-fill text-primary me-1"></i> Moteur d'Audit Anti-Fraude LogementPlus
                    </span>
                    <small class="text-muted" style="font-size: 11px;">
                      Les captures d'écran web ou images non régaliennes sont automatiquement rejetées.
                    </small>
                  </div>
                  <div class="d-flex gap-2">
                    <button type="button" class="btn btn-outline-success btn-sm rounded-2 py-1 px-3" style="font-size: 11px;" (click)="testerSpecimen('identite')">
                      <i class="bi bi-magic me-1"></i> Tester spécimen CNI conforme
                    </button>
                    <button type="button" class="btn btn-outline-success btn-sm rounded-2 py-1 px-3" style="font-size: 11px;" (click)="testerSpecimen('revenus')">
                      <i class="bi bi-magic me-1"></i> Tester spécimen Bulletin conforme
                    </button>
                  </div>
                </div>
              </div> -->

              <!-- BLOC 1 : PIÈCE D'IDENTITÉ -->
              <div class="card border rounded-2 p-3 mb-3 bg-white"
                   [style.border-color]="dossier.identite.statut === 'rejete' ? '#EF4444 !important' : (dossier.identite.statut === 'valide' ? '#10B981 !important' : '')">
                <div class="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                  <div class="d-flex align-items-center gap-2">
                    <span class="badge text-white rounded-circle p-2"
                          [style.background-color]="dossier.identite.statut === 'rejete' ? '#EF4444' : (dossier.identite.statut === 'valide' ? '#10B981' : '#0F2F6B')"
                          style="width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px;">1</span>
                    <strong class="text-dark small">Pièce d'Identité Officielle</strong>
                  </div>
                  <div>
                    @if (dossier.identite.statut === 'valide') {
                      <span class="badge bg-success small"><i class="bi bi-patch-check-fill me-1"></i>Certifiée Authentique ✓ ({{ dossier.identite.numeroCertificat }})</span>
                    } @else if (dossier.identite.statut === 'en_analyse') {
                      <span class="badge bg-warning text-dark small"><i class="bi bi-hourglass-split me-1"></i>Audit automatique en cours...</span>
                    } @else if (dossier.identite.statut === 'rejete') {
                      <span class="badge bg-danger small"><i class="bi bi-x-octagon-fill me-1"></i>Document Rejeté (Échec audit)</span>
                    } @else {
                      <span class="badge bg-secondary small">Non fournie</span>
                    }
                  </div>
                </div>

                <div class="row g-2 mb-2">
                  <div class="col-sm-6">
                    <label class="form-label small text-muted mb-1" style="font-size: 11px;">Type de document</label>
                    <select class="form-select form-select-sm" [(ngModel)]="pieceIdType" name="pieceIdType">
                      <option value="cni">CNI biométrique CEDEAO Sénégal (13 chiffres)</option>
                      <option value="passeport">Passeport République du Sénégal / CEDEAO</option>
                      <option value="etudiant">Carte d'étudiant / Certificat de scolarité</option>
                      <option value="sejour">Carte de séjour résident étranger</option>
                    </select>
                  </div>
                  <div class="col-sm-6">
                    <label class="form-label small text-muted mb-1" style="font-size: 11px;">Numéro du document</label>
                    <input type="text" class="form-control form-control-sm" placeholder="Ex: 1 751 1995 02841" [(ngModel)]="pieceIdNumero" name="pieceIdNumero">
                  </div>
                </div>

                <div class="mb-2">
                  <label class="form-label small text-muted mb-1" style="font-size: 11px;">Téléverser le fichier (la vérification démarre automatiquement dès l'envoi)</label>
                  <input type="file" class="form-control form-control-sm" (change)="onFileSelected('identite', $event)">
                  @if (dossier.identite.nomFichier) {
                    <small class="text-muted d-block mt-1" style="font-size: 11px;">
                      <i class="bi bi-file-earmark me-1"></i> Fichier soumis : <strong>{{ dossier.identite.nomFichier }}</strong> ({{ dossier.identite.tailleFichier }})
                    </small>
                  }
                </div>

                <!-- État 1 : Audit en direct (animation) -->
                @if (isVerifyingIdentite) {
                  <div class="p-3 my-2 rounded-2 bg-light border text-center">
                    <div class="d-flex align-items-center justify-content-center gap-2 text-primary fw-semibold mb-2">
                      <span class="spinner-border spinner-border-sm"></span>
                      <span style="font-size: 12px;">Audit d'authenticité et contrôle anti-fraude en cours...</span>
                    </div>
                    <div class="progress mb-2" style="height: 5px;">
                      <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary w-100"></div>
                    </div>
                    <small class="text-muted" style="font-size: 11px;">
                      Contrôle géométrique • Détection de capture d'écran web • Bande MRZ • Normes CDP Sénégal
                    </small>
                  </div>
                }

                <!-- État 2 : Rejeté avec explications claires -->
                @if (!isVerifyingIdentite && dossier.identite.statut === 'rejete') {
                  <div class="p-3 my-2 rounded-2 bg-danger bg-opacity-10 border border-danger border-opacity-25">
                    <div class="d-flex align-items-start gap-2">
                      <i class="bi bi-x-octagon-fill text-danger fs-4 mt-1"></i>
                      <div class="flex-grow-1">
                        <div class="d-flex align-items-center justify-content-between flex-wrap">
                          <strong class="text-danger small">Échec du contrôle d'authenticité - Document Rejeté</strong>
                          <span class="badge bg-danger small">Score conformité : {{ dossier.identite.scoreConformite }}%</span>
                        </div>
                        <p class="small text-danger mb-2 mt-1" style="font-size: 12px; line-height: 1.45;">
                          {{ dossier.identite.motifRejet }}
                        </p>
                        <div class="d-flex align-items-center gap-2 flex-wrap">
                          <span class="badge bg-white text-danger border border-danger border-opacity-25" style="font-size: 10px;">
                            <i class="bi bi-display me-1"></i>Capture d'écran non autorisée
                          </span>
                          <span class="badge bg-white text-danger border border-danger border-opacity-25" style="font-size: 10px;">
                            <i class="bi bi-x-circle me-1"></i>Éléments régaliens absents
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                }

                <!-- État 3 : Validé avec certificat -->
                @if (!isVerifyingIdentite && dossier.identite.statut === 'valide') {
                  <div class="p-3 my-2 rounded-2 bg-success bg-opacity-10 border border-success border-opacity-25">
                    <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-patch-check-fill text-success fs-4"></i>
                        <div>
                          <strong class="text-success small d-block">Pièce d'Identité Certifiée Conforme ✓</strong>
                          <small class="text-muted" style="font-size: 11px;">
                            Certificat : <code>{{ dossier.identite.numeroCertificat }}</code> • Score : <strong>{{ dossier.identite.scoreConformite }}%</strong> • Validé le {{ dossier.identite.dateVerification }}
                          </small>
                        </div>
                      </div>
                      <span class="badge bg-success small">CDP Sénégal Conforme ✓</span>
                    </div>
                  </div>
                }
              </div>

              <!-- BLOC 2 : FORMULE DE GARANTIE / SÉQUESTRE -->
              <div class="card border rounded-2 p-3 bg-white">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <div class="d-flex align-items-center gap-2">
                    <span class="badge bg-primary text-white rounded-circle p-2" style="width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px;">2</span>
                    <strong class="text-dark small">Garantie & Séquestre 24h</strong>
                  </div>
                  <span class="badge bg-success small">Séquestre Wave/OM Activé ✓</span>
                </div>
                <select class="form-select form-select-sm" [(ngModel)]="garantieType" name="garantieType">
                  <option value="sequestre_wave">Garantie Séquestre LogementPlus 24h (Paiement Wave / Orange Money)</option>
                  <option value="caution_bloquee">Caution bancaire bloquée (2 mois de loyer max selon la loi sénégalaise)</option>
                  <option value="garant_physique">Garant personne physique solvable résidant au Sénégal</option>
                </select>
                <small class="text-muted d-block mt-1" style="font-size: 11px;">
                  Vos fonds de caution restent protégés sous séquestre tiers certifié et ne sont débloqués que 24h après remise conforme des clés.
                </small>
              </div>
            </div>

            <div class="modal-footer border-top p-3 bg-light">
              <button type="button" class="btn btn-secondary btn-md rounded-2 px-3" (click)="toggleDossierModal()">
                Fermer
              </button>
              <button type="button" class="btn btn-primary btn-md rounded-2 px-4  fw-semibold" (click)="sauvegarderDossierComplet()">
                <i class="bi bi-check-lg me-1"></i> Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class TenantDashboardComponent implements OnInit, OnDestroy {
  private reservationService = inject(ReservationService);
  private favoriService = inject(FavoriService);
  private dossierService = inject(DossierLocataireService);
  private messageService = inject(MessageService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private modalAlert = inject(ModalAlertService);

  currentUser = this.auth.currentUser;


  // Gestion des onglets : 'reservations' | 'favoris' | 'messagerie' | 'parametres'
  activeTab: 'reservations' | 'favoris' | 'messagerie' | 'parametres' = 'reservations';

  // Données
  reservations: Reservation[] = [];
  favoris: Logement[] = [];
  dossier: DossierLocataire = this.dossierService.getDossierSync();

  // Messagerie intégrée
  conversations: Conversation[] = [];
  activeConvId: string | null = null;
  newMessageContenu = '';
  private convSub?: Subscription;

  get activeConversation(): Conversation | undefined {
    return this.conversations.find(c => c.id === this.activeConvId);
  }

  get nbNonLus(): number {
    const nb = this.messageService.getNbNonLusTotal();
    this.cdr.markForCheck();
    return nb;
  }

  get reservationValidee(): Reservation | undefined {
    return this.reservations.find(r => r.statut === 'confirmee');
  }

 

  // Modale Dossier & Vérification d'authenticité
  showDossierModal = false;
  verifGlobalSuccess = false;
  verifGlobalMessage = '';
  isVerifyingIdentite = false;

  // Champs de la modale dossier
  pieceIdType = 'cni';
  pieceIdNumero = '';
  garantieType = 'sequestre_wave';

  // Navigation Messagerie Responsive (Desktop / Mobile)
  mobileShowConversation = false;

  // Paramètres du profil locataire
  profileNom = '';
  profilePrenom = '';
  profileEmail = '';
  profileTelephone = '';
  modeEditionProfil = false;
  isSavingProfile = false;
  profileSuccess = false;
  profileSuccessMessage = '';
  profileError = false;
  profileErrorMessage = '';

  // Avatar / Photo de profil
  selectedAvatarFile: File | null = null;
  avatarPreviewUrl: string | null = null;
  isUploadingAvatar = false;
  avatarSuccessMessage = '';
  avatarErrorMessage = '';

  // Paramètres mot de passe avec masquage/affichage
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

  ngOnInit(): void {
    if (!this.auth.currentUser()) {
      this.router.navigate(['/login']);
      return;
    }

    this.initProfileFields();
    this.loadReservations();
    this.loadFavoris();
    this.loadDossier();

    console.log(this.auth.currentUser())

    // Abonnement aux conversations de messagerie
    this.convSub = this.messageService.conversations$.subscribe(convs => {
      this.conversations = convs || [];
      
      if (!this.activeConvId && this.conversations.length > 0) {
        this.activeConvId = this.conversations[0].id;
        
      }
      this.cdr.markForCheck();
    });

    // Écoute des queryParams pour ouverture directe (ex: ?tab=messagerie)
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.setTab(params['tab']);
      }
    });
  }

  ngOnDestroy(): void {
    this.convSub?.unsubscribe();
  }

  setTab(tab: 'reservations' | 'favoris' | 'messagerie' | 'parametres'): void {
    this.activeTab = tab;
    if (tab === 'favoris') {
      this.loadFavoris();
    } else if (tab === 'messagerie') {
      this.messageService.rechargerConversations();
      if (this.activeConvId) {
        this.messageService.marquerConversationLue(this.activeConvId);
      }
    }
    this.cdr.markForCheck();
  }

  selectionnerConversation(convId: string): void {
    this.activeConvId = convId;
    this.mobileShowConversation = true;
    this.messageService.marquerConversationLue(convId);
    this.cdr.markForCheck();
  }

  retourListeConversations(): void {
    this.mobileShowConversation = false;
    this.cdr.markForCheck();
  }

  discuterAvecGestionnaire(res: Reservation): void {
    const convId = `conv_res_${res.id}`;
    this.setTab('messagerie');
    this.mobileShowConversation = true;
    const target = this.conversations.find(c => c.id === convId || c.reservation_id === res.id);
    if (target) {
      this.selectionnerConversation(target.id);
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
      }, 100);
    }
    this.cdr.markForCheck();
  }

  envoyerMessage(): void {
    if (!this.activeConvId || !this.newMessageContenu.trim()) return;
    this.messageService.envoyerMessage(this.activeConvId, this.newMessageContenu);
    this.newMessageContenu = '';
    this.cdr.markForCheck();
  }

  private initProfileFields(): void {
    const user = this.currentUser();
    if (user) {
      this.profileNom = user.nom || user.name.split(' ').slice(1).join(' ') || '';
      this.profilePrenom = user.prenom || user.name.split(' ')[0] || '';
      this.profileEmail = user.email || '';
      this.profileTelephone = user.telephone ? user.telephone.replace('+221', '').trim() : '';
    }
  }

  loadReservations(): void {
    this.reservationService.getMesReservations().subscribe({
      next: (data) => {
        const user = this.currentUser();
        this.reservations = (data.filter(res => res.locataire_id === user?.id) || []).map(r => {
          if (!r.locataire && user) {
            r.locataire = user;
          }
          return r;
        });
        this.cdr.markForCheck();
      },
      error: (err) => console.error(err)
    });
  }

  loadFavoris(): void {
    this.favoris = this.favoriService.getFavoris();

    this.cdr.markForCheck();
  }

  loadDossier(): void {
    this.dossier = this.dossierService.getDossierSync();
    if (this.dossier.identite.numeroPiece) {
      this.pieceIdNumero = this.dossier.identite.numeroPiece;
    }
    this.cdr.markForCheck();
  }

  retirerFavori(id: number): void {
    this.favoriService.retirerFavori(id);
    this.loadFavoris();
  }

  countByStatut(statuts: string[]): number {
    return this.reservations.filter(r => statuts.includes(r.statut)).length;
  }

  toggleDossierModal(): void {
    this.showDossierModal = !this.showDossierModal;
    this.verifGlobalSuccess = false;
    this.cdr.markForCheck();
  }

  async onFileSelected(categorie: 'identite', event: any): Promise<void> {
    const file: File = event.target?.files?.[0];
    if (!file) return;

    const tailleKb = Math.round(file.size / 1024);
    const tailleStr = tailleKb > 1024 ? `${(tailleKb / 1024).toFixed(1)} Mo` : `${tailleKb} Ko`;

    if (categorie === 'identite') {
      this.isVerifyingIdentite = true;
      const libelles: { [key: string]: string } = {
        cni: 'CNI biométrique CEDEAO Sénégal',
        passeport: 'Passeport République du Sénégal',
        sejour: 'Carte de séjour résident',
        etudiant: 'Carte d\'étudiant / Certificat de scolarité'
      };
      const libelleType = libelles[this.pieceIdType] || 'Pièce d\'identité';
      this.cdr.markForCheck();

      // Déclenchement automatique immédiat de l'audit dès sélection du fichier
      const res = await this.dossierService.analyserEtVerifierAutomatique('identite', file, {
        type: this.pieceIdType,
        libelleType: libelleType,
        nomFichier: file.name,
        tailleFichier: tailleStr,
        numeroPiece: this.pieceIdNumero || '1751199502841'
      });

      this.isVerifyingIdentite = false;
      this.verifGlobalSuccess = res.succes;
      this.verifGlobalMessage = res.succes ? res.message : 'Attention : ' + (res.motifRejet || res.message);
      this.loadDossier();
    }
  }

  async testerSpecimen(categorie: 'identite'): Promise<void> {
    if (categorie === 'identite') {
      this.isVerifyingIdentite = true;
      this.pieceIdType = 'cni';
      this.pieceIdNumero = '1 751 1995 02841';
      this.cdr.markForCheck();

      const res = await this.dossierService.analyserEtVerifierAutomatique('identite', null, {
        type: 'cni',
        libelleType: 'CNI biométrique CEDEAO Sénégal',
        nomFichier: 'cni_biometrique_senegal_valide.pdf',
        tailleFichier: '1.2 Mo',
        numeroPiece: '1 751 1995 02841',
        estSpecimenValide: true
      });

      this.isVerifyingIdentite = false;
      this.verifGlobalSuccess = true;
      this.verifGlobalMessage = res.message;
      this.loadDossier();
    }
  }

  async sauvegarderDossierComplet(): Promise<void> {
    this.loadDossier();
    if (this.dossier.identite.statut === 'rejete') {
      this.verifGlobalSuccess = false;
      this.verifGlobalMessage = 'Votre pièce d\'identité a été rejetée par l\'audit anti-fraude. Veuillez corriger le document avant de certifier votre dossier.';
      this.cdr.markForCheck();
      return;
    }

    this.verifGlobalSuccess = true;
    this.verifGlobalMessage = 'Dossier locataire sauvegardé et audité avec succès.';
    setTimeout(() => {
      this.showDossierModal = false;
      this.cdr.markForCheck();
    }, 1200);
  }

  onAvatarFileSelected(event: any): void {
    const file: File = event.target?.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.avatarErrorMessage = 'Le fichier sélectionné doit être une image (JPEG, PNG, WEBP).';
      this.avatarSuccessMessage = '';
      this.cdr.markForCheck();
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      this.avatarErrorMessage = 'La taille de l\'image ne doit pas dépasser 3 Mo.';
      this.avatarSuccessMessage = '';
      this.cdr.markForCheck();
      return;
    }

    this.selectedAvatarFile = file;
    this.avatarErrorMessage = '';
    this.avatarSuccessMessage = '';

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.avatarPreviewUrl = e.target.result;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  annulerAvatarPreview(): void {
    this.selectedAvatarFile = null;
    this.avatarPreviewUrl = null;
    this.avatarErrorMessage = '';
    this.avatarSuccessMessage = '';
    this.cdr.markForCheck();
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
        this.selectedAvatarFile = null;
        this.avatarPreviewUrl = null;
        setTimeout(() => {
          this.avatarSuccessMessage = '';
          this.cdr.markForCheck();
        }, 4000);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isUploadingAvatar = false;
        this.avatarErrorMessage = err.error?.message || 'Erreur lors du téléversement de la photo.';
        this.cdr.markForCheck();
      }
    });
  }

  activerEditionProfil(): void {
    this.initProfileFields();
    this.modeEditionProfil = true;
    this.profileSuccess = false;
    this.profileError = false;
    this.cdr.markForCheck();
  }

  annulerEditionProfil(): void {
    this.initProfileFields();
    this.modeEditionProfil = false;
    this.profileSuccess = false;
    this.profileError = false;
    this.cdr.markForCheck();
  }

  confirmerEtSauvegarderProfil(): void {
    if (!this.profilePrenom.trim() || !this.profileNom.trim() || !this.profileEmail.trim()) {
      this.profileError = true;
      this.profileErrorMessage = 'Veuillez renseigner tous les champs obligatoires (prénom, nom, e-mail).';
      this.cdr.markForCheck();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.profileEmail.trim())) {
      this.profileError = true;
      this.profileErrorMessage = 'Veuillez saisir une adresse e-mail valide.';
      this.cdr.markForCheck();
      return;
    }

    const currentEmail = this.currentUser()?.email;
    const emailModifie = currentEmail && currentEmail.toLowerCase() !== this.profileEmail.trim().toLowerCase();

    const confirmationMsg = emailModifie
      ? 'Attention : Vous avez modifié votre adresse e-mail. Elle servira désormais de nouvel identifiant de connexion. Voulez-vous confirmer cet enregistrement ?'
      : 'Confirmez-vous l\'enregistrement des modifications de vos coordonnées ?';

    this.modalAlert.confirm(
      confirmationMsg,
      'Confirmation de modification',
      'Confirmer & Enregistrer',
      'Annuler'
    ).then((confirmed) => {
      if (confirmed) {
        this.saveProfile();
      }
    });
  }

  saveProfile(): void {
    this.isSavingProfile = true;
    this.profileSuccess = false;
    this.profileError = false;

    const telephoneFormate = this.profileTelephone.trim() 
      ? (this.profileTelephone.trim().startsWith('+221') ? this.profileTelephone.trim() : `+221 ${this.profileTelephone.trim()}`)
      : '';

    const payload: Partial<User> = {
      nom: this.profileNom.trim(),
      prenom: this.profilePrenom.trim(),
      email: this.profileEmail.trim(),
      telephone: telephoneFormate,
      name: `${this.profilePrenom.trim()} ${this.profileNom.trim()}`
    };

    this.auth.updateProfile(payload).subscribe({
      next: (res) => {
        this.isSavingProfile = false;
        this.profileSuccess = true;
        this.profileSuccessMessage = res.message || 'Vos coordonnées ont été mises à jour avec succès en base de données.';
        this.modeEditionProfil = false;
        setTimeout(() => {
          this.profileSuccess = false;
          this.cdr.markForCheck();
        }, 4000);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isSavingProfile = false;
        this.profileError = true;
        this.profileErrorMessage = err.error?.message || (err.error?.errors ? Object.values(err.error.errors).flat().join(' ') : 'Erreur lors de la mise à jour des coordonnées.');
        this.cdr.markForCheck();
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
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordError = true;
      this.passwordErrorMessage = 'Le nouveau mot de passe doit comporter au moins 6 caractères.';
      this.cdr.markForCheck();
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = true;
      this.passwordErrorMessage = 'Les deux nouveaux mots de passe ne correspondent pas.';
      this.cdr.markForCheck();
      return;
    }

    this.modalAlert.confirm(
      'Voulez-vous vraiment changer votre mot de passe ? Vous devrez utiliser le nouveau lors de vos prochaines connexions.',
      'Changement de mot de passe',
      'Confirmer le changement',
      'Annuler'
    ).then((confirmed) => {
      if (confirmed) {
        this.changePassword();
      }
    });
  }

  changePassword(): void {
    this.isChangingPassword = true;
    this.passwordError = false;
    this.passwordSuccess = false;

    this.auth.changePassword(this.oldPassword, this.newPassword, this.confirmPassword).subscribe({
      next: (res) => {
        this.isChangingPassword = false;
        this.passwordSuccess = true;
        this.passwordSuccessMessage = res.message || 'Votre mot de passe a été modifié avec succès.';
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        setTimeout(() => {
          this.passwordSuccess = false;
          this.cdr.markForCheck();
        }, 4000);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isChangingPassword = false;
        this.passwordError = true;
        this.passwordErrorMessage = err.error?.message || (err.error?.errors ? Object.values(err.error.errors).flat().join(' ') : 'Erreur lors du changement de mot de passe.');
        this.cdr.markForCheck();
      }
    });
  }

  logout(): void {
    this.modalAlert.confirm(
      'Voulez-vous vraiment vous déconnecter de votre espace locataire ?',
      'Déconnexion',
      'Oui, me déconnecter',
      'Rester connecté'
    ).then((confirmed) => {
      if (confirmed) {
        this.auth.logout();
        this.router.navigate(['/']);
      }
    });
  }

  annuler(id: number): void {
    this.modalAlert.confirm(
      'Êtes-vous sûr de vouloir annuler cette réservation ? Cette action libérera le logement pour d\'autres locataires.',
      'Annulation de Réservation',
      'Confirmer l\'annulation',
      'Conserver ma réservation'
    ).then((confirmed) => {
      if (confirmed) {
        this.reservationService.annulerReservation(id).subscribe({
          next: () => {
            this.modalAlert.success('Votre réservation a été annulée selon la politique applicable.', 'Réservation Annulée');
            this.loadReservations();
          },
          error: (err) => this.modalAlert.error(err.error?.message || 'Erreur lors de l\'annulation', 'Erreur')
        });
      }
    });
  }

  estPayee(res: Reservation): boolean {
    return res.statut === 'payee' || res.statut === 'en_cours' || res.statut === 'terminee';
  }

  viewContrat(res: Reservation): void {
    if (!res.locataire && this.currentUser()) {
      res.locataire = this.currentUser()!;
    }
    this.modalAlert.showContrat(res);
  }

  viewRecu(res: Reservation): void {
    if (!this.estPayee(res)) {
      this.modalAlert.warning(
        'Le reçu officiel de séquestre n\'est généré qu\'une fois le paiement effectué.',
        'Paiement requis'
      );
      return;
    }
    if (!res.locataire && this.currentUser()) {
      res.locataire = this.currentUser()!;
    }
    this.modalAlert.showRecu(res);
  }

  getRelativeTime(dateStr?: string): string {
    return this.messageService.getRelativeTime(dateStr);
  }

  formatMessageDate(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const hier = new Date(now);
    hier.setDate(now.getDate() - 1);
    const isHier = date.toDateString() === hier.toDateString();

    const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return time;
    if (isHier) return `Hier ${time}`;
    return `${date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} ${time}`;
  }
}
