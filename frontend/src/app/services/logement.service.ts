import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError, tap, map } from 'rxjs';
import { Avis, Equipement, Logement, Neighborhood } from '../models/models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LogementService {
  private apiUrl = 'http://localhost:8000/api';

  // Catalogue dynamique — alimenté depuis localStorage ou le seed initial
  private catalogueLogements: Logement[] = [];

  private storageKey = 'logementplus_catalog_v2';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {
    this.initCatalog();
  }

  // ─────────────────────────────────────────────
  // Initialisation : lecture localStorage, puis seed si absent
  // ─────────────────────────────────────────────
  private initCatalog(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.catalogueLogements = parsed;
          return;
        }
      }
    } catch (e) {
      // Erreur de parsing : on utilise le seed
    }
    // Premier lancement ou données corrompues : seed initial
    this.catalogueLogements = this.getSeedCatalogue();
    this.saveCatalogToStorage();
  }

  private saveCatalogToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.catalogueLogements));
    } catch (e) {
      console.warn('Impossible de sauvegarder le catalogue dans localStorage', e);
    }
  }

  // ─────────────────────────────────────────────
  // Seed initial Sénégal (utilisé uniquement au 1er lancement)
  // ─────────────────────────────────────────────
  private getSeedCatalogue(): Logement[] {
    return [
      {
        id: 1,
        admin_id: 2,
        titre: 'Villa Prestige avec Piscine & Vue Océan - Les Almadies',
        description: 'Somptueuse villa d\'architecte située dans le quartier le plus exclusif de Dakar, Les Almadies. 4 chambres autonomes avec salles de bain attenantes, salon majestueux ouvert sur jardin arboré et piscine à débordement. Équipée d\'un groupe électrogène insonorisé automatique et d\'une réserve d\'eau de 5000L avec surpresseur. Sécurité gardiennage 24/7.',
        type: 'maison',
        adresse: 'Route de la Pointe des Almadies',
        ville: 'Dakar',
        quartier: 'Almadies',
        latitude: 14.7432,
        longitude: -17.5190,
        prix_par_mois: 1200000,
        caution: 2400000,
        frais_service: 60000,
        nb_pieces: 5,
        surface: 360,
        meuble: true,
        statut: 'publie',
        est_occupe: false,
        statut_occupation: 'disponible',
        mode_reservation: 'immediate',
        politique_annulation: 'gratuite',
        image_principale: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
        note_moyenne: 4.95,
        nombre_avis: 18,
        photos: [
          { id: 101, logement_id: 1, url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80', ordre: 1 },
          { id: 102, logement_id: 1, url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', ordre: 2 },
          { id: 103, logement_id: 1, url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', ordre: 3 },
          { id: 104, logement_id: 1, url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80', ordre: 4 }
        ],
        equipements: [
          { id: 1, nom: 'Piscine privée', categorie: 'confort', icone: 'bi-water' },
          { id: 2, nom: 'Climatisation intégrale', categorie: 'confort', icone: 'bi-snow' },
          { id: 3, nom: 'Groupe électrogène automatique', categorie: 'securite', icone: 'bi-lightning-charge' },
          { id: 4, nom: 'Réserve d\'eau & Surpresseur', categorie: 'confort', icone: 'bi-droplet-half' },
          { id: 5, nom: 'Wi-Fi Fibre Orange', categorie: 'technologie', icone: 'bi-wifi' },
          { id: 6, nom: 'Gardiennage & Caméras 24/7', categorie: 'securite', icone: 'bi-shield-check' }
        ],
        avis: [
          { id: 1, locataire_id: 1, logement_id: 1, note: 5, commentaire: 'Villa exceptionnelle aux Almadies. Service irréprochable et vue imprenable sur l\'océan.', est_modere: true, locataire: { id: 1, name: 'Mamadou Diop' } },
          { id: 2, locataire_id: 2, logement_id: 1, note: 5, commentaire: 'Cadre paradisiaque, le groupe électrogène est un énorme plus à Dakar.', est_modere: true, locataire: { id: 2, name: 'Aminata Diallo' } }
        ],
        admin: {
          id: 2,
          name: 'Ibrahima Sow',
          email: 'i.sow@teranga-immo.sn',
          raison_sociale: 'Teranga Prestige Immobilier Dakar'
        }
      },
      {
        id: 2,
        admin_id: 2,
        titre: 'Appartement Standing 4 Pièces - Fann Résidence Corniche Ouest',
        description: 'Superbe appartement de grand standing situé sur la Corniche Ouest à Fann Résidence. Grand balcon avec vue panoramique dégagée sur les Îles de la Madeleine. Salon lumineux, 3 chambres autonomes avec placards, cuisine aménagée avec îlot central, ascenseur et 2 places de parking sous-sol sécurisées.',
        type: 'appartement',
        adresse: 'Boulevard Martin Luther King, Fann Résidence',
        ville: 'Dakar',
        quartier: 'Fann Résidence',
        latitude: 14.6852,
        longitude: -17.4691,
        prix_par_mois: 650000,
        caution: 1300000,
        frais_service: 35000,
        nb_pieces: 4,
        surface: 145,
        meuble: true,
        statut: 'publie',
        est_occupe: false,
        statut_occupation: 'disponible',
        mode_reservation: 'immediate',
        politique_annulation: 'gratuite',
        image_principale: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
        note_moyenne: 4.88,
        nombre_avis: 14,
        photos: [
          { id: 201, logement_id: 2, url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', ordre: 1 },
          { id: 202, logement_id: 2, url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', ordre: 2 },
          { id: 203, logement_id: 2, url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80', ordre: 3 }
        ],
        equipements: [
          { id: 7, nom: 'Ascenseur', categorie: 'confort', icone: 'bi-arrow-up-square' },
          { id: 8, nom: 'Parking sous-sol fermé', categorie: 'confort', icone: 'bi-p-circle' },
          { id: 9, nom: 'Climatisation split', categorie: 'confort', icone: 'bi-snow' },
          { id: 10, nom: 'Surpresseur d\'eau', categorie: 'confort', icone: 'bi-droplet' },
          { id: 11, nom: 'Sécurité 24h/24', categorie: 'securite', icone: 'bi-shield-check' }
        ],
        avis: [
          { id: 3, locataire_id: 3, logement_id: 2, note: 5, commentaire: 'La vue sur la Corniche au coucher du soleil est magique. Quartier très sécurisé.', est_modere: true, locataire: { id: 3, name: 'Dr. Cheikh Ndiaye' } }
        ],
        admin: {
          id: 2,
          name: 'Aïssatou Ndiaye',
          email: 'contact@almadies-habitat.sn',
          raison_sociale: 'Almadies & Corniche Habitat'
        }
      },
      {
        id: 3,
        admin_id: 3,
        titre: 'Studio Cosy Meublé avec Balcon - Dakar Plateau Centre',
        description: 'Charmant studio moderne entièrement rénové et décoré dans un esprit contemporain sénégalais au cœur du Plateau de Dakar. Proche des ministères, banques et restaurants de la Place de l\'Indépendance. Kitchenette équipée, lit queen size, smart TV et connexion fibre optique.',
        type: 'studio',
        adresse: 'Rue Victor Hugo, Dakar Plateau',
        ville: 'Dakar',
        quartier: 'Plateau',
        latitude: 14.6675,
        longitude: -17.4328,
        prix_par_mois: 250000,
        caution: 250000,
        frais_service: 18000,
        nb_pieces: 1,
        surface: 42,
        meuble: true,
        statut: 'publie',
        est_occupe: true,
        statut_occupation: 'occupe',
        mode_reservation: 'immediate',
        politique_annulation: 'partielle',
        image_principale: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        note_moyenne: 4.80,
        nombre_avis: 11,
        photos: [
          { id: 301, logement_id: 3, url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', ordre: 1 },
          { id: 302, logement_id: 3, url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', ordre: 2 }
        ],
        equipements: [
          { id: 12, nom: 'Fibre Optique haut débit', categorie: 'technologie', icone: 'bi-wifi' },
          { id: 13, nom: 'Climatisation', categorie: 'confort', icone: 'bi-snow' },
          { id: 14, nom: 'Smart TV Netflix', categorie: 'multimedia', icone: 'bi-tv' },
          { id: 15, nom: 'Lave-linge privé', categorie: 'confort', icone: 'bi-washer' }
        ],
        avis: [
          { id: 4, locataire_id: 4, logement_id: 3, note: 5, commentaire: 'Idéal pour une mission professionnelle au Plateau. Calme et très propre.', est_modere: true, locataire: { id: 4, name: 'Sophie Laurent' } }
        ],
        admin: {
          id: 3,
          name: 'Ousmane Ba',
          email: 'o.ba@dakar-logis.sn',
          raison_sociale: 'Dakar Logis & Baux'
        }
      },
      {
        id: 4,
        admin_id: 2,
        titre: 'Villa Balnéaire Meublée avec Piscine & Jardin Tropical - Saly Portudal',
        description: 'Magnifique villa de vacances et résidence à Saly Portudal (Mbour), sur la Petite Côte sénégalaise. Grande terrasse ombragée bordée de bougainvilliers, piscine privative, cuisine équipée, 3 chambres climatisées. À 400 mètres de la plage et à 10 minutes du golf de Saly.',
        type: 'maison',
        adresse: 'Résidence du Golf, Saly Portudal, Mbour',
        ville: 'Saly',
        quartier: 'Saly Portudal',
        latitude: 14.4422,
        longitude: -16.9892,
        prix_par_mois: 550000,
        caution: 550000,
        frais_service: 30000,
        nb_pieces: 4,
        surface: 210,
        meuble: true,
        statut: 'publie',
        mode_reservation: 'sur_validation',
        politique_annulation: 'gratuite',
        image_principale: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        note_moyenne: 4.92,
        nombre_avis: 25,
        photos: [
          { id: 401, logement_id: 4, url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', ordre: 1 },
          { id: 402, logement_id: 4, url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80', ordre: 2 }
        ],
        equipements: [
          { id: 16, nom: 'Piscine & Transats', categorie: 'confort', icone: 'bi-water' },
          { id: 17, nom: 'Jardin arboré clos', categorie: 'confort', icone: 'bi-tree' },
          { id: 18, nom: 'Proche Plage (400m)', categorie: 'emplacement', icone: 'bi-sun' },
          { id: 19, nom: 'Barbecue extérieur', categorie: 'confort', icone: 'bi-fire' }
        ],
        avis: [
          { id: 5, locataire_id: 5, logement_id: 4, note: 5, commentaire: 'Séjour inoubliable à Saly. La maison est magnifique et la piscine très bien entretenue.', est_modere: true, locataire: { id: 5, name: 'Baye Fall' } }
        ],
        admin: {
          id: 2,
          name: 'Ibrahima Sow',
          email: 'i.sow@teranga-immo.sn',
          raison_sociale: 'Teranga Prestige Immobilier Dakar'
        }
      },
      {
        id: 5,
        admin_id: 3,
        titre: 'Appartement F3 Neuf Standing - Ngor Virage / Mamelles',
        description: 'Superbe appartement 3 pièces neuf avec vue sur le Phare des Mamelles et l\'Île de Ngor. Grand salon carrelé, cuisine américaine avec plan de travail en quartz, 2 chambres avec dressings, balcon aéré. Quartier branché avec restaurants de plage et accès direct à la Corniche des Almadies.',
        type: 'appartement',
        adresse: 'Route de la Corniche, Ngor Virage',
        ville: 'Dakar',
        quartier: 'Ngor',
        latitude: 14.7501,
        longitude: -17.5084,
        prix_par_mois: 390000,
        caution: 780000,
        frais_service: 25000,
        nb_pieces: 3,
        surface: 98,
        meuble: true,
        statut: 'publie',
        est_occupe: false,
        statut_occupation: 'disponible',
        mode_reservation: 'immediate',
        politique_annulation: 'gratuite',
        image_principale: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        note_moyenne: 4.85,
        nombre_avis: 9,
        photos: [
          { id: 501, logement_id: 5, url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', ordre: 1 },
          { id: 502, logement_id: 5, url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', ordre: 2 }
        ],
        equipements: [
          { id: 20, nom: 'Vue Phare des Mamelles', categorie: 'emplacement', icone: 'bi-eye' },
          { id: 21, nom: 'Climatisation', categorie: 'confort', icone: 'bi-snow' },
          { id: 22, nom: 'Cuisine équipée', categorie: 'cuisine', icone: 'bi-cup-hot' },
          { id: 23, nom: 'Gardien 24h', categorie: 'securite', icone: 'bi-shield-check' }
        ],
        avis: [
          { id: 6, locataire_id: 6, logement_id: 5, note: 5, commentaire: 'Emplacement de rêve à Ngor Virage. Très lumineux et sécurisé.', est_modere: true, locataire: { id: 6, name: 'Khadija Kane' } }
        ],
        admin: {
          id: 3,
          name: 'Ousmane Ba',
          email: 'o.ba@dakar-logis.sn',
          raison_sociale: 'Dakar Logis & Baux'
        }
      },
      {
        id: 6,
        admin_id: 2,
        titre: 'Chambre Meublée Confort en Résidence - Point E',
        description: 'Chambre autonome haut de gamme dans une résidence moderne au Point E, à proximité de l\'Université Cheikh Anta Diop (UCAD) et de l\'Ambassade de France. Lit double, bureau de travail, salle d\'eau privative et climatisation. Cuisine et grand salon partagés avec ménage régulier.',
        type: 'chambre',
        adresse: 'Rue de Diourbel, Point E',
        ville: 'Dakar',
        quartier: 'Point E',
        latitude: 14.6980,
        longitude: -17.4582,
        prix_par_mois: 140000,
        caution: 140000,
        frais_service: 12000,
        nb_pieces: 1,
        surface: 28,
        meuble: true,
        statut: 'publie',
        est_occupe: false,
        statut_occupation: 'disponible',
        mode_reservation: 'immediate',
        politique_annulation: 'non_remboursable',
        image_principale: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
        note_moyenne: 4.75,
        nombre_avis: 8,
        photos: [
          { id: 601, logement_id: 6, url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80', ordre: 1 }
        ],
        equipements: [
          { id: 24, nom: 'Wi-Fi Fibre', categorie: 'technologie', icone: 'bi-wifi' },
          { id: 25, nom: 'Climatiseur', categorie: 'confort', icone: 'bi-snow' },
          { id: 26, nom: 'Bureau de télétravail', categorie: 'mobilier', icone: 'bi-laptop' },
          { id: 27, nom: 'Ménage inclus 2x/semaine', categorie: 'service', icone: 'bi-stars' }
        ],
        avis: [
          { id: 7, locataire_id: 7, logement_id: 6, note: 5, commentaire: 'Point E est le meilleur quartier de Dakar. Chambre très confortable.', est_modere: true, locataire: { id: 7, name: 'Moussa Seck' } }
        ],
        admin: {
          id: 2,
          name: 'Aïssatou Ndiaye',
          email: 'contact@almadies-habitat.sn',
          raison_sociale: 'Almadies & Corniche Habitat'
        }
      }
    ];
  }

  // ─────────────────────────────────────────────
  // RF-10 à RF-13 : Recherche avec filtres et fallback immédiat
  // ─────────────────────────────────────────────
  getLogements(filters: any = {}): Observable<Logement[]> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      const val = filters[key];
      if (val !== null && val !== undefined && val !== '' && val !== 'tous' && val !== 'toutes') {
        params = params.set(key, val);
      }
    });

    return this.http.get<Logement[]>(`${this.apiUrl}/logements`, { params }).pipe(
      map((list: Logement[]) => list.map(l => {
        const isOcc = this.estLogementOccupe(l.id);
        const log: Logement = { ...l, est_occupe: isOcc, statut_occupation: isOcc ? 'occupe' : 'disponible' };
        return log;
      })),
      catchError(() => {
        // En cas d'indisponibilité de l'API Laravel : filtres appliqués sur le catalogue local
        let result = this.getSenegalCatalog();
        if (filters.q && filters.q.trim()) {
          const q = filters.q.toLowerCase().trim();
          result = result.filter(l =>
            l.titre.toLowerCase().includes(q) ||
            l.ville.toLowerCase().includes(q) ||
            (l.quartier && l.quartier.toLowerCase().includes(q)) ||
            l.adresse.toLowerCase().includes(q)
          );
        }
        if (filters.type && filters.type !== 'tous') {
          result = result.filter(l => l.type === filters.type);
        }
        if (filters.prix_max && Number(filters.prix_max) > 0) {
          result = result.filter(l => l.prix_par_mois <= Number(filters.prix_max));
        }
        return of(result);
      })
    );
  }

  // RF-14 : Détail logement avec garantie de chargement immédiat
  getLogement(id: number): Observable<Logement> {
    return this.http.get<Logement>(`${this.apiUrl}/logements/${id}`).pipe(
      map((l: Logement) => {
        const isOcc = this.estLogementOccupe(l.id);
        const log: Logement = { ...l, est_occupe: isOcc, statut_occupation: isOcc ? 'occupe' : 'disponible' };
        return log;
      }),
      catchError(() => {
        return of(this.getLogementSync(id));
      })
    );
  }

  // Méthode synchrone d'accès direct pour affichage instantané sans latence
  getLogementSync(id: number): Logement {
    const found = this.catalogueLogements.find(l => l.id === Number(id)) || this.catalogueLogements[0];
    
    const isOcc = this.estLogementOccupe(found.id);
    return {
      ...found,
      est_occupe: isOcc,
      statut_occupation: isOcc ? 'occupe' : 'disponible'
    };
  }

  // Retourne le catalogue complet avec statuts d'occupation dynamiques
  getSenegalCatalog(): Logement[] {
    const occList = this.getOccupiedIdsFromStorage();
    return this.catalogueLogements.map(l => {
      const isOcc = occList.includes(l.id) || !!l.est_occupe;
      return {
        ...l,
        est_occupe: isOcc,
        statut_occupation: isOcc ? 'occupe' : 'disponible'
      };
    });
  }

  // Marque un logement comme occupé dans le catalogue et persiste la modification
  public marquerLogementOccupe(id: number): void {
    const log = this.catalogueLogements.find(l => l.id === id);
    if (log) {
      log.est_occupe = true;
      log.statut_occupation = 'occupe';
    }
    const occList = this.getOccupiedIdsFromStorage();
    if (!occList.includes(id)) {
      occList.push(id);
      try {
        localStorage.setItem('logementplus_occupied_ids', JSON.stringify(occList));
      } catch (e) {}
    }
    this.saveCatalogToStorage();
  }

  public estLogementOccupe(id: number): boolean {
    const occList = this.getOccupiedIdsFromStorage();
    if (occList.includes(id)) return true;
    const log = this.catalogueLogements.find(l => l.id === id);
    return !!(log?.est_occupe || log?.statut_occupation === 'occupe');
  }

  private getOccupiedIdsFromStorage(): number[] {
    try {
      const saved = localStorage.getItem('logementplus_occupied_ids');
      return saved ? JSON.parse(saved) : [3];
    } catch {
      return [3];
    }
  }

  // RF-11 : Liste des équipements
  getEquipements(): Observable<Equipement[]> {
    return this.http.get<Equipement[]>(`${this.apiUrl}/equipements`).pipe(
      catchError(() => of([
        { id: 1, nom: 'Climatisation', categorie: 'confort', icone: 'bi-snow' },
        { id: 2, nom: 'Groupe électrogène automatique', categorie: 'securite', icone: 'bi-lightning-charge' },
        { id: 3, nom: 'Réserve d\'eau & Surpresseur', categorie: 'confort', icone: 'bi-droplet-half' },
        { id: 4, nom: 'Piscine', categorie: 'confort', icone: 'bi-water' },
        { id: 5, nom: 'Wi-Fi Fibre Orange', categorie: 'technologie', icone: 'bi-wifi' },
        { id: 6, nom: 'Gardiennage 24/7', categorie: 'securite', icone: 'bi-shield-check' }
      ]))
    );
  }

  // RF-40 : Logements du gestionnaire connecté
  getMesLogements(): Observable<Logement[]> {
    const headers = this.auth.getAuthHeaders();
    return this.http.get<Logement[]>(`${this.apiUrl}/admin/logements`, { headers }).pipe(
      catchError(() => {
        // Fallback : filtrer par admin_id de l'utilisateur connecté
        const user = this.auth.currentUser();
        const adminId = user?.id;
        const mesLogements = adminId
          ? this.catalogueLogements.filter(l => l.admin_id === adminId)
          : this.catalogueLogements.slice(0, 3);
        return of(mesLogements);
      })
    );
  }

  // Création d'un logement : ajout local immédiat + tentative API
  createLogement(data: any): Observable<Logement> {
    const headers = this.auth.getAuthHeaders();
    const user = this.auth.currentUser();

    const newLogement: Logement = {
      id: Date.now(),
      ...data,
      admin_id: user?.id || 2,
      admin: {
        id: user?.id || 2,
        name: user?.name || 'Gestionnaire',
        email: (user as any)?.email || '',
        raison_sociale: data.raison_sociale || 'Agence Immobilière'
      },
      statut_occupation: 'disponible',
      est_occupe: false,
      note_moyenne: 0,
      nombre_avis: 0,
      avis: []
    };

    // Ajout immédiat dans le catalogue local
    this.catalogueLogements.unshift(newLogement);
    this.saveCatalogToStorage();

    return this.http.post<Logement>(`${this.apiUrl}/admin/logements`, data, { headers }).pipe(
      catchError(() => of(newLogement))
    );
  }

  toggleStatut(id: number): Observable<any> {
    const headers = this.auth.getAuthHeaders();

    // Mise à jour locale immédiate
    const log = this.catalogueLogements.find(l => l.id === id);
    if (log) {
      log.statut = log.statut === 'publie' ? 'brouillon' : 'publie';
      this.saveCatalogToStorage();
    }

    return this.http.patch(`${this.apiUrl}/admin/logements/${id}/toggle-statut`, {}, { headers }).pipe(
      catchError(() => of({ id, statut: log?.statut, logement: log }))
    );
  }

  // Dépôt dynamique d'un avis locataire sur un logement
  ajouterAvisLogement(logementId: number, note: number, commentaire: string, locataire: { id: number; name: string }): Observable<any> {
    const targetLogement = this.catalogueLogements.find(l => l.id === Number(logementId));

    const nouvelAvis: Avis = {
      id: Date.now(),
      locataire_id: locataire.id,
      logement_id: logementId,
      note: Number(note),
      commentaire: commentaire.trim(),
      est_modere: true,
      created_at: new Date().toISOString(),
      locataire: { id: locataire.id, name: locataire.name }
    };

    if (targetLogement) {
      if (!targetLogement.avis) {
        targetLogement.avis = [];
      }
      targetLogement.avis.unshift(nouvelAvis);

      // Recalcul dynamique de la note moyenne et du nombre d'avis
      const totalNotes = targetLogement.avis.reduce((sum, a) => sum + (Number(a.note) || 5), 0);
      targetLogement.note_moyenne = Number((totalNotes / targetLogement.avis.length).toFixed(2));
      targetLogement.nombre_avis = targetLogement.avis.length;

      this.saveCatalogToStorage();
    }

    const headers = this.auth.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/logements/${logementId}/avis`, {
      note: Number(note),
      commentaire: commentaire.trim()
    }, { headers }).pipe(
      catchError(() => of({ avis: nouvelAvis }))
    );
  }

  // Calcul dynamique des logements par quartier depuis la base de données
  getQuartiers(): Observable<Neighborhood[]> {
    return this.http.get<Neighborhood[]>(`${this.apiUrl}/quartiers`).pipe(
      tap(data => {
        if (data && data.length > 0) {
          // Synchronisation réussie avec l'API
        }
      }),
      catchError(() => of(this.computeNeighborhoodsSync()))
    );
  }

  // Méthode de calcul synchrone en direct basée sur les logements réels du catalogue
  computeNeighborhoodsSync(logements?: Logement[]): Neighborhood[] {
    const list = logements || this.catalogueLogements;

    const baseZones: { name: string; tag: string; label: string; image: string; pattern: string }[] = [
      {
        name: 'Almadies',
        tag: 'Prestige',
        label: 'Pointe des Almadies & Ambassades',
        image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80',
        pattern: 'almadies'
      },
      {
        name: 'Fann Résidence',
        tag: 'Résidentiel',
        label: 'Corniche Ouest & Vue Mer',
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
        pattern: 'fann'
      },
      {
        name: 'Plateau',
        tag: 'Affaires',
        label: 'Centre d\'Affaires & Ministères',
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
        pattern: 'plateau'
      },
      {
        name: 'Ngor',
        tag: 'Bord de mer',
        label: 'Ngor Virage & Phare des Mamelles',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
        pattern: 'ngor'
      },
      {
        name: 'Point E',
        tag: 'Central',
        label: 'Point E & UCAD',
        image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80',
        pattern: 'point e'
      },
      {
        name: 'Saly Portudal',
        tag: 'Détente',
        label: 'Villas Balnéaires & Petite Côte',
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
        pattern: 'saly'
      }
    ];

    return baseZones.map(zone => {
      const p = zone.pattern.toLowerCase();
      // Comptage dynamique temps réel sur la liste effective des logements publiés
      const count = list.filter(l => {
        const q = (l.quartier || '').toLowerCase();
        const v = (l.ville || '').toLowerCase();
        const t = (l.titre || '').toLowerCase();
        return q.includes(p) || v.includes(p) || t.includes(p);
      }).length;

      // Utilise la photo d'un logement existant si disponible
      const matchingLogement = list.find(l => {
        const q = (l.quartier || '').toLowerCase();
        const v = (l.ville || '').toLowerCase();
        const t = (l.titre || '').toLowerCase();
        return q.includes(p) || v.includes(p) || t.includes(p);
      });

      return {
        name: zone.name,
        count: count,
        tag: zone.tag,
        label: zone.label,
        image: matchingLogement?.image_principale || zone.image
      };
    });
  }
}
