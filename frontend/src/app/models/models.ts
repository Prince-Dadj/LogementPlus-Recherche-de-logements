export type UserRole = 'locataire' | 'admin' | 'superadmin';
export type UserStatus = 'actif' | 'en_attente' | 'suspendu';

export interface User {
  id: number;
  name: string;
  nom?: string;
  prenom?: string;
  email: string;
  telephone?: string;
  role: UserRole;
  statut: UserStatus;
  raison_sociale?: string;
  statut_validation?: 'valide' | 'en_attente' | 'rejete';
  piece_identite?: string;
  avatar_url?: string;
  preferences?: any;
  two_factor_enabled?: boolean;
}

export interface Equipement {
  id: number;
  nom: string;
  icone: string;
  categorie?: string;
}

export interface Photo {
  id: number;
  logement_id: number;
  url: string;
  ordre: number;
}

export interface Disponibilite {
  id: number;
  logement_id: number;
  date_debut: string;
  date_fin: string;
  prix_specifique?: number;
  bloquee: boolean;
}

export interface Avis {
  id: number;
  locataire_id: number;
  logement_id: number;
  note: number;
  commentaire: string;
  est_modere: boolean;
  created_at?: string;
  locataire?: { id: number; name: string };
  logement?: { id: number; titre: string };
}

export interface Logement {
  id: number;
  admin_id: number;
  titre: string;
  description: string;
  type: 'chambre' | 'studio' | 'appartement' | 'maison';
  adresse: string;
  ville: string;
  quartier?: string;
  latitude: number;
  longitude: number;
  prix_par_mois: number;
  caution: number;
  frais_service: number;
  nb_pieces: number;
  surface: number;
  meuble: boolean;
  statut: 'publie' | 'brouillon' | 'en_attente' | 'hors_ligne' | 'occupe';
  mode_reservation: 'immediate' | 'sur_validation';
  politique_annulation: 'gratuite' | 'partielle' | 'non_remboursable';
  reglement_interieur?: string;
  image_principale?: string;
  photos?: Photo[];
  equipements?: Equipement[];
  disponibilites?: Disponibilite[];
  avis?: Avis[];
  admin?: { id: number; name: string; telephone?: string; email?: string; raison_sociale?: string };
  note_moyenne?: number;
  nombre_avis?: number;
  est_occupe?: boolean;
  statut_occupation?: 'disponible' | 'occupe';
}

export interface ReservationCalculation {
  nb_jours: number;
  nb_mois: number;
  montant_loyer: number;
  montant_caution: number;
  montant_frais_service: number;
  montant_total: number;
  mode_reservation: 'immediate' | 'sur_validation';
  politique_annulation: string;
}

export interface Contrat {
  id: number;
  numero: string;
  fichier_pdf?: string;
  date_signature?: string;
  statut_signature: string;
}

export interface Paiement {
  id: number;
  reservation_id: number;
  montant: number;
  type: string;
  moyen: 'carte' | 'orange_money' | 'mtn_money' | 'wave';
  statut: 'en_attente' | 'reussi' | 'echoue' | 'rembourse';
  reference_transaction: string;
  commission_plateforme: number;
  montant_reverse_admin: number;
  statut_reversement: string;
  date_paiement?: string;
}

export interface Reservation {
  id: number;
  locataire_id: number;
  logement_id: number;
  date_debut: string;
  date_fin: string;
  duree_jours: number;
  montant_loyer: number;
  montant_caution: number;
  montant_frais_service: number;
  montant_total: number;
  statut: 'en_attente' | 'confirmee' | 'payee' | 'en_cours' | 'terminee' | 'annulee' | 'refusee';
  motif_refus?: string;
  politique_annulation_appliquee?: string;
  created_at: string;
  logement?: Logement;
  locataire?: User;
  contrat?: Contrat;
  paiements?: Paiement[];
  dossier_locataire?: DossierLocataire;
  locataire_details?: {
    piece_identite_statut?: string;
    piece_identite_type?: string;
    piece_identite_numero?: string;
    piece_identite_certificat?: string;
    revenus_statut?: string;
    revenus_type?: string;
    revenu_mensuel?: number;
    score_global?: number;
    est_certifie?: boolean;
    garantie_statut?: string;
    garantie_type?: string;
  };
}

export interface RecuPaiement {
  recu_numero: string;
  reference_transaction: string;
  date: string;
  moyen: string;
  type: string;
  montant: number;
  locataire: string;
  email: string;
  logement: string;
  adresse: string;
  periode: string;
  statut: string;
}

export interface AdminStats {
  nb_logements: number;
  total_reservations: number;
  reservations_en_attente: number;
  reservations_confirmees: number;
  revenus_percus: number;
  taux_occupation: number;
  repartition_types: { type: string; total: number }[];
  evolution_mensuelle: { mois: string; reservations: number; revenus: number }[];
}

export interface SuperAdminStats {
  total_users: number;
  total_locataires: number;
  total_admins: number;
  admins_en_attente: number;
  total_logements: number;
  total_reservations: number;
  chiffre_affaires_global: number;
  commissions_plateforme: number;
  taux_conversion: string;
  taux_succes_paiements: string;
  disponibilite_plateforme: string;
  repartition_types: { type: string; count: number }[];
  evolution_ca: { mois: string; ca: number; commissions: number }[];
}

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  entite: string;
  entite_id?: number;
  adresse_ip?: string;
  details?: any;
  created_at: string;
  user?: { id: number; name: string; email: string };
}

export interface PlatformParam {
  id: number;
  cle: string;
  valeur: string;
  description?: string;
}

export interface Agence {
  id: number;
  nom: string;
  ville: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  site_web?: string;
  icone: string;
  logo_url?: string;
  description?: string;
  est_partenaire_certifie: boolean;
  nombre_biens?: number;
}

export interface Temoignage {
  id: number;
  user_id?: number;
  nom_auteur: string;
  role_auteur: 'locataire' | 'gestionnaire' | 'agence';
  ville?: string;
  note: number;
  commentaire: string;
  avatar_url?: string;
  badge?: string;
  est_affiche?: boolean;
  est_verifie?: boolean;
  created_at?: string;
}

export interface PlateformePublicStats {
  nb_agences: number;
  nb_logements: number;
  nb_annonces_disponibles?: number;
  nb_locations_realisees?: number;
  nb_locataires: number;
  taux_satisfaction: number;
  note_moyenne?: number;
  nb_avis_total?: number;
}

export interface Neighborhood {
  name: string;
  count: number;
  label?: string;
  image: string;
  tag: string;
  ville?: string;
}

export type StatutPiece = 'non_fourni' | 'en_analyse' | 'valide' | 'rejete';

export interface PieceDossier {
  type: string;
  libelleType: string;
  nomFichier?: string;
  tailleFichier?: string;
  dateTeleversement?: string;
  numeroPiece?: string;
  statut: StatutPiece;
  dateVerification?: string;
  numeroCertificat?: string;
  scoreConformite?: number;
  motifRejet?: string;
  organismeControle?: string;
  detailsAnalyse?: {
    formatValide: boolean;
    lisibiliteOk: boolean;
    concordanceIdentite: boolean;
    securiteFiligrane: boolean;
  };
}

export interface DossierLocataire {
  identite: PieceDossier;
  revenus?: PieceDossier;
  garantie: PieceDossier;
  typeGarantie: string;
  revenuMensuel?: number;
  estCertifie: boolean;
  scoreGlobal: number;
  derniereAnalyse?: string;
}

export interface LienActionMessage {
  type: 'paiement_phase2' | 'details_reservation' | 'contrat' | 'logement';
  label: string;
  url: string;
  reservation_id?: number;
  logement_id?: number;
  montant?: number;
}

export interface MessageItem {
  id: number;
  expediteur_id: number;
  destinataire_id: number;
  reservation_id?: number;
  contenu: string;
  lu: boolean;
  created_at: string;
  expediteur?: { id: number; name: string; role?: string; avatar?: string };
  destinataire?: { id: number; name: string; role?: string };
  lien_action?: LienActionMessage;
}

export interface Conversation {
  id: string; // ex: 'gestionnaire_2' ou 'superadmin_1'
  interlocuteur: {
    id: number;
    name: string;
    role: 'gestionnaire' | 'superadmin' | 'locataire';
    entreprise?: string;
    telephone?: string;
    avatar?: string;
    email?: string;
  };
  dernierMessage: string;
  dateDernierMessage: string;
  nonLus: number;
  reservation_id?: number;
  logement_titre?: string;
  messages: MessageItem[];
}
