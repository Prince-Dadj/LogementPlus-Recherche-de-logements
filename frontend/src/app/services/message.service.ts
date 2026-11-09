import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, catchError } from 'rxjs';
import { Conversation, MessageItem, LienActionMessage, Reservation, User, Logement } from '../models/models';
import { AuthService } from './auth.service';

export interface DBConversationRecord {
  id: string; // Ex: 'conv_res_101'
  reservation_id: number;
  logement_id: number;
  logement_titre: string;
  locataire_id: number;
  locataire_name: string;
  locataire_telephone?: string;
  locataire_email?: string;
  locataire_avatar?: string;
  gestionnaire_id: number;
  gestionnaire_name: string;
  gestionnaire_telephone?: string;
  gestionnaire_email?: string;
  gestionnaire_entreprise?: string;
  gestionnaire_avatar?: string;
  dernierMessage: string;
  dateDernierMessage: string;
  nonLusLocataire: number;
  nonLusGestionnaire: number;
  messages: MessageItem[];
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = 'http://localhost:8000/api';

  private dbKey = 'logementplus_conversations_database_v4';

  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  public conversations$ = this.conversationsSubject.asObservable();

  constructor() {
    this.nettoyerAnciennesDonneesStatiques();
    this.initialiserDepuisReservations();
    this.rechargerConversations();

    // Écoute de l'événement storage pour synchronisation inter-onglets/fenêtres
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === this.dbKey || event.key === 'logementplus_reservations_v3') {
          this.rechargerConversations();
        }
      });
    }
  }

  /**
   * Supprime définitivement les anciennes conversations statiques mockées en dur
   */
  private nettoyerAnciennesDonneesStatiques(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('logementplus_conversations_v3_') || key.startsWith('logementplus_conversations_v2_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));

      // Nettoyer également de la DB les fausses conversations statiques et faux messages simulés
      const saved = localStorage.getItem(this.dbKey);
      if (saved) {
        let records: DBConversationRecord[] = JSON.parse(saved);
        if (Array.isArray(records)) {
          let modified = false;
          const recordsFiltres = records.filter(r => r.reservation_id !== 101 && r.reservation_id !== 102 && r.id !== 'conv_res_101' && r.id !== 'conv_res_102');
          if (recordsFiltres.length !== records.length) modified = true;

          recordsFiltres.forEach(rec => {
            // Supprimer les faux messages automatiques indésirables (auto-réponse du gestionnaire)
            const msgsFiltres = rec.messages.filter(m =>
              !m.contenu?.startsWith('Message bien reçu concernant') &&
              !m.contenu?.includes("J'ai bien reçu votre demande de réservation (#DEM-")
            );
            if (msgsFiltres.length !== rec.messages.length) {
              rec.messages = msgsFiltres;
              modified = true;
              if (rec.messages.length > 0) {
                const dernier = rec.messages[rec.messages.length - 1];
                rec.dernierMessage = dernier.contenu;
                rec.dateDernierMessage = dernier.created_at || new Date().toISOString();
              }
            }

            // Migrer la dateDernierMessage statique en ISO réel
            if (!rec.dateDernierMessage || rec.dateDernierMessage === 'À l\'instant' || rec.dateDernierMessage === 'À l\'instante') {
              const dernier = rec.messages[rec.messages.length - 1];
              rec.dateDernierMessage = dernier?.created_at || new Date().toISOString();
              modified = true;
            }
          });

          if (modified) {
            localStorage.setItem(this.dbKey, JSON.stringify(recordsFiltres));
          }
        }
      }
    } catch (e) {
      // Ignorer
    }
  }

  /**
   * Récupère la base de données brute de toutes les conversations
   */
  private getDB(): DBConversationRecord[] {
    try {
      const saved = localStorage.getItem(this.dbKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Erreur lecture DB conversations', e);
    }
    return [];
  }

  /**
   * Sauvegarde la base de données brute et rafraîchit le flux utilisateur
   */
  private saveDB(records: DBConversationRecord[]): void {
    try {
      localStorage.setItem(this.dbKey, JSON.stringify(records));
      this.rechargerConversations();
    } catch (e) {
      console.warn('Erreur écriture DB conversations', e);
    }
  }

  /**
   * Initialise les conversations à partir des réservations existantes dans la base
   * ZÉRO fausse conversation statique ! Uniquement les réservations réelles.
   */
  private initialiserDepuisReservations(): void {
    const db = this.getDB();
    if (db.length > 0) return;

    try {
      const savedRes = localStorage.getItem('logementplus_reservations_v3');
      if (savedRes) {
        const reservations: Reservation[] = JSON.parse(savedRes);
        if (Array.isArray(reservations)) {
          reservations.forEach(r => {
            this.creerConversationPourReservationInterne(r, false);
          });
        }
      }
    } catch (e) {
      console.warn('Erreur init conversations depuis réservations', e);
    }
  }

  /**
   * Recharge les conversations filtrées et formatées pour l'utilisateur actuellement connecté
   */
  public rechargerConversations(): void {
    const db = this.getDB();
    const currentUser = this.auth.currentUser();
    const userRole = currentUser?.role || 'locataire';
    const userId = currentUser ? currentUser.id : (userRole === 'admin' ? 2 : 1);

    const formatted: Conversation[] = [];

    db.forEach(record => {
      // Filtrage dynamique strict selon le rôle et l'ID réel de l'utilisateur connecté
      const isPourCetUtilisateur = (userRole === 'admin')
        ? (record.gestionnaire_id === userId)
        : (userRole === 'superadmin')
        ? true
        : (record.locataire_id === userId);

      if (isPourCetUtilisateur) {
        if (userRole === 'admin' || userRole === 'superadmin') {
          // L'interlocuteur du gestionnaire est le LOCATAIRE
          formatted.push({
            id: record.id,
            reservation_id: record.reservation_id,
            logement_titre: record.logement_titre,
            dernierMessage: record.dernierMessage,
            dateDernierMessage: record.dateDernierMessage,
            nonLus: record.nonLusGestionnaire,
            messages: record.messages,
            interlocuteur: {
              id: record.locataire_id,
              name: record.locataire_name,
              role: 'locataire',
              telephone: record.locataire_telephone || '+221 77 100 00 01',
              email: record.locataire_email || 'locataire@example.com',
              avatar: record.locataire_avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
            }
          });
        } else {
          // L'interlocuteur du locataire est le GESTIONNAIRE QUI A PUBLIÉ LE BIEN
          formatted.push({
            id: record.id,
            reservation_id: record.reservation_id,
            logement_titre: record.logement_titre,
            dernierMessage: record.dernierMessage,
            dateDernierMessage: record.dateDernierMessage,
            nonLus: record.nonLusLocataire,
            messages: record.messages,
            interlocuteur: {
              id: record.gestionnaire_id,
              name: record.gestionnaire_name,
              role: 'gestionnaire',
              entreprise: record.gestionnaire_entreprise || 'Gestionnaire Agréé',
              telephone: record.gestionnaire_telephone || '+221 77 200 00 01',
              email: record.gestionnaire_email || 'gestionnaire@logementplus.sn',
              avatar: record.gestionnaire_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
            }
          });
        }
      }
    });

    this.conversationsSubject.next(formatted);
  }

  public getConversations(): Conversation[] {
    return this.conversationsSubject.value;
  }

  public getConversationById(id: string): Conversation | undefined {
    return this.conversationsSubject.value.find(c => c.id === id);
  }

  public getNbNonLusTotal(): number {
    return this.conversationsSubject.value.reduce((total, c) => total + (c.nonLus || 0), 0);
  }

  public marquerConversationLue(convId: string): void {
    const db = this.getDB();
    const record = db.find(r => r.id === convId);
    if (!record) return;

    const userRole = this.auth.currentUser()?.role || 'locataire';
    if (userRole === 'admin' || userRole === 'superadmin') {
      record.nonLusGestionnaire = 0;
    } else {
      record.nonLusLocataire = 0;
    }

    record.messages.forEach(m => m.lu = true);
    this.saveDB(db);
  }

  /**
   * CRÉATION DYNAMIQUE LORS D'UNE NOUVELLE DEMANDE DE RÉSERVATION
   * Appelée dès que le locataire clique sur « Envoyer ma demande au gestionnaire »
   */
  public creerConversationPourReservation(reservation: Reservation): void {
    this.creerConversationPourReservationInterne(reservation, true);
  }

  private creerConversationPourReservationInterne(reservation: Reservation, save: boolean = true): DBConversationRecord {
    const db = this.getDB();
    const convId = `conv_res_${reservation.id}`;

    let record = db.find(r => r.id === convId || r.reservation_id === reservation.id);
    if (record) {
      if (save) this.saveDB(db);
      return record;
    }


    // Gestionnaire réel du logement
    const admin = reservation.logement?.admin || {
      id: reservation.logement?.admin_id || 7,
      name: 'Lamine Camara (Gestionnaire)',
      raison_sociale: 'Teranga Prestige Immobilier Dakar',
      telephone: '+221 77 200 00 01',
      email: 'laminecamara@gmail.com'
    };

    // Locataire
    const locataire: any = reservation.locataire || this.auth.currentUser() || {
      id: reservation.locataire_id || 1,
      name: 'Amadou Diallo (Locataire)',
      telephone: '+221 77 123 45 67',
      email: 'locataire@example.com'
    };

    const msg1: MessageItem = {
      id: Date.now(),
      expediteur_id: locataire.id,
      destinataire_id: admin.id,
      reservation_id: reservation.id,
      contenu: `Bonjour ${admin.name},\n\nJe viens de soumettre ma demande de réservation pour votre logement « ${reservation.logement?.titre || 'Logement'} » du ${reservation.date_debut} au ${reservation.date_fin}.\n\nMes pièces justificatives certifiées sont rattachées à mon dossier pour votre examen.`,
      lu: true,
      created_at: new Date().toISOString(),
      expediteur: { id: locataire.id, name: locataire.name, role: 'locataire' }
    };

    record = {
      id: convId,
      reservation_id: reservation.id,
      logement_id: reservation.logement_id,
      logement_titre: reservation.logement?.titre || 'Logement sélectionné',
      locataire_id: locataire.id,
      locataire_name: locataire.name,
      locataire_telephone: locataire.telephone,
      locataire_email: locataire.email,
      gestionnaire_id: admin.id,
      gestionnaire_name: admin.name,
      gestionnaire_telephone: admin.telephone,
      gestionnaire_email: admin.email,
      gestionnaire_entreprise: admin.raison_sociale || 'Agence Immobilière Agréée',
      dernierMessage: msg1.contenu,
      dateDernierMessage: msg1.created_at || new Date().toISOString(),
      nonLusLocataire: 0,
      nonLusGestionnaire: 1,
      messages: [msg1]
    };

    db.unshift(record);
    if (save) {
      this.saveDB(db);
    }
    return record;
  }

  /**
   * VALIDATION PAR LE GESTIONNAIRE :
   * Ajoute le message avec le lien d'accès DIRECT vers l'Étape 3 (Paiement)
   */
  public emettreValidationGestionnaire(
    reservation: Reservation,
    logementTitre: string,
    adminName: string = 'Gestionnaire'
  ): void {
    const db = this.getDB();
    const convId = `conv_res_${reservation.id}`;
    let record = db.find(r => r.id === convId || r.reservation_id === reservation.id);

    if (!record) {
      record = this.creerConversationPourReservationInterne(reservation, false);
      db.unshift(record);
    }

    const adminId = record.gestionnaire_id || 2;
    const locataireId = record.locataire_id || 1;
    const nomLocataire = record.locataire_name || 'cher locataire';

    // Lien menant CONCRÈTEMENT et DIRECTEMENT à l'étape 3
    const urlEtape3 = `/reserver/${reservation.logement_id}?reservation_id=${reservation.id}&step=3`;

    const texteMessage = `Bonjour ${nomLocataire},\n\nJ'ai examiné vos justificatifs (pièce d'identité et revenus certifiés). J'ai l'honneur de vous informer que votre demande de réservation (#DEM-${reservation.id}) pour le logement « ${logementTitre} » a été VALIDÉE avec succès !\n\nVous devez maintenant procéder au règlement sécurisé (Phase 2) pour consigner vos fonds sous séquestre 24h et signer le bail.`;

    const lienAction: LienActionMessage = {
      type: 'paiement_phase2',
      label: `Procéder au paiement Phase 2 (${(reservation.montant_total || 250000).toLocaleString('fr-FR')} FCFA)`,
      url: urlEtape3,
      reservation_id: reservation.id,
      montant: reservation.montant_total
    };

    const messageValidation: MessageItem = {
      id: Date.now(),
      expediteur_id: adminId,
      destinataire_id: locataireId,
      reservation_id: reservation.id,
      contenu: texteMessage,
      lu: false,
      created_at: new Date().toISOString(),
      expediteur: { id: adminId, name: adminName, role: 'gestionnaire' },
      lien_action: lienAction
    };

    record.messages.push(messageValidation);
    record.dernierMessage = `Validation acceptée - Lien de paiement Phase 2 transmis`;
    record.dateDernierMessage = messageValidation.created_at || new Date().toISOString();
    record.nonLusLocataire = (record.nonLusLocataire || 0) + 1;
    db.unshift(record);
    this.saveDB(db);
  }

  /**
   * REJET PAR LE GESTIONNAIRE :
   * Ajoute le message de refus avec le motif exact dans la conversation
   */
  public emettreRefusGestionnaire(
    reservation: Reservation,
    logementTitre: string,
    motif: string,
    adminName: string = 'Gestionnaire'
  ): void {
    const db = this.getDB();
    const convId = `conv_res_${reservation.id}`;
    let record = db.find(r => r.id === convId || r.reservation_id === reservation.id);

    if (!record) {
      record = this.creerConversationPourReservationInterne(reservation, false);
      db.unshift(record);
    }

    const adminId = record.gestionnaire_id || 2;
    const locataireId = record.locataire_id || 1;
    const nomLocataire = record.locataire_name || 'cher locataire';

    const texteMessage = `Bonjour ${nomLocataire},\n\nVotre demande de réservation pour le logement « ${logementTitre} » a été rejetée pour le motif suivant :\n\n📌 Motif de refus : ${motif}\n\nN'hésitez pas à compléter votre dossier avec des pièces conformes ou à consulter nos autres logements disponibles.`;

    const messageRefus: MessageItem = {
      id: Date.now(),
      expediteur_id: adminId,
      destinataire_id: locataireId,
      reservation_id: reservation.id,
      contenu: texteMessage,
      lu: false,
      created_at: new Date().toISOString(),
      expediteur: { id: adminId, name: adminName, role: 'gestionnaire' }
    };

    record.messages.push(messageRefus);
    record.dernierMessage = `Demande refusée : ${motif}`;
    record.dateDernierMessage = messageRefus.created_at;
    record.nonLusLocataire = (record.nonLusLocataire || 0) + 1;
    db.unshift(record);
    this.saveDB(db);
  }

  /**
   * ENVOI D'UN MESSAGE DANS LA CONVERSATION
   * Les deux (locataire et gestionnaire) peuvent discuter en direct
   */
  public envoyerMessage(convId: string, contenu: string): MessageItem {
    const db = this.getDB();
    const record = db.find(r => r.id === convId);

    const currentUser = this.auth.currentUser();
    const isGestionnaire = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

    const expediteurId = currentUser ? currentUser.id : (isGestionnaire ? 2 : 1);
    const expediteurName = currentUser ? currentUser.name : (isGestionnaire ? 'Gestionnaire' : 'Locataire');
    const expediteurRole = isGestionnaire ? 'gestionnaire' : 'locataire';

    const destinataireId = isGestionnaire ? (record?.locataire_id || 1) : (record?.gestionnaire_id || 2);

    const nouveauMsg: MessageItem = {
      id: Date.now(),
      expediteur_id: expediteurId,
      destinataire_id: destinataireId,
      reservation_id: record?.reservation_id,
      contenu: contenu.trim(),
      lu: false,
      created_at: new Date().toISOString(),
      expediteur: { id: expediteurId, name: expediteurName, role: expediteurRole }
    };

    if (record) {
      record.messages.push(nouveauMsg);
      record.dernierMessage = nouveauMsg.contenu;
      record.dateDernierMessage = nouveauMsg.created_at;

      if (isGestionnaire) {
        record.nonLusLocataire = (record.nonLusLocataire || 0) + 1;
      } else {
        record.nonLusGestionnaire = (record.nonLusGestionnaire || 0) + 1;
      }

      this.saveDB(db);
    }

    return nouveauMsg;
  }

  /**
   * Calcule le temps écoulé dynamique (ex: "À l'instant", "Il y a 5 min", "Il y a 2 h", "Il y a 3 j", etc.)
   */
  public getRelativeTime(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return "À l'instant";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return `Hier`;
    if (diffDays < 7) return `Il y a ${diffDays} j`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `Il y a ${diffWeeks} sem.`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `Il y a ${diffMonths} mois`;
    const diffYears = Math.floor(diffDays / 365);
    return `Il y a ${diffYears} an${diffYears > 1 ? 's' : ''}`;
  }
}
