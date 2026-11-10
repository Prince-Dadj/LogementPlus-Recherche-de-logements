import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LogementService } from '../../services/logement.service';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import { ModalAlertService } from '../../services/modal-alert.service';
import { Logement, Reservation, ReservationCalculation } from '../../models/models';

@Component({
  selector: 'app-reservation-flow',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container py-4">
      <!-- En-tête et Stepper 4 étapes (CDC 8.6) -->
      <div class="row mb-4">
        <div class="col-lg-8 mx-auto text-center">
          <h1 class="h3 fw-bold mb-2">Finaliser votre réservation</h1>
          <p class="text-muted small">Parcours sécurisé et dématérialisé en 4 étapes simples</p>

          <!-- Stepper horizontal -->
          <div class="d-flex align-items-center justify-content-between position-relative my-4 px-2">
            <div class="position-absolute start-0 end-0 top-50 translate-middle-y bg-light" style="height: 4px; z-index: 1;">
              <div class="bg-primary h-100 transition-all" [style.width]="stepperProgress + '%'"></div>
            </div>

            <!-- Étape 1 -->
            <div class="position-relative d-flex flex-column align-items-center" style="z-index: 2;">
              <div 
                class="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
                [ngClass]="currentStep >= 1 ? 'bg-primary text-white' : 'bg-white text-muted border'"
                style="width: 40px; height: 40px;">
                @if (currentStep > 1) { <i class="bi bi-check-lg"></i> } @else { 1 }
              </div>
              <span class="small fw-semibold mt-1" [class.text-primary]="currentStep === 1">Dates</span>
            </div>

            <!-- Étape 2 -->
            <div class="position-relative d-flex flex-column align-items-center" style="z-index: 2;">
              <div 
                class="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
                [ngClass]="currentStep >= 2 ? 'bg-primary text-white' : 'bg-white text-muted border'"
                style="width: 40px; height: 40px;">
                @if (currentStep === 25) { <i class="bi bi-hourglass-split"></i> }
                @else if (currentStep > 2) { <i class="bi bi-check-lg"></i> }
                @else { 2 }
              </div>
              <span class="small fw-semibold mt-1" [class.text-primary]="currentStep === 2 || currentStep === 25">
                {{ currentStep === 25 ? 'Validation' : 'Récapitulatif' }}
              </span>
            </div>

            <!-- Étape 3 -->
            <div class="position-relative d-flex flex-column align-items-center" style="z-index: 2;">
              <div 
                class="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
                [ngClass]="(currentStep === 3 || currentStep === 4) ? 'bg-primary text-white' : 'bg-white text-muted border'"
                style="width: 40px; height: 40px;">
                @if (currentStep === 4) { <i class="bi bi-check-lg"></i> } @else { 3 }
              </div>
              <span class="small fw-semibold mt-1" [class.text-primary]="currentStep === 3">Paiement</span>
            </div>

            <!-- Étape 4 -->
            <div class="position-relative d-flex flex-column align-items-center" style="z-index: 2;">
              <div 
                class="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
                [ngClass]="currentStep === 4 ? 'bg-success text-white' : 'bg-white text-muted border'"
                style="width: 40px; height: 40px;">
                @if (currentStep === 4) { <i class="bi bi-check-lg"></i> } @else { 4 }
              </div>
              <span class="small fw-semibold mt-1" [class.text-success]="currentStep === 4">Confirmation</span>
            </div>
          </div>
        </div>
      </div>

      @if (logement) {
        <div class="row g-4">
          <!-- Formulaire étape par étape -->
          <div class="col-lg-7">
            <div class="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <!-- ==============================================
                   ÉTAPE 1 : CHOIX DES DATES (CDC 8.6)
                   ============================================== -->
              @if (currentStep === 1) {
                <div>
                  <h2 class="h5 fw-bold mb-3 text-dark">
                    <span class="badge bg-primary text-white rounded-2 me-2">Étape 1</span>
                    Choix des dates de séjour
                  </h2>
                  <p class="text-muted small">Indiquez la période souhaitée pour le calcul automatique du loyer et de la caution.</p>

                  <div class="row g-3 mb-4">
                    <div class="col-md-6">
                      <label class="form-label">Date d'arrivée / entrée dans les lieux</label>
                      <input type="date" class="form-control" [(ngModel)]="dateDebut" (change)="onDateChange()">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Date de départ / fin de séjour</label>
                      <input type="date" class="form-control" [(ngModel)]="dateFin" (change)="onDateChange()">
                    </div>
                  </div>

                  @if (calcul) {
                    <div class="p-3 bg-light rounded-3 mb-4">
                      <h3 class="h6 fw-bold text-dark mb-2"><i class="bi bi-calculator me-1 text-primary"></i> Estimation calculée</h3>
                      <div class="d-flex justify-content-between small text-muted mb-1">
                        <span>Durée sélectionnée</span>
                        <strong class="text-dark">{{ calcul.nb_jours }} jours ({{ calcul.nb_mois }} mois)</strong>
                      </div>
                      <div class="d-flex justify-content-between small text-muted mb-1">
                        <span>Loyer mensuel de base</span>
                        <span class="text-dark">{{ logement.prix_par_mois | number }} FCFA / mois</span>
                      </div>
                      <div class="d-flex justify-content-between small text-muted mb-1">
                        <span>Loyer pour la période</span>
                        <strong class="text-dark">{{ calcul.montant_loyer | number }} FCFA</strong>
                      </div>
                    </div>
                  }

                  <div class="d-flex justify-content-end">
                    <button class="btn btn-primary px-4 py-2" (click)="goToStep(2)" [disabled]="!calcul">
                      Continuer vers le récapitulatif <i class="bi bi-arrow-right ms-1"></i>
                    </button>
                  </div>
                </div>
              }

              <!-- ==============================================
                   ÉTAPE 2 : RÉCAPITULATIF (CDC 8.6)
                   ============================================== -->
              @if (currentStep === 2) {
                <div>
                  <h2 class="h5 fw-bold mb-3 text-dark">
                    <span class="badge bg-primary text-white rounded-2 me-2">Étape 2</span>
                    Récapitulatif des montants & conditions
                  </h2>

                  <!-- Détail des coûts (CDC RF-20) -->
                  <div class="table-responsive mb-4">
                    <table class="table table-bordered align-middle">
                      <thead class="table-light">
                        <tr>
                          <th>Poste</th>
                          <th>Détail</th>
                          <th class="text-end">Montant (FCFA)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>Loyer hébergement</strong></td>
                          <td class="text-muted small">Période du {{ dateDebut }} au {{ dateFin }}</td>
                          <td class="text-end tabular-numbers fw-bold">{{ calcul?.montant_loyer | number }}</td>
                        </tr>
                        <tr>
                          <td><strong>Caution de garantie</strong></td>
                          <td class="text-muted small">Remboursable à la sortie selon état des lieux</td>
                          <td class="text-end tabular-numbers">{{ calcul?.montant_caution | number }}</td>
                        </tr>
                        <tr>
                          <td><strong>Frais de service plateforme</strong></td>
                          <td class="text-muted small">Gestion dossier, contrat dématérialisé et assistance</td>
                          <td class="text-end tabular-numbers">{{ calcul?.montant_frais_service | number }}</td>
                        </tr>
                        <tr class="table-primary fw-bold">
                          <td colspan="2">TOTAL À PAYER POUR VALIDER</td>
                          <td class="text-end tabular-numbers fs-5 text-primary">{{ calcul?.montant_total | number }} FCFA</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Conditions -->
                  <div class="p-3 bg-light rounded-3 mb-4">
                    <h3 class="h6 fw-bold mb-1"><i class="bi bi-shield-check text-success me-1"></i> Conditions de la réservation</h3>
                    <ul class="small text-muted mb-0 ps-3">
                      <li>Mode : <strong>{{ logement.mode_reservation === 'immediate' ? 'Validation immédiate dès paiement' : 'Validation par le propriétaire sous 24h' }}</strong></li>
                      <li>Politique d'annulation : <strong>{{ logement.politique_annulation }}</strong></li>
                      <li>Aucune coordonnée bancaire n'est conservée sur nos serveurs (Tokenisation PCI-DSS).</li>
                    </ul>
                  </div>

                  <div class="d-flex justify-content-between">
                    <button class="btn btn-outline-secondary px-3 me-4" (click)="goToStep(1)">
                      <i class="bi bi-arrow-left me-1"></i> Retour
                    </button>
                    <button class="btn btn-primary px-4" (click)="creerEtPasserPaiement()" [disabled]="isLoading">
                      @if (isLoading) {
                        <span class="spinner-border spinner-border-sm me-1"></span>
                        Envoi en cours...
                      } @else {
                        <i class="bi bi-send me-1"></i> Demande de réservation
                      }
                    </button>
                  </div>
                </div>
              }

              <!-- ==============================================
                   ÉTAPE 2.5 : EN ATTENTE DE VALIDATION
                   ============================================== -->
              @if (currentStep === 25) {
                <div class="text-center py-4">
                  <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning bg-opacity-10 mb-4" style="width: 90px; height: 90px;">
                    <i class="bi bi-hourglass-split display-5 text-warning"></i>
                  </div>
                  <h2 class="h4 fw-bold text-dark mb-2">Demande envoyée avec succès !</h2>
                  <p class="text-muted mb-1">Référence dossier : <strong class="text-dark">#DEM-{{ activeReservation?.id }}</strong></p>
                  <p class="text-muted small mb-4" style="max-width: 480px; margin: 0 auto;">
                    Le gestionnaire examine actuellement votre dossier locataire (pièce d'identité, score). 
                    Vous recevrez un message dans votre <strong>Boite mail</strong>, ainsi qu'une notification dans votre <strong>espace</strong> dès validation ou refus.
                  </p>

                  <div class="p-4 bg-light rounded-4 text-start mb-4" style="max-width: 480px; margin: 0 auto;">
                    <h3 class="h6 fw-bold mb-3 text-dark"><i class="bi bi-list-check me-2 text-primary"></i>Prochaines étapes</h3>
                    <div class="d-flex align-items-start gap-3 mb-2">
                      <span class="badge bg-warning text-dark rounded-circle flex-shrink-0" style="width:24px;height:24px;line-height:24px;padding:0;text-align:center;">1</span>
                      <span class="small text-muted">Le gestionnaire reçoit votre dossier et vérifie vos pièces justificatives</span>
                    </div>
                    <div class="d-flex align-items-start gap-3 mb-2">
                      <span class="badge bg-warning text-dark rounded-circle flex-shrink-0" style="width:24px;height:24px;line-height:24px;padding:0;text-align:center;">2</span>
                      <span class="small text-muted">Une réponse vous est envoyée dans votre messagerie (généralement sous 24h)</span>
                    </div>
                    <div class="d-flex align-items-start gap-3">
                      <span class="badge bg-warning text-dark rounded-circle flex-shrink-0" style="width:24px;height:24px;line-height:24px;padding:0;text-align:center;">3</span>
                      <span class="small text-muted">Si validée, un lien de paiement sécurisé vous sera transmis directement</span>
                    </div>
                  </div>

                  <div class="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                    <a routerLink="/locataire" [queryParams]="{tab: 'messagerie'}" class="btn btn-primary px-4 py-2 rounded-2">
                      <i class="bi bi-chat-dots me-2"></i>Consulter ma Messagerie
                      @if (nbNonLusMessages > 0) {
                        <span class="badge bg-white text-primary ms-1 rounded-2 small">{{ nbNonLusMessages }}</span>
                      }
                    </a>
                    <a routerLink="/locataire" class="btn btn-outline-secondary px-4 py-2 rounded-2">
                      <i class="bi bi-house me-1"></i> Mon espace locataire
                    </a>
                  </div>
                </div>
              }

              <!-- ==============================================
                   ÉTAPE 3 : PAIEMENT SÉCURISÉ (CDC 8.6 & RF-30..36)
                   ============================================== -->
              @if (currentStep === 3) {
                <div>
                  <h2 class="h5 fw-bold mb-3 text-dark">
                    <span class="badge bg-primary text-white rounded-2 me-2">Étape 3</span>
                    Paiement en ligne sécurisé
                  </h2>
                  <p class="text-muted small">Sélectionnez votre moyen de paiement privilégié (Carte Bancaire ou Mobile Money).</p>

                  @if (activeReservation?.statut === 'confirmee') {
                    <div class="alert alert-success d-flex align-items-center gap-2 py-2 px-3 rounded-3 mb-4">
                      <i class="bi bi-patch-check-fill fs-5 text-success"></i>
                      <div class="small">
                        <strong>Dossier validé par le gestionnaire !</strong> Vous pouvez finaliser le paiement sécurisé Phase 2 (Séquestre 24h activé).
                      </div>
                    </div>
                  } @else {
                    <div class="alert alert-warning d-flex align-items-center gap-2 py-2 px-3 rounded-3 mb-4">
                      <i class="bi bi-hourglass-split fs-5 text-warning"></i>
                      <div class="small">
                        <strong>En attente d'approbation :</strong> Le paiement ne sera effectif qu'une fois votre réservation validée par le gestionnaire.
                      </div>
                    </div>
                  }

                  <!-- Sélection du moyen de paiement (CDC RF-30) -->
                  <div class="row g-2 mb-4">
                    <div class="col-md-6">
                      <div 
                        class="p-3 border rounded-3 cursor-pointer text-center h-100"
                        [class.border-primary]="moyenPaiement === 'wave'"
                        [class.bg-light]="moyenPaiement === 'wave'"
                        (click)="moyenPaiement = 'wave'">
                        <div class="fs-3 fw-bold text-info mb-1"><i class="bi bi-phone"></i> Wave</div>
                        <span class="small fw-semibold text-dark">Mobile Money (0% frais)</span>
                      </div>
                    </div>

                    <div class="col-md-6">
                      <div 
                        class="p-3 border rounded-3 cursor-pointer text-center h-100"
                        [class.border-primary]="moyenPaiement === 'orange_money'"
                        [class.bg-light]="moyenPaiement === 'orange_money'"
                        (click)="moyenPaiement = 'orange_money'">
                        <div class="fs-3 fw-bold text-warning mb-1"><i class="bi bi-wallet2"></i> Orange Money</div>
                        <span class="small fw-semibold text-dark">Sénégal & UEMOA</span>
                      </div>
                    </div>

                    <div class="col-md-12">
                      <div 
                        class="p-3 border rounded-3 cursor-pointer d-flex align-items-center justify-content-between"
                        [class.border-primary]="moyenPaiement === 'carte'"
                        [class.bg-light]="moyenPaiement === 'carte'"
                        (click)="moyenPaiement = 'carte'">
                        <div class="d-flex align-items-center gap-3">
                          <i class="bi bi-credit-card-2-front fs-2 text-primary"></i>
                          <div>
                            <strong class="d-block text-dark">Carte Bancaire (Visa / Mastercard)</strong>
                            <small class="text-muted">Paiement 3D-Secure certifié PCI-DSS</small>
                          </div>
                        </div>
                        <i class="bi fs-4" [class.bi-check-circle-fill]="moyenPaiement === 'carte'" [class.text-primary]="moyenPaiement === 'carte'"></i>
                      </div>
                    </div>
                  </div>

                  <!-- Champs selon moyen -->
                  @if (moyenPaiement === 'wave' || moyenPaiement === 'orange_money') {
                    <div class="mb-4 p-3 bg-light rounded-3">
                      <label class="form-label small fw-semibold">Numéro de téléphone Mobile Money Sénégal</label>
                      <div class="input-group">
                        <span class="input-group-text bg-white">+221</span>
                        <input type="tel" class="form-control" placeholder="77 000 00 00" [(ngModel)]="telephonePaiement">
                      </div>
                      <small class="text-muted mt-1 d-block">Un message d'autorisation de débit vous sera envoyé instantanément sur ce numéro.</small>
                    </div>
                  } @else {
                    <div class="mb-4 p-3 bg-light rounded-3">
                      <div class="mb-2">
                        <label class="form-label small fw-semibold">Numéro de carte bancaire</label>
                        <input type="text" class="form-control" placeholder="4532 •••• •••• 8892" value="4532 8901 2345 6789">
                      </div>
                      <div class="row g-2">
                        <div class="col-6">
                          <label class="form-label small fw-semibold">Expiration</label>
                          <input type="text" class="form-control" placeholder="MM/AA" value="12/28">
                        </div>
                        <div class="col-6">
                          <label class="form-label small fw-semibold">CVC / CVV</label>
                          <input type="password" class="form-control" placeholder="•••" value="123">
                        </div>
                      </div>
                      <small class="text-muted mt-2 d-block"><i class="bi bi-shield-check text-success me-1"></i> Données tokenisées par le prestataire de paiement (CDC RF-35).</small>
                    </div>
                  }

                  <!-- Option acompte ou loyer complet (CDC RF-31) -->
                  <div class="mb-4">
                    <label class="form-label small fw-semibold">Modalité de règlement</label>
                    <div class="form-check p-2 border rounded-3 mb-2">
                      <input class="form-check-input ms-1" type="radio" name="typePaiement" id="optTotal" value="premier_loyer" [(ngModel)]="typePaiement">
                      <label class="form-check-label ms-2" for="optTotal">
                        <strong>Régler la totalité : {{ calcul?.montant_total | number }} FCFA</strong>
                        <span class="d-block small text-muted">Loyer + Caution + Frais de service</span>
                      </label>
                    </div>
                    <div class="form-check p-2 border rounded-3">
                      <input class="form-check-input ms-1" type="radio" name="typePaiement" id="optAcompte" value="acompte" [(ngModel)]="typePaiement">
                      <label class="form-check-label ms-2" for="optAcompte">
                        <strong>Régler un acompte de 30% : {{ ((calcul?.montant_loyer || 0) * 0.3) | number }} FCFA</strong>
                        <span class="d-block small text-muted">Le solde et la caution seront réglés à l'état des lieux d'entrée.</span>
                      </label>
                    </div>
                  </div>

                  <!-- Protection Séquestre 24h Style Professionnel -->
                  <div class="p-2 mb-3 rounded-3 bg-light border border-success border-opacity-25 d-flex align-items-center gap-2">
                    <i class="bi bi-shield-check fs-4 text-success flex-shrink-0"></i>
                    <div>
                      <strong class="d-block small text-dark">Garantie Séquestre 24h SanarHousings</strong>
                      <small class="text-muted" style="font-size: 11px;">Vos fonds sont sécurisés sous séquestre tiers certifié. Le bailleur n'est crédité que 24h après votre remise des clés et confirmation de conformité.</small>
                    </div>
                  </div>

                  <!-- ============================================================
                       LECTURE ET ACCEPTATION OBLIGATOIRE DU CONTRAT DE BAIL
                       ============================================================ -->
                  <div class="card rounded-3 p-3 mb-4 shadow-sm" [ngClass]="contratAccepte ? 'border-success bg-success bg-opacity-10' : 'border-danger bg-danger bg-opacity-10'">
                    <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                      <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-file-earmark-ruled-fill fs-4" [ngClass]="contratAccepte ? 'text-success' : 'text-danger'"></i>
                        <div>
                          <strong class="d-block text-dark small">Contrat de Bail à Usage d'Habitation (Loi Sénégalaise)</strong>
                          <small class="text-muted" style="font-size: 11px;">Réf : CTR-SN-2026-{{ activeReservation?.id || '01' }} • Caution légale plafonnée à 2 mois</small>
                        </div>
                      </div>
                      <button type="button" class="btn btn-sm rounded-2 px-3 fw-bold" [ngClass]="contratAccepte ? 'btn-outline-success' : 'btn-danger text-white'" (click)="showContratModal = true">
                        <i class="bi bi-eye-fill me-1"></i> Lire le contrat complet
                      </button>
                    </div>

                    <div class="p-2 rounded bg-white small mb-3 border" style="font-size: 11px; line-height: 1.5;">
                      <div class="row g-1">
                        <div class="col-sm-6"><strong>Bailleur :</strong> {{ logement.admin?.raison_sociale || logement.admin?.name || 'Gestionnaire Mandaté' }}</div>
                        <div class="col-sm-6"><strong>Locataire :</strong> {{ auth.currentUser()?.name || 'Locataire certifié' }}</div>
                        <div class="col-sm-6"><strong>Loyer mensuel :</strong> {{ (calcul?.montant_loyer || logement.prix_par_mois) | number }} FCFA</div>
                        <div class="col-sm-6"><strong>Caution consignée :</strong> {{ (calcul?.montant_caution || logement.caution) | number }} FCFA (Max 2 mois)</div>
                      </div>
                    </div>

                    <!-- Case à cocher obligatoire -->
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="chkContrat" [(ngModel)]="contratAccepte" name="chkContrat">
                      <label class="form-check-label small fw-bold text-dark cursor-pointer" for="chkContrat">
                        J'ai lu attentivement et j'accepte l'intégralité des clauses du contrat de bail à usage d'habitation conforme au droit sénégalais.
                      </label>
                    </div>

                    @if (!contratAccepte) {
                      <div class="small text-danger fw-semibold mt-2 d-flex align-items-center gap-1" style="font-size: 11.5px;">
                        <i class="bi bi-exclamation-triangle-fill"></i>
                        <span>Vous devez obligatoirement lire et cocher l'acceptation du contrat ci-dessus pour activer le paiement en ligne.</span>
                      </div>
                    } @else {
                      <div class="small text-success fw-semibold mt-2 d-flex align-items-center gap-1" style="font-size: 11.5px;">
                        <i class="bi bi-check-circle-fill"></i>
                        <span>Contrat de bail accepté avec succès. Vous pouvez maintenant procéder au règlement sécurisé.</span>
                      </div>
                    }
                  </div>

                  <div class="d-flex justify-content-between align-items-center">
                    <button class="btn btn-outline-secondary px-3" (click)="goToStep(2)">
                      <i class="bi bi-arrow-left me-1"></i> Retour
                    </button>
                    <!-- Bouton action forte Orange Chaud (CDC 8.2 & 8.5) -->
                    <button class="btn btn-accent px-4 py-2 fw-bold" 
                            (click)="procederAuPaiement()" 
                            [disabled]="isLoading || !contratAccepte || activeReservation?.statut !== 'confirmee'">
                      @if (isLoading) {
                        <span class="spinner-border spinner-border-sm me-1"></span>
                        Traitement sécurisé...
                      } @else {
                        <i class="bi bi-lock-fill me-1"></i> Payer maintenant
                      }
                    </button>
                  </div>
                </div>
              }

              <!-- ==============================================
                   ÉTAPE 4 : CONFIRMATION & DOCUMENTS (CDC 8.6 & RF-24/33)
                   ============================================== -->
              @if (currentStep === 4) {
                <div class="text-center py-3">
                  <div class="d-inline-flex align-items-center justify-content-center text-success rounded-circle bg-success bg-opacity-10 mb-3" style="width: 80px; height: 80px;">
                    <i class="bi bi-check-circle-fill display-5"></i>
                  </div>
                  <h2 class="h4 fw-bold text-dark mb-1">Réservation confirmée avec succès !</h2>
                  <p class="text-muted small mb-3">Référence dossier : <strong class="text-dark">#RES-{{ activeReservation?.id }}</strong></p>

                  <div class="p-3 bg-light rounded-3 text-start mb-4">
                    <div class="row g-2 small">
                      <div class="col-6 text-muted">Logement réservé :</div>
                      <div class="col-6 fw-bold text-end">{{ logement.titre }}</div>

                      <div class="col-6 text-muted">Période du séjour :</div>
                      <div class="col-6 fw-bold text-end">{{ dateDebut }} au {{ dateFin }}</div>

                      <div class="col-6 text-muted">Mode de réservation :</div>
                      <div class="col-6 text-end">
                        <span class="badge bg-success">{{ activeReservation?.statut | uppercase }}</span>
                      </div>

                      <div class="col-6 text-muted">Paiement effectué :</div>
                      <div class="col-6 fw-bold text-end text-primary">{{ lastPaymentResult?.paiement?.montant | number }} FCFA</div>

                      <div class="col-6 text-muted">Transaction ID :</div>
                      <div class="col-6 text-end font-monospace">{{ lastPaymentResult?.paiement?.reference_transaction }}</div>

                      <div class="col-6 text-muted">Protection Séquestre :</div>
                      <div class="col-6 text-end">
                        <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">Fonds sous séquestre 24h</span>
                      </div>
                    </div>
                  </div>

                  <!-- Téléchargement du contrat PDF et Reçu automatique (CDC RF-24 & RF-33) -->
                  <div class="d-flex flex-column flex-sm-row gap-2 justify-content-center mb-4">
                    <button class="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2" (click)="telechargerRecu()">
                      <i class="bi bi-receipt"></i>
                      <span>Télécharger le Reçu officiel</span>
                    </button>
                    <button class="btn btn-outline-success d-flex align-items-center justify-content-center gap-2" (click)="telechargerContrat()">
                      <i class="bi bi-file-earmark-pdf"></i>
                      <span>Contrat de bail numérique</span>
                    </button>
                  </div>

                  <a routerLink="/locataire" class="btn btn-primary px-4 py-2 rounded-2">
                    Accéder à mon espace locataire <i class="bi bi-arrow-right ms-1"></i>
                  </a>
                </div>
              }
            </div>
          </div>

          <!-- Colonne récapitulative fixe à droite -->
          <div class="col-lg-5">
            <div class="card border-0 shadow-sm rounded-4 p-3 bg-white sticky-top" style="top: 85px;">
              <div class="d-flex gap-3 mb-3">
                <img [src]="logement.image_principale" class="rounded-3 object-fit-cover" style="width: 100px; height: 80px;" alt="Logement">
                <div>
                  <span class="badge bg-light text-primary border small text-uppercase mb-1">{{ logement.type }}</span>
                  <h3 class="h6 fw-bold mb-1 line-clamp-2">{{ logement.titre }}</h3>
                  <small class="text-muted"><i class="bi bi-geo-alt"></i> {{ logement.quartier }}, {{ logement.ville }}</small>
                </div>
              </div>

              <div class="border-top pt-3">
                <h4 class="h6 fw-bold mb-2">Garanties incluses</h4>
                <ul class="list-unstyled small text-muted mb-0">
                  <li class="mb-1"><i class="bi bi-check2 text-success me-2"></i>Logement audité et vérifié physiquement</li>
                  <li class="mb-1"><i class="bi bi-check2 text-success me-2"></i>Contrat conforme à la réglementation en vigueur</li>
                  <li class="mb-1"><i class="bi bi-check2 text-success me-2"></i>Reçu automatique horodaté envoyé par email</li>
                  <li><i class="bi bi-check2 text-success me-2"></i>Support assistance et médiation 7j/7</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- ============================================================
           MODALE 1 : ALERTE "DEMANDE EN ATTENTE DE VALIDATION GESTIONNAIRE"
           ============================================================ -->
      @if (showDemandeEnvoyeeModal) {
        <div class="modal d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); z-index: 1060;" (click)="fermerDemandeModal()">
          <div class="modal-dialog modal-dialog-centered" (click)="$event.stopPropagation()">
            <div class="modal-content rounded-4 border-0 shadow-lg p-3 p-md-4">
              <div class="text-center py-2">
                <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning bg-opacity-15 mb-3" style="width: 76px; height: 76px;">
                  <i class="bi bi-hourglass-split display-5 text-warning"></i>
                </div>
                <h3 class="h4 fw-bold text-dark mb-1">Demande en attente de validation</h3>
                <span class="badge bg-warning bg-opacity-20 text-dark border border-warning border-opacity-50 px-3 py-1 rounded-2 small mb-3">
                  Transmise au gestionnaire avec succès
                </span>
                
                <p class="text-muted small mb-4" style="line-height: 1.55;">
                  Votre demande de réservation pour le logement <strong>« {{ logement?.titre }} »</strong> a été transmise à 
                  <strong>{{ logement?.admin?.raison_sociale || logement?.admin?.name || 'Ibrahima Sow (Gestionnaire)' }}</strong>.
                  <br><br>
                  Le bailleur examine actuellement vos justificatifs (pièce d'identité et revenus certifiés). 
                  <strong>Dès que le gestionnaire valide votre demande</strong>, vous recevrez une notification par message dans votre compte avec le lien direct vers le paiement sécurisé Phase 2.
                </p>

                <div class="p-3 bg-light rounded-3 text-start mb-4 border">
                  <div class="d-flex justify-content-between small text-muted mb-1">
                    <span>Référence dossier :</span>
                    <strong class="text-dark">#DEM-{{ activeReservation?.id }}</strong>
                  </div>
                  <div class="d-flex justify-content-between small text-muted mb-1">
                    <span>Période souhaitée :</span>
                    <span class="text-dark">{{ dateDebut }} au {{ dateFin }}</span>
                  </div>
                  <div class="d-flex justify-content-between small text-muted">
                    <span>Protection financière :</span>
                    <span class="text-success fw-bold"><i class="bi bi-shield-check me-1"></i>Séquestre 24h activé</span>
                  </div>
                </div>

                <div class="d-grid gap-2">
                  <a routerLink="/locataire" [queryParams]="{ tab: 'reservations' }" class="btn btn-primary rounded-2 py-2 fw-semibold">
                    <i class="bi bi-folder-check me-2"></i>Consulter mes réservations
                  </a>
                  <a routerLink="/locataire" [queryParams]="{ tab: 'messagerie' }" class="btn btn-outline-primary rounded-2 py-2">
                    <i class="bi bi-chat-dots me-2"></i>Accéder à ma messagerie
                  </a>
                  <button type="button" class="btn btn-link text-muted btn-sm" (click)="fermerDemandeModal()">
                    Rester sur cette page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- ============================================================
           MODALE 2 : LECTURE DU CONTRAT DE BAIL AVANT PAIEMENT
           ============================================================ -->
      @if (showContratModal) {
        <div class="modal d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); z-index: 1060;" (click)="showContratModal = false">
          <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" (click)="$event.stopPropagation()">
            <div class="modal-content rounded-4 border-0 shadow-lg">
              <div class="modal-header border-bottom px-4 pt-3 pb-3 bg-light">
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-file-earmark-text-fill text-primary fs-4"></i>
                  <div>
                    <h5 class="fw-bold mb-0 text-dark">Contrat de Bail à Usage d'Habitation</h5>
                    <small class="text-muted">République du Sénégal • Décret et Loi n° 81-52 portant Code des Obligations Civiles et Commerciales</small>
                  </div>
                </div>
                <button type="button" class="btn-close" (click)="showContratModal = false"></button>
              </div>

              <div class="modal-body p-4 bg-white" style="font-size: 13px; line-height: 1.6;">
                <div class="text-center mb-4 pb-3 border-bottom">
                  <h6 class="fw-bold text-uppercase text-primary mb-1">RÉPUBLIQUE DU SÉNÉGAL</h6>
                  <p class="small text-muted mb-0">Un Peuple - Un But - Une Foi</p>
                  <strong class="d-block mt-2">CONTRAT DE BAIL À USAGE D'HABITATION SOUS PROTECTION SÉQUESTRE 24H</strong>
                  <small class="text-muted">Référence officielle : CTR-SN-2026-{{ activeReservation?.id || '01' }}</small>
                </div>

                <h6 class="fw-bold text-dark border-bottom pb-1">ARTICLE 1 : DÉSIGNATION DES PARTIES</h6>
                <p>
                  <strong>LE BAILLEUR (ou son représentant agréé) :</strong><br>
                  {{ logement?.admin?.raison_sociale || logement?.admin?.name || 'Gestionnaire Mandataire Partenaire SanarHousings' }}<br>
                  Dakar, Sénégal • Téléphone : +221 77 080 91 10 • Immatriculation RCCM SN.DKR
                </p>
                <p>
                  <strong>LE PRENEUR (Le Locataire) :</strong><br>
                  {{ auth.currentUser()?.name || 'Locataire certifié' }}<br>
                  Email : {{ auth.currentUser()?.email }} • Téléphone : {{ auth.currentUser()?.telephone || '+221 77 123 45 67' }}<br>
                  Dossier locataire certifié conforme SanarHousings (Pièce d'identité et justificatifs de revenus validés).
                </p>

                <h6 class="fw-bold text-dark border-bottom pb-1 mt-3">ARTICLE 2 : DÉSIGNATION DES LIEUX LOUÉS</h6>
                <p>
                  Le bailleur donne en location au preneur, qui accepte, le bien immobilier suivant :<br>
                  • <strong>Désignation :</strong> {{ logement?.titre }}<br>
                  • <strong>Localisation :</strong> {{ logement?.adresse }}, {{ logement?.quartier }}, {{ logement?.ville }} (Sénégal)<br>
                  • <strong>Caractéristiques :</strong> {{ logement?.type | uppercase }} de {{ logement?.surface }} m², comprenant {{ logement?.nb_pieces }} pièce(s), {{ logement?.meuble ? 'entièrement meublé et équipé' : 'non meublé' }}.
                </p>

                <h6 class="fw-bold text-dark border-bottom pb-1 mt-3">ARTICLE 3 : DURÉE DU BAIL</h6>
                <p>
                  Le présent bail prend effet le <strong>{{ dateDebut }}</strong> et expire le <strong>{{ dateFin }}</strong> (durée ferme convenue : {{ calcul?.nb_jours || 30 }} jours).
                </p>

                <h6 class="fw-bold text-dark border-bottom pb-1 mt-3">ARTICLE 4 : CONDITIONS FINANCIÈRES & SÉQUESTRE 24H</h6>
                <p>
                  • <strong>Loyer :</strong> Le loyer mensuel est fixé à <strong>{{ (calcul?.montant_loyer || logement?.prix_par_mois) | number }} FCFA</strong>.<br>
                  • <strong>Dépôt de garantie (Caution) :</strong> Fixé à <strong>{{ (calcul?.montant_caution || logement?.caution) | number }} FCFA</strong>. Conformément à la législation sénégalaise en vigueur, la caution ne peut excéder deux (2) mois de loyer.<br>
                  • <strong>Garantie Séquestre SanarHousings :</strong> L'intégralité des sommes versées est consignée sous séquestre tiers agréé. Le bailleur n'est crédité que 24 heures après l'entrée dans les lieux et la confirmation contradictoire de la conformité du logement.
                </p>

                <h6 class="fw-bold text-dark border-bottom pb-1 mt-3">ARTICLE 5 : ÉTAT DES LIEUX & OBLIGATIONS</h6>
                <p>
                  Un état des lieux d'entrée contradictoire et un inventaire détaillé des équipements seront établis lors de la remise des clés. Le locataire s'engage à jouir des lieux paisiblement et à maintenir le bien en bon état d'entretien locatif.
                </p>

                <h6 class="fw-bold text-dark border-bottom pb-1 mt-3">ARTICLE 6 : RÉSILIATION ET CONTENTIEUX</h6>
                <p class="mb-0">
                  En cas de litige, les parties conviennent de recourir en priorité au service de conciliation SanarHousings Sénégal. À défaut d'accord amiable, compétence expresse est attribuée au Tribunal de Grande Instance compétent de Dakar ou Mbour.
                </p>
              </div>

              <div class="modal-footer border-top bg-light px-4 py-3 d-flex justify-content-between align-items-center">
                <button type="button" class="btn btn-outline-secondary btn-sm rounded-2 px-3" (click)="showContratModal = false">
                  Fermer
                </button>
                <div class="d-flex gap-2">
                  <button type="button" class="btn btn-outline-primary btn-sm rounded-2 px-3" (click)="imprimerContrat()">
                    <i class="bi bi-printer me-1"></i> Imprimer le bail
                  </button>
                  <button type="button" class="btn btn-success btn-sm rounded-2 px-4 fw-bold" (click)="accepterContratDepuisModal()">
                    <i class="bi bi-check2-circle me-1"></i> J'accepte les conditions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- ============================================================
           MODALE 3 : REÇU OFFICIEL DE PAIEMENT (IMPRIMABLE)
           ============================================================ -->
      @if (showRecuModal) {
        <div class="modal d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); z-index: 1060;" (click)="showRecuModal = false">
          <div class="modal-dialog modal-lg modal-dialog-centered" (click)="$event.stopPropagation()">
            <div class="modal-content rounded-4 border-0 shadow-lg">
              <div class="modal-header border-bottom px-4 py-3 bg-light d-flex justify-content-between align-items-center">
                <h5 class="fw-bold mb-0 text-dark"><i class="bi bi-receipt text-primary me-2"></i>Reçu Officiel de Paiement</h5>
                <button type="button" class="btn-close" (click)="showRecuModal = false"></button>
              </div>
              <div class="modal-body p-4 bg-white" id="printableRecu">
                <div class="border rounded-4 p-4">
                  <!-- En-tête officiel -->
                  <div class="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
                    <div>
                      <h4 class="fw-bold text-primary mb-1">SANARHOUSINGS SÉNÉGAL</h4>
                      <small class="text-muted d-block">Plateforme Immobilière Certifiée • Dakar, Sénégal</small>
                      <small class="text-muted">Agrément Séquestre Tiers n° SN-CDP-2026/04</small>
                    </div>
                    <div class="text-end">
                      <span class="badge bg-success text-white px-3 py-2 fs-6 rounded-2">PAIEMENT CONFIRMÉ</span>
                      <small class="d-block text-muted mt-1 font-monospace">Réf : {{ lastPaymentResult?.paiement?.reference_transaction || 'REC-SN-2026-89421' }}</small>
                    </div>
                  </div>

                  <!-- Infos client & bien -->
                  <div class="row g-3 small mb-4">
                    <div class="col-sm-6">
                      <span class="text-muted">Émis au bénéfice de :</span><br>
                      <strong>{{ auth.currentUser()?.name || 'Locataire certifié' }}</strong><br>
                      <span>{{ auth.currentUser()?.email }}</span> • <span>{{ telephonePaiement ? '+221 ' + telephonePaiement : '+221 77 123 45 67' }}</span>
                    </div>
                    <div class="col-sm-6 text-sm-end">
                      <span class="text-muted">Logement concerné :</span><br>
                      <strong>{{ logement?.titre }}</strong><br>
                      <span>{{ logement?.quartier }}, {{ logement?.ville }}</span>
                    </div>
                  </div>

                  <!-- Tableau montants -->
                  <div class="table-responsive mb-3">
                    <table class="table table-bordered align-middle small">
                      <thead class="table-light">
                        <tr>
                          <th>Désignation</th>
                          <th>Moyen de règlement</th>
                          <th class="text-end">Montant (FCFA)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Loyer hébergement (Période du {{ dateDebut }} au {{ dateFin }})</td>
                          <td>{{ moyenPaiement | uppercase }} Sénégal</td>
                          <td class="text-end tabular-numbers fw-bold">{{ (calcul?.montant_loyer || logement?.prix_par_mois) | number }} FCFA</td>
                        </tr>
                        <tr>
                          <td>Dépôt de garantie sous séquestre 24h (Plafond légal 2 mois max)</td>
                          <td>Consignation Séquestre</td>
                          <td class="text-end tabular-numbers">{{ (calcul?.montant_caution || logement?.caution) | number }} FCFA</td>
                        </tr>
                        <tr>
                          <td>Frais de sécurisation & Contrat numérique SanarHousings</td>
                          <td>Plateforme</td>
                          <td class="text-end tabular-numbers">{{ (calcul?.montant_frais_service || logement?.frais_service) | number }} FCFA</td>
                        </tr>
                        <tr class="table-primary fw-bold fs-6">
                          <td colspan="2">TOTAL RÉGLÉ (SÉQUESTRE SÉCURISÉ)</td>
                          <td class="text-end tabular-numbers text-primary">{{ (calcul?.montant_total || lastPaymentResult?.paiement?.montant) | number }} FCFA</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div class="p-3 bg-light rounded-3 text-center small text-muted">
                    <i class="bi bi-shield-check text-success fs-5 me-1"></i>
                    Fonds consignés sous séquestre tiers certifié. Déblocage au bailleur 24h après remise contradictoire des clés.
                  </div>
                </div>
              </div>
              <div class="modal-footer border-top bg-light px-4 py-3 gap-2">
                <button type="button" class="btn btn-outline-secondary rounded-2 px-3" (click)="showRecuModal = false">Fermer</button>
                <button type="button" class="btn btn-primary rounded-2 px-4 fw-bold" (click)="imprimerRecu()">
                  <i class="bi bi-printer me-1"></i> Imprimer ce Reçu Officiel
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- ============================================================
           MODALE 4 : CONTRAT DE BAIL FINALISÉ (IMPRIMABLE APRÈS PAIEMENT)
           ============================================================ -->
      @if (showContratFinalModal) {
        <div class="modal d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); z-index: 1060;" (click)="showContratFinalModal = false">
          <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" (click)="$event.stopPropagation()">
            <div class="modal-content rounded-4 border-0 shadow-lg">
              <div class="modal-header border-bottom px-4 py-3 bg-light d-flex justify-content-between align-items-center">
                <h5 class="fw-bold mb-0 text-dark"><i class="bi bi-file-earmark-check-fill text-success me-2"></i>Contrat de Bail Signé Électroniquement</h5>
                <button type="button" class="btn-close" (click)="showContratFinalModal = false"></button>
              </div>
              <div class="modal-body p-4 bg-white" style="font-size: 13px; line-height: 1.6;">
                <div class="border rounded-4 p-4 mb-3">
                  <div class="text-center mb-4 pb-3 border-bottom">
                    <h5 class="fw-bold text-uppercase text-primary mb-1">RÉPUBLIQUE DU SÉNÉGAL</h5>
                    <small class="text-muted d-block">Code des Obligations Civiles et Commerciales • Loi n° 81-52</small>
                    <strong class="d-block mt-2 fs-6">CONTRAT DE BAIL D'HABITATION FINALISÉ & SCELLÉ</strong>
                    <span class="badge bg-success mt-1">SIGNÉ ET CERTIFIÉ EN LIGNE ✓</span>
                  </div>

                  <p><strong>Bailleur :</strong> {{ logement?.admin?.raison_sociale || logement?.admin?.name }}</p>
                  <p><strong>Locataire Preneur :</strong> {{ auth.currentUser()?.name }} (Dossier vérifié et certifié)</p>
                  <p><strong>Logement :</strong> {{ logement?.titre }} — {{ logement?.adresse }}, {{ logement?.quartier }}, {{ logement?.ville }}</p>
                  <p><strong>Période :</strong> Du {{ dateDebut }} au {{ dateFin }}</p>
                  <p><strong>Loyer mensuel :</strong> {{ (calcul?.montant_loyer || logement?.prix_par_mois) | number }} FCFA</p>
                  <p><strong>Caution consignée sous séquestre :</strong> {{ (calcul?.montant_caution || logement?.caution) | number }} FCFA (Conforme législation sénégalaise, max 2 mois)</p>
                  <p><strong>Règlement effectué :</strong> {{ moyenPaiement | uppercase }} Sénégal • Réf : {{ lastPaymentResult?.paiement?.reference_transaction || 'PAY-SN-2026-CONFIRMED' }}</p>

                  <div class="row mt-4 pt-3 border-top g-3 text-center">
                    <div class="col-6">
                      <small class="text-muted d-block mb-1">Signature électronique Bailleur :</small>
                      <div class="p-2 border rounded-3 bg-light font-monospace small text-primary">
                        ✓ CERTIFIÉ SÉNÉGAL BAIL<br>
                        <span style="font-size: 10px;">{{ logement?.admin?.name || 'Gestionnaire Agréé' }}</span>
                      </div>
                    </div>
                    <div class="col-6">
                      <small class="text-muted d-block mb-1">Signature électronique Locataire :</small>
                      <div class="p-2 border rounded-3 bg-light font-monospace small text-success">
                        ✓ ACCORD CONFIRMÉ & SCELLÉ<br>
                        <span style="font-size: 10px;">{{ auth.currentUser()?.name || 'Locataire' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer border-top bg-light px-4 py-3 gap-2">
                <button type="button" class="btn btn-outline-secondary rounded-2 px-3" (click)="showContratFinalModal = false">Fermer</button>
                <button type="button" class="btn btn-success rounded-2 px-4 fw-bold" (click)="imprimerContrat()">
                  <i class="bi bi-printer me-1"></i> Imprimer le Contrat de Bail
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ReservationFlowComponent implements OnInit {
  logement: Logement | null = null;
  currentStep = 1; // 1: Dates, 2: Recap, 25: Attente validation, 3: Paiement, 4: Confirmation
  dateDebut = '';
  dateFin = '';
  calcul: ReservationCalculation | null = null;
  activeReservation: Reservation | null = null;
  lastPaymentResult: any = null;

  // Options de paiement (Wave Sénégal & Orange Money Sénégal)
  moyenPaiement: 'wave' | 'orange_money' | 'carte' = 'wave';
  typePaiement = 'premier_loyer';
  telephonePaiement = '77 123 45 67';
  isLoading = false;

  // États pour les modales et l'acceptation obligatoire du contrat
  showDemandeEnvoyeeModal = false;
  contratAccepte = false;
  showContratModal = false;
  showRecuModal = false;
  showContratFinalModal = false;

  private cdr = inject(ChangeDetectorRef);

  get nbNonLusMessages(): number {
    return this.messageService.getNbNonLusTotal();
  }

  get stepperProgress(): number {
    if (this.currentStep === 1) return 0;
    if (this.currentStep === 2) return 33.33;
    if (this.currentStep === 25) return 66.66;
    if (this.currentStep === 3) return 99.99;
    if (this.currentStep >= 4) return 100;
    return 0;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private logementService: LogementService,
    private reservationService: ReservationService,
    public auth: AuthService,
    private messageService: MessageService,
    private modalAlert: ModalAlertService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id')) || 1;
   
    
    // Sécurisation stricte : l'utilisateur doit être connecté pour réserver
    if (!this.auth.isLoggedIn()) {
      this.modalAlert.warning('Connexion requise : Vous devez être connecté avec votre compte locataire pour accéder au parcours de réservation.', 'Authentification Requise');
      this.router.navigate(['/login'], { queryParams: { redirect: `/reserver/${id}` } });
      return;
    }
    
    // Initialisation synchrone immédiate pour éviter tout écran blanc
    this.logement = this.logementService.getLogementSync(id);
    
    this.cdr.markForCheck();

    this.route.queryParams.subscribe(params => {
      const stepParam = params['step'] ? Number(params['step']) : null;
      const resIdParam = params['reservation_id'] ? params['reservation_id'] : null;

      if (params['debut']) this.dateDebut = params['debut'];
      if (params['fin']) this.dateFin = params['fin'];

      // Reprise depuis lien messagerie (reservation_id + step)
      if (resIdParam) {
        const existingRes = this.reservationService.getReservationById(resIdParam);
        if (existingRes) {
          this.activeReservation = existingRes;
          this.dateDebut = existingRes.date_debut;
          this.dateFin = existingRes.date_fin;
          this.calcul = {
            nb_jours: existingRes.duree_jours,
            nb_mois: Math.max(1, Math.round((existingRes.duree_jours / 30) * 10) / 10),
            montant_loyer: existingRes.montant_loyer,
            montant_caution: existingRes.montant_caution,
            montant_frais_service: existingRes.montant_frais_service,
            montant_total: existingRes.montant_total,
            mode_reservation: 'sur_validation',
            politique_annulation: this.logement?.politique_annulation || 'gratuite'
          };
        } else {
          const defaultTotal = (this.logement?.prix_par_mois || 500000) * 3 + 25000;
          this.activeReservation = {
            id: Number(resIdParam) || Date.now(),
            locataire_id: this.auth.currentUser()?.id || 1,
            logement_id: id,
            date_debut: this.dateDebut || '2026-11-01',
            date_fin: this.dateFin || '2026-12-01',
            duree_jours: 30,
            montant_loyer: this.logement?.prix_par_mois || 500000,
            montant_caution: (this.logement?.prix_par_mois || 500000) * 2,
            montant_frais_service: 25000,
            montant_total: defaultTotal,
            statut: 'confirmee',
            created_at: new Date().toISOString(),
            logement: this.logement || undefined
          };
          this.calcul = {
            nb_jours: 30,
            nb_mois: 1,
            montant_loyer: this.logement?.prix_par_mois || 500000,
            montant_caution: (this.logement?.prix_par_mois || 500000) * 2,
            montant_frais_service: 25000,
            montant_total: defaultTotal,
            mode_reservation: 'sur_validation',
            politique_annulation: 'gratuite'
          };
        }
      }

      // REDIRECTION PRIORITAIRE ET DIRECTE VERS L'ÉTAPE 3 DE PAIEMENT
      if (stepParam === 3) {
        this.currentStep = 3;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.cdr.markForCheck();
      } else if (this.dateDebut && this.dateFin && this.currentStep === 1) {
        this.onDateChange();
      }
    });

    this.logementService.getLogement(id).subscribe({
      next: (data) => {
        if (data) {
          this.logement = data;
          if (this.currentStep !== 3 && this.dateDebut && this.dateFin) {
            this.onDateChange();
          }
          this.cdr.markForCheck();
        }
      },
      error: () => console.log('Catalogue local actif pour la réservation')
    });
  }

  onDateChange(): void {
    if (!this.logement || !this.dateDebut || !this.dateFin) return;
    this.reservationService.calculate(this.logement.id, this.dateDebut, this.dateFin).subscribe({
      next: (res) => {
        this.calcul = res;
        this.cdr.markForCheck();
      },
      error: (err) => console.error(err)
    });
  }

  goToStep(step: number): void {
    this.currentStep = step;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  creerEtPasserPaiement(): void {
    if (!this.logement) return;
    if (!this.auth.isLoggedIn()) {
      this.modalAlert.warning('Session expirée : Veuillez vous reconnecter pour poursuivre votre réservation.', 'Session Expirée');
      this.router.navigate(['/login'], { queryParams: { redirect: `/reserver/${this.logement.id}` } });
      return;
    }
    this.isLoading = true;

    this.reservationService.createReservation({
      logement_id: this.logement.id,
      date_debut: this.dateDebut,
      date_fin: this.dateFin
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.activeReservation = res;
        // Le paiement Phase 2 n'est autorisé que si la réservation est confirmée par le gestionnaire
        if (res.statut === 'confirmee') {
          this.goToStep(3);
        } else {
          this.goToStep(25);
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.modalAlert.error(err.error?.message || 'Erreur lors de la réservation', 'Erreur de Réservation');
      }
    });
  }

  fermerDemandeModal(): void {
    this.showDemandeEnvoyeeModal = false;
    this.cdr.markForCheck();
  }

  accepterContratDepuisModal(): void {
    this.contratAccepte = true;
    this.showContratModal = false;
    this.cdr.markForCheck();
  }

  procederAuPaiement(): void {
    if (!this.activeReservation) return;
    if (!this.contratAccepte) {
      this.modalAlert.warning('Vous devez impérativement lire et accepter les conditions du contrat de bail avant de pouvoir effectuer le paiement.', 'Acceptation Requise');
      return;
    }
    if (this.activeReservation.statut !== 'confirmee') {
      this.modalAlert.info('Ce paiement requiert impérativement la validation préalable de votre dossier par le gestionnaire.', 'Validation en Attente');
      return;
    }
    this.isLoading = true;

    this.reservationService.payer({
      reservation_id: this.activeReservation.id,
      moyen: this.moyenPaiement,
      type: this.typePaiement,
      telephone_paiement: this.telephonePaiement
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.lastPaymentResult = res;
        this.activeReservation = res.reservation;
        this.goToStep(4);
      },
      error: (err) => {
        this.isLoading = false;
        this.modalAlert.error(err.error?.message || 'Échec du paiement', 'Échec du Paiement');
      }
    });
  }

  telechargerRecu(): void {
    this.showRecuModal = true;
    this.cdr.markForCheck();
  }

  telechargerContrat(): void {
    this.showContratFinalModal = true;
    this.cdr.markForCheck();
  }

  imprimerRecu(): void {
    window.print();
  }

  imprimerContrat(): void {
    window.print();
  }
}
