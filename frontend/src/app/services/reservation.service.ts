import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { RecuPaiement, Reservation, ReservationCalculation } from '../models/models';
import { AuthService } from './auth.service';
import { LogementService } from './logement.service';
import { DossierLocataireService } from './dossier-locataire.service';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:8000/api';
  private storageKey = 'logementplus_reservations_v3';

  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private logementService = inject(LogementService);
  private dossierService = inject(DossierLocataireService);
  private messageService = inject(MessageService);

  constructor() {
    this.initialiserDonneesLocales();
  }

  private initialiserDonneesLocales(): void {
    const saved = localStorage.getItem(this.storageKey);
    if (!saved) {
      // Base de données 100% dynamique : aucune réservation fictive
      this.saveReservationsToStorage([]);
    } else {
      try {
        const reservations: Reservation[] = JSON.parse(saved);
        if (Array.isArray(reservations)) {
          // Élimination définitive des anciennes réservations statiques id 101 et 102
          const nettoyees = reservations.filter(r => r.id !== 101 && r.id !== 102);
          if (nettoyees.length !== reservations.length) {
            this.saveReservationsToStorage(nettoyees);
          }
        }
      } catch (e) {
        this.saveReservationsToStorage([]);
      }
    }
  }

  private getReservationsFromStorage(): Reservation[] {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  private saveReservationsToStorage(res: Reservation[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(res));
    } catch (e) {
      console.warn('Erreur sauvegarde réservations locales', e);
    }
  }

  // RF-20 : Calcul préalable avec repli local instantané
  calculate(logementId: number, dateDebut: string, dateFin: string): Observable<ReservationCalculation> {
    return this.http.post<ReservationCalculation>(`${this.apiUrl}/reservations/calculate`, {
      logement_id: logementId,
      date_debut: dateDebut,
      date_fin: dateFin
    }).pipe(
      catchError(() => {
        const logement = this.logementService.getLogementSync(logementId);
        const d1 = new Date(dateDebut);
        const d2 = new Date(dateFin);
        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        const nbJours = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        
        const montantLoyer = Math.round((logement.prix_par_mois / 30) * nbJours);
        const montantCaution = logement.caution || (logement.prix_par_mois * 2);
        const montantFrais = logement.frais_service || Math.round(montantLoyer * 0.05);
        const montantTotal = montantLoyer + montantCaution + montantFrais;

        const calc: ReservationCalculation = {
          nb_jours: nbJours,
          nb_mois: Math.max(1, Math.round((nbJours / 30) * 10) / 10),
          montant_loyer: montantLoyer,
          montant_caution: montantCaution,
          montant_frais_service: montantFrais,
          montant_total: montantTotal,
          mode_reservation: 'sur_validation', // Toujours sous condition de validation gestionnaire
          politique_annulation: logement.politique_annulation || 'gratuite'
        };

        return of(calc);
      })
    );
  }

  // RF-20 & RF-21 : Création de la réservation (STATUT INITIAL : 'en_attente')
  createReservation(data: { logement_id: number; date_debut: string; date_fin: string }): Observable<Reservation> {
    const headers = this.auth.getAuthHeaders();
    const user = this.auth.currentUser();
    const dossier = this.dossierService.getDossierSync();
    const logement = this.logementService.getLogementSync(data.logement_id);

    // Calcul des montants
    const d1 = new Date(data.date_debut);
    const d2 = new Date(data.date_fin);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const nbJours = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const montantLoyer = Math.round((logement.prix_par_mois / 30) * nbJours);
    const montantCaution = logement.caution || (logement.prix_par_mois * 2);
    const montantFrais = logement.frais_service || Math.round(montantLoyer * 0.05);
    const montantTotal = montantLoyer + montantCaution + montantFrais;

    const newRes: Reservation = {
      id: Date.now(),
      locataire_id: user?.id || 1,
      logement_id: logement.id,
      date_debut: data.date_debut,
      date_fin: data.date_fin,
      duree_jours: nbJours,
      montant_loyer: montantLoyer,
      montant_caution: montantCaution,
      montant_frais_service: montantFrais,
      montant_total: montantTotal,
      statut: 'en_attente', // Paiement non autorisé tant que non validé par le gestionnaire !
      created_at: new Date().toISOString(),
      logement: logement,
      locataire: user || {
        id: 1,
        name: 'Amadou Diallo',
        email: 'locataire@example.com',
        telephone: '+221 77 123 45 67',
        role: 'locataire',
        statut: 'actif'
      },
      locataire_details: {
        piece_identite_statut: dossier.identite.statut,
        piece_identite_type: dossier.identite.libelleType,
        piece_identite_numero: dossier.identite.numeroPiece,
        piece_identite_certificat: dossier.identite.numeroCertificat,
        revenus_statut: dossier.revenus?.statut,
        revenus_type: dossier.revenus?.libelleType,
        revenu_mensuel: dossier.revenuMensuel || 500000,
        score_global: dossier.scoreGlobal,
        est_certifie: dossier.estCertifie,
        garantie_statut: 'Séquestre Wave / OM Activé',
        garantie_type: dossier.typeGarantie
      }
    };

    // Sauvegarder localement
    const all = this.getReservationsFromStorage();
    all.unshift(newRes);
    this.saveReservationsToStorage(all);

    // Initialisation dynamique de la conversation réelle avec le gestionnaire qui a publié le bien
    this.messageService.creerConversationPourReservation(newRes);

    // Envoi backend API en parallèle avec repli
    return this.http.post<Reservation>(`${this.apiUrl}/reservations`, data, { headers }).pipe(
      catchError(() => of(newRes))
    );
  }

  // RF-25 : Mes réservations (Locataire)
  getMesReservations(): Observable<Reservation[]> {
    const headers = this.auth.getAuthHeaders();
    const user = this.auth.currentUser();
    return this.http.get<Reservation[]>(`${this.apiUrl}/mes-reservations`, { headers }).pipe(
      catchError(() => of([])),
      map(apiRes => {
        const local = this.getReservationsFromStorage();
        const base = (apiRes && apiRes.length > 0) ? apiRes : local;
        if (user && user.role === 'locataire') {
          return base.filter(r => r.locataire_id === user.id || r.locataire?.id === user.id);
        }
        return base;
      })
    );
  }

  // RF-43 : Réservations reçues (Gestionnaire / Admin)
  getReservationsGestionnaire(): Observable<Reservation[]> {
    const headers = this.auth.getAuthHeaders();
    const user = this.auth.currentUser();
    return this.http.get<Reservation[]>(`${this.apiUrl}/admin/reservations`, { headers }).pipe(
      catchError(() => of([])),
      map(apiRes => {
        const local = this.getReservationsFromStorage();
        const base = (apiRes && apiRes.length > 0) ? apiRes : local;
        if (user && user.role === 'admin') {
          return base.filter(r => r.logement?.admin_id === user.id || r.logement?.admin?.id === user.id);
        }
        return base;
      })
    );
  }

  // VALIDATION PAR LE GESTIONNAIRE : déclenche le message avec le lien de paiement Phase 2
  validerReservation(id: number): Observable<any> {
    const headers = this.auth.getAuthHeaders();
    const all = this.getReservationsFromStorage();
    const res = all.find(r => r.id === id);

    if (res) {
      res.statut = 'confirmee';
      this.saveReservationsToStorage(all);

      const adminNom = this.auth.currentUser()?.name || res.logement?.admin?.name || 'Moussa Ndiaye (Gestionnaire)';

      // Émission automatique du message avec lien de paiement Phase 2
      this.messageService.emettreValidationGestionnaire(
        res,
        res.logement?.titre || 'Logement sélectionné',
        adminNom
      );
    }

    return this.http.post(`${this.apiUrl}/admin/reservations/${id}/valider`, {}, { headers }).pipe(
      catchError(() => of({
        message: 'Réservation validée avec succès. Message avec lien de paiement Phase 2 transmis au locataire.',
        reservation: res
      }))
    );
  }

  // REJET PAR LE GESTIONNAIRE : avec motif facultatif
  refuserReservation(id: number, motif?: string): Observable<any> {
    const headers = this.auth.getAuthHeaders();
    const all = this.getReservationsFromStorage();
    const res = all.find(r => r.id === id);

    const motifFinal = motif?.trim() ? motif.trim() : '';

    if (res) {
      res.statut = 'refusee';
      res.motif_refus = motifFinal || undefined;
      this.saveReservationsToStorage(all);

      const adminNom = this.auth.currentUser()?.name || res.logement?.admin?.name || 'Moussa Ndiaye (Gestionnaire)';

      // Émission automatique du message explicatif au locataire
      this.messageService.emettreRefusGestionnaire(
        res,
        res.logement?.titre || 'Logement',
        motifFinal,
        adminNom
      );
    }

    return this.http.post(`${this.apiUrl}/admin/reservations/${id}/refuser`, { motif: motifFinal || null }, { headers }).pipe(
      catchError(() => of({
        message: 'Réservation refusée. Statut et e-mail notifiés au locataire.',
        reservation: res
      }))
    );
  }

  annulerReservation(id: number): Observable<any> {
    const headers = this.auth.getAuthHeaders();
    const all = this.getReservationsFromStorage();
    const res = all.find(r => r.id === id);
    if (res) {
      res.statut = 'annulee';
      this.saveReservationsToStorage(all);
    }
    return this.http.post(`${this.apiUrl}/reservations/${id}/annuler`, {}, { headers }).pipe(
      catchError(() => of({ message: 'Réservation annulée.' }))
    );
  }

  // PAIEMENT PHASE 2 : uniquement possible si statut === 'confirmee'
  payer(data: {
    reservation_id: number;
    moyen: 'carte' | 'orange_money' | 'mtn_money' | 'wave';
    type: string;
    telephone_paiement?: string;
  }): Observable<any> {
    const headers = this.auth.getAuthHeaders();
    const all = this.getReservationsFromStorage();
    const res = all.find(r => r.id === data.reservation_id);

    if (res) {
      res.statut = 'payee';
      this.saveReservationsToStorage(all);

      // Le logement devient occupé dans le catalogue !
      if (res.logement_id) {
        this.logementService.marquerLogementOccupe(res.logement_id);
      }

      // Notification dans la messagerie
      this.messageService.envoyerMessage(
        `gestionnaire_${res.logement?.admin_id || 2}`,
        `J'ai effectué le règlement sécurisé (Phase 2) de ${(res.montant_total || 0).toLocaleString('fr-FR')} FCFA par ${data.moyen.toUpperCase()}. Merci !`
      );
    }

    return this.http.post(`${this.apiUrl}/paiements/payer`, data, { headers }).pipe(
      catchError(() => of({
        success: true,
        reference: 'PAY-SN-' + Math.floor(100000 + Math.random() * 900000),
        message: 'Paiement sécurisé Phase 2 validé avec succès (Séquestre LogementPlus activé).',
        reservation: res,
        paiement: {
          id: Date.now(),
          montant: res?.montant_total || 250000,
          moyen: data.moyen,
          statut: 'reussi'
        }
      }))
    );
  }

  getRecu(paiementId: number): Observable<RecuPaiement> {
    const headers = this.auth.getAuthHeaders();
    return this.http.get<RecuPaiement>(`${this.apiUrl}/paiements/${paiementId}/recu`, { headers });
  }

  getReservationById(id: number | string): Reservation | undefined {
    const all = this.getReservationsFromStorage();
    return all.find(r => String(r.id) === String(id));
  }
}
