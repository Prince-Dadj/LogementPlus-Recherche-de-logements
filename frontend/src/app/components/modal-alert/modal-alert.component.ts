import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ModalAlertService, ModalAlertConfig } from '../../services/modal-alert.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-modal-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (state && state.isOpen) {
      <div class="modal-backdrop-custom" (click)="onBackdropClick($event)">
        <div class="modal-card-custom" 
             [ngClass]="{'modal-card-wide': state.type === 'recu' || state.type === 'contrat'}"
             (click)="$event.stopPropagation()">

          <!-- 1. MODALE REÇU OFFICIEL DE SÉQUESTRE & PAIEMENT SÉNÉGAL -->
          @if (state.type === 'recu') {
            <div class="p-0 printable-recu">
              <!-- En-tête officiel Reçu -->
              <div class="p-4 text-white position-relative" style="background: linear-gradient(135deg, #072559 0%, #0B3D91 60%, #14B8A6 100%);">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <span class="badge bg-white text-dark fw-bold px-2 py-1 mb-2">
                      <i class="bi bi-shield-check text-success me-1"></i> RÉPUBLIQUE DU SÉNÉGAL
                    </span>
                    <h5 class="fw-bold mb-1 text-white">REÇU OFFICIEL DE SÉQUESTRE & PAIEMENT</h5>
                    <p class="small text-white-50 mb-0">Plateforme Immobilière Certifiée • LogementPlus Sénégal</p>
                  </div>
                  <div class="text-end">
                    <span class="badge bg-success bg-opacity-25 border border-success text-white px-3 py-2 fs-6">
                      <i class="bi bi-check-circle-fill text-warning me-1"></i> CONFIRMÉ ✓
                    </span>
                    <div class="small text-white-50 mt-1">Réf: #REC-SN-2026-{{ state.reservation?.id || 'SN' }}</div>
                  </div>
                </div>
              </div>

              <!-- Corps du reçu -->
              <div class="p-4">
                <!-- Détails du bien et des parties -->
                <div class="row g-3 mb-4">
                  <div class="col-sm-6">
                    <div class="p-3 bg-light rounded-3 h-100 border">
                      <div class="small text-muted fw-bold text-uppercase mb-1">Locataire Payeur</div>
                      <div class="fw-bold text-dark">{{ locataireName }}</div>
                      <div class="small text-muted"><i class="bi bi-envelope me-1"></i>{{ locataireEmail }}</div>
                      <div class="small text-muted"><i class="bi bi-telephone me-1"></i>{{ locataireTelephone }}</div>
                    </div>
                  </div>
                  <div class="col-sm-6">
                    <div class="p-3 bg-light rounded-3 h-100 border">
                      <div class="small text-muted fw-bold text-uppercase mb-1">Logement & Gestionnaire</div>
                      <div class="fw-bold text-dark text-truncate">{{ state.reservation?.logement?.titre || 'Logement Réf #' + (state.reservation?.logement_id || state.reservation?.id) }}</div>
                      <div class="small text-muted">{{ state.reservation?.logement?.adresse || state.reservation?.logement?.quartier || 'Dakar, Sénégal' }}</div>
                      <div class="small text-primary fw-medium">{{ state.reservation?.logement?.admin?.raison_sociale || 'Agence Immobilière Partenaire' }}</div>
                    </div>
                  </div>
                </div>

                <!-- Tableau financier -->
                <div class="table-responsive mb-4">
                  <table class="table table-bordered mb-0">
                    <thead class="table-light small">
                      <tr>
                        <th>Rubrique</th>
                        <th>Détails réglementaires Sénégal</th>
                        <th class="text-end">Montant (FCFA)</th>
                      </tr>
                    </thead>
                    <tbody class="small">
                      <tr>
                        <td class="fw-bold">Premier Mois de Loyer</td>
                        <td class="text-muted">Période du {{ state.reservation?.date_debut | date: 'dd/MM/yyyy' }} au {{ state.reservation?.date_fin | date: 'dd/MM/yyyy'}}</td>
                        <td class="text-end fw-semibold">{{ (state.reservation?.montant_loyer || 0).toLocaleString('fr-FR') }} FCFA</td>
                      </tr>
                      <tr>
                        <td class="fw-bold">Dépôt de Garantie (Caution)</td>
                        <td class="text-muted">Séquestre garanti conforme loi sénégalaise (max 2 mois)</td>
                        <td class="text-end fw-semibold">{{ (state.reservation?.montant_caution || 0).toLocaleString('fr-FR') }} FCFA</td>
                      </tr>
                      <tr>
                        <td class="fw-bold">Frais de Service & Séquestre</td>
                        <td class="text-muted">Assistance juridique, bail dématérialisé et protection litiges</td>
                        <td class="text-end fw-semibold">{{ (state.reservation?.montant_frais_service || 0).toLocaleString('fr-FR') }} FCFA</td>
                      </tr>
                      <tr class="table-primary fw-bold fs-6">
                        <td colspan="2" class="text-end text-dark">TOTAL RÉGLÉ / SÉQUESTRE :</td>
                        <td class="text-end text-primary">{{ (state.reservation?.montant_total || 0).toLocaleString('fr-FR') }} FCFA</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Mention légale et cachet -->
                <div class="p-3 rounded-3 border border-success bg-success bg-opacity-10 d-flex align-items-center justify-content-between mb-4">
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-patch-check-fill text-success fs-3"></i>
                    <div>
                      <div class="fw-bold text-success small">GARANTIE SÉQUESTRE 24H ACTIVE</div>
                      <div class="text-muted small">Fonds bloqués sur compte séquestre Wave / OM jusqu'à constat contradictoire.</div>
                    </div>
                  </div>
                  <div class="text-end d-none d-sm-block">
                    <span class="badge bg-dark">CERTIFIÉ SÉNÉGAL</span>
                  </div>
                </div>

                <!-- Boutons d'action -->
                <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                  <button type="button" class="btn btn-outline-secondary rounded-2 px-4" (click)="close()">
                    Fermer
                  </button>
                  <button type="button" class="btn btn-primary rounded-2 px-4 fw-bold shadow-sm" (click)="imprimer()">
                    <i class="bi bi-printer me-1"></i> Imprimer le Reçu Officiel
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- 2. MODALE CONTRAT DE BAIL OFFICIEL SÉNÉGAL -->
          @else if (state.type === 'contrat') {
            <div class="p-0 printable-contrat">
              <!-- En-tête officiel Contrat -->
              <div class="p-4 text-white" style="background: linear-gradient(135deg, #072559 0%, #1e3a8a 100%);">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <span class="badge bg-warning text-dark fw-bold px-2 py-1 mb-2">
                      <i class="bi bi-file-earmark-text-fill me-1"></i> CONTRAT DE BAIL D'HABITATION
                    </span>
                    <h5 class="fw-bold mb-1 text-white">RÉPUBLIQUE DU SÉNÉGAL</h5>
                    <p class="small text-white-50 mb-0">Conforme à la Loi n° 81-52 portant Code des Obligations Civiles et Commerciales (COCC)</p>
                  </div>
                  <div class="text-end">
                    <span class="badge bg-success px-3 py-2">SIGNÉ ÉLECTRONIQUEMENT ✓</span>
                    <div class="small text-white-50 mt-1">Réf: {{ state.reservation?.contrat?.numero || 'LP-2026-SN-' + (state.reservation?.id || '25') }}</div>
                  </div>
                </div>
              </div>

              <!-- Corps du contrat -->
              <div class="p-4" style="max-height: 60vh; overflow-y: auto;">
                <div class="alert alert-light border small text-muted mb-3">
                  <strong>Préambule :</strong> Le présent bail est consenti et accepté sous les conditions ordinaires et de droit en vigueur en République du Sénégal, notamment les dispositions d'ordre public régissant les loyers et les dépôts de garantie.
                </div>

                <div class="mb-3">
                  <h6 class="fw-bold text-dark border-bottom pb-1 small text-uppercase">1. Désignation des Parties</h6>
                  <p class="small mb-1"><strong>Bailleur / Gestionnaire :</strong> {{ state.reservation?.logement?.admin?.name || 'Gestionnaire Agréé' }} ({{ state.reservation?.logement?.admin?.raison_sociale || 'Agence Partenaire LogementPlus' }})</p>
                  <p class="small mb-1">
                    <strong>Preneur / Locataire :</strong> {{ locataireName }}
                    <span class="text-muted ms-1">({{ locataireEmail }} • {{ locataireTelephone }})</span>
                  </p>
                </div>

                <div class="mb-3">
                  <h6 class="fw-bold text-dark border-bottom pb-1 small text-uppercase">2. Désignation du Logement</h6>
                  <p class="small mb-1"><strong>Titre :</strong> {{ state.reservation?.logement?.titre || 'Logement Réservé' }}</p>
                  <p class="small mb-1"><strong>Adresse :</strong> {{ state.reservation?.logement?.adresse || 'Dakar' }}, {{ state.reservation?.logement?.quartier || '' }} ({{ state.reservation?.logement?.ville || 'Sénégal' }})</p>
                  <p class="small mb-1"><strong>Type :</strong> {{ state.reservation?.logement?.type || 'Appartement' }} • Meublé : {{ state.reservation?.logement?.meuble ? 'Oui' : 'Non' }}</p>
                </div>

                <div class="mb-3">
                  <h6 class="fw-bold text-dark border-bottom pb-1 small text-uppercase">3. Conditions Financières & Caution Réglementée</h6>
                  <p class="small mb-1"><strong>Loyer mensuel :</strong> {{ (state.reservation?.montant_loyer || 0).toLocaleString('fr-FR') }} FCFA</p>
                  <p class="small mb-1"><strong>Dépôt de garantie (Caution) :</strong> {{ (state.reservation?.montant_caution || 0).toLocaleString('fr-FR') }} FCFA (Strictement plafonné à 2 mois maximum conforme COCC).</p>
                  <p class="small mb-1"><strong>Séquestre :</strong> Fonds sécurisés par LogementPlus jusqu'à constat d'entrée des lieux contradictoire.</p>
                </div>

                <div class="mb-3">
                  <h6 class="fw-bold text-dark border-bottom pb-1 small text-uppercase">4. Durée & Prise d'Effet</h6>
                  <p class="small mb-0">Du <strong>{{ state.reservation?.date_debut | date: 'dd/MM/yyyy' }}</strong> au <strong>{{ state.reservation?.date_fin | date: 'dd/MM/yyyy'}}</strong> (Renouvelable selon accord des parties).</p>
                </div>

                <div class="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <div class="small fw-bold text-success"><i class="bi bi-shield-lock-fill me-1"></i> Signature Électronique Horodatée</div>
                    <div class="small text-muted" style="font-size: 11px;">Authentification certifiée par plateforme LogementPlus Sénégal</div>
                  </div>
                  <span class="badge bg-success">VALIDE & ENREGISTRÉ</span>
                </div>
              </div>

              <!-- Pied du contrat -->
              <div class="p-3 bg-light border-top d-flex justify-content-between align-items-center">
                <button type="button" class="btn btn-outline-secondary rounded-2 px-4" (click)="close()">
                  Fermer
                </button>
                <button type="button" class="btn btn-primary rounded-2 px-4 fw-bold shadow-sm" (click)="imprimer()">
                  <i class="bi bi-printer me-1"></i> Imprimer le Contrat
                </button>
              </div>
            </div>
          }

          <!-- 3. MODALE GÉNÉRIQUE STYLISÉE (CONFIRMATION, ALERTE, SUCCÈS, INFO) -->
          @else {
            <div class="p-4">
              <!-- En-tête avec Icône de Type -->
              <div class="d-flex align-items-start gap-3 mb-3">
                <div class="modal-icon-badge flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle text-dark"
                     [ngClass]="{
                       'bg-success bg-opacity-10 text-success': state.type === 'success',
                       'bg-warning bg-opacity-10 text-warning': state.type === 'warning',
                       'bg-danger bg-opacity-10 text-danger': state.type === 'error',
                       'bg-primary bg-opacity-10 text-primary': state.type === 'info'
                     }">
                  @if (state.type === 'success') {
                    <i class="bi bi-check-circle-fill fs-2"></i>
                  } @else if (state.type === 'warning') {
                    <i class="bi bi-exclamation-triangle-fill fs-2"></i>
                  } @else if (state.type === 'error') {
                    <i class="bi bi-x-circle-fill fs-2"></i>
                  } @else {
                    <i class="bi bi-info-circle-fill fs-2"></i>
                  }
                </div>

                <div class="flex-grow-1">
                  <h5 class="fw-bold mb-1 text-dark">{{ state.title }}</h5>
                  <span class="badge rounded-2 small"
                        [ngClass]="{
                          'bg-success text-white': state.type === 'success',
                          'bg-warning text-dark': state.type === 'warning',
                          'bg-danger text-white': state.type === 'error',
                          'bg-primary text-white': state.type === 'info'
                        }">
                    {{ state.type === 'success' ? 'Succès' : state.type === 'warning' ? 'Attention' : state.type === 'error' ? 'Erreur' : 'Information' }}
                  </span>
                </div>

                <button type="button" class="btn-close shadow-none" (click)="close()"></button>
              </div>

              <!-- Message Principal formaté -->
              <div class="modal-message-body py-2">
                @for (paragraph of messageParagraphs; track $index) {
                  @if (paragraph.trim().length > 0) {
                    <p class="text-muted mb-2" style="font-size: 15px; line-height: 1.6;">
                      {{ paragraph }}
                    </p>
                  }
                }
              </div>

              <!-- Boutons d'action -->
              <div class="d-flex justify-content-end gap-2 pt-3 mt-2 border-top">
                @if (state.isConfirm) {
                  <button type="button" class="btn btn-light rounded-2 px-4 fw-semibold text-muted border" (click)="cancel()">
                    {{ state.cancelText || 'Annuler' }}
                  </button>
                  <button type="button" class="btn btn-primary rounded-2 px-4 fw-bold shadow-sm" (click)="confirm()">
                    {{ state.confirmText || 'Confirmer' }}
                  </button>
                } @else {
                  <button type="button" class="btn rounded-2 px-4 fw-bold shadow-sm"
                          [ngClass]="{
                            'btn-success': state.type === 'success',
                            'btn-warning text-dark': state.type === 'warning',
                            'btn-danger': state.type === 'error',
                            'btn-primary': state.type === 'info'
                          }"
                          (click)="confirm()">
                    {{ state.confirmText || 'Compris' }}
                  </button>
                }
              </div>
            </div>
          }

        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop-custom {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: rgba(7, 37, 89, 0.75) !important;
      backdrop-filter: blur(8px) !important;
      -webkit-backdrop-filter: blur(8px) !important;
      z-index: 100050 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      overflow-y: auto !important;
      padding: 1rem !important;
      animation: backdropFadeIn 0.2s ease-out;
    }

    .modal-card-custom {
      position: relative !important;
      z-index: 100060 !important;
      width: 100%;
      max-width: 500px;
      margin: auto;
      background: #ffffff !important;
      border-radius: 16px !important;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4) !important;
      border: 1px solid rgba(255, 255, 255, 0.25) !important;
      overflow: hidden !important;
      animation: modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .modal-card-wide {
      max-width: 720px !important;
    }

    .modal-icon-badge {
      width: 52px;
      height: 52px;
    }

    @keyframes backdropFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes modalSlideUp {
      from { transform: translateY(24px) scale(0.95); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }

    @media print {
      .modal-backdrop-custom {
        position: static !important;
        background: transparent !important;
        backdrop-filter: none !important;
        padding: 0 !important;
      }
      .modal-card-custom {
        max-width: 100% !important;
        box-shadow: none !important;
        border: none !important;
      }
      .btn, .btn-close {
        display: none !important;
      }
    }
  `]
})
export class ModalAlertComponent implements OnInit, OnDestroy {
  public alertService = inject(ModalAlertService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private sub?: Subscription;

  public state: ModalAlertConfig = {
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'Compris',
    cancelText: 'Annuler',
    isConfirm: false,
    reservation: null
  };

  get locataire(): any {
    const rLoc = this.state.reservation?.locataire;
    if (rLoc && (rLoc.name || rLoc.nom || rLoc.email)) {
      return rLoc;
    }
    const current = this.authService.currentUser();
    if (current && (current.role === 'locataire' || !rLoc)) {
      return current;
    }
    return rLoc || null;
  }

  get locataireName(): string {
    const loc = this.locataire;
    if (loc?.name) return loc.name;
    const full = `${loc?.prenom || ''} ${loc?.nom || ''}`.trim();
    if (full) return full;
    return 'Locataire Agréé';
  }

  get locataireEmail(): string {
    return this.locataire?.email || 'locataire@logementplus.sn';
  }

  get locataireTelephone(): string {
    return this.locataire?.telephone || '+221 77 000 00 00';
  }

  ngOnInit(): void {
    this.sub = this.alertService.state$.subscribe(state => {
      this.state = state;
      console.log(this.state)
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get messageParagraphs(): string[] {
    if (!this.state?.message) return [];
    return this.state.message.split('\n');
  }

  onBackdropClick(event: MouseEvent): void {
    if (!this.state?.isConfirm) {
      this.close();
    }
  }

  confirm(): void {
    this.alertService.confirmAction();
    this.cdr.detectChanges();
  }

  cancel(): void {
    this.alertService.cancelAction();
    this.cdr.detectChanges();
  }

  close(): void {
    this.alertService.close();
    this.cdr.detectChanges();
  }

  imprimer(): void {
    window.print();
  }
}
