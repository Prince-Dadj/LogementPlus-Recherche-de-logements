import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError, tap, map } from 'rxjs';
import { Avis, Equipement, Logement, Neighborhood } from '../models/models';
import { AuthService } from './auth.service';
import { geocodeSenegal } from '../utils/geocoding';

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
  public isLogementSupprime(l: any): boolean {
    if (!l) return false;
    const adminName = (l.admin?.name || '').toLowerCase();
    const adminEmail = (l.admin?.email || '').toLowerCase();
    const titre = (l.titre || '').toLowerCase();
    const quartier = (l.quartier || '').toLowerCase();
    const ville = (l.ville || '').toLowerCase();

    // Gestionnaires ciblés à supprimer totalement
    if (adminName.includes('moussa ndiaye') || adminName.includes('cocody confort') || adminName.includes('ivoire habitat')) {
      return true;
    }
    if (adminEmail === 'admin1@example.com' || adminEmail === 'admin@ivoire-habitat.com' || adminEmail === 'contact@residence-cocody.ci') {
      return true;
    }
    // Logements liés à ces gestionnaires (ex-Abidjan et logements de Moussa Ndiaye)
    if (Number(l.admin_id) === 8 || Number(l.admin_id) === 3 || (Number(l.admin_id) === 2 && (ville.includes('abidjan') || quartier.includes('cocody')))) {
      return true;
    }
    if (titre.includes('cocody') || titre.includes('dokui') || titre.includes('riviera golf') || titre.includes('marcory zone 4') || titre.includes('villa prestige avec piscine & vue océan - les almadies')) {
      return true;
    }
    return false;
  }

  private initCatalog(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.catalogueLogements = parsed
            .filter((item: any) => !this.isLogementSupprime(item))
            .map((item: any) => {
              if (item.titre?.includes('1AG1') || item.quartier?.toLowerCase().includes('saint-louis') || item.quartier === 'Sanar' || item.quartier === 'Ngallèle') {
                item.ville = 'Saint-Louis';
              }
              // Corriger les coordonnées imprécises ou hors Sénégal (ex: Abidjan lat ~ 5.3)
              if (!item.latitude || !item.longitude || item.latitude < 11 || item.latitude > 18) {
                const geo = geocodeSenegal(item.ville, item.quartier);
                item.latitude = geo.lat;
                item.longitude = geo.lng;
              }
              return item;
            });
          this.saveCatalogToStorage();
          return;
        }
      }
    } catch (e) {
      // Erreur de parsing : on utilise le seed
    }
    // Premier lancement ou données corrompues : seed initial
    //this.catalogueLogements = this.getSeedCatalogue();
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
      tap((list: Logement[]) => {
        if (list && list.length > 0) {
          list.forEach(item => {
            const idx = this.catalogueLogements.findIndex(c => c.id === item.id);
            if (idx !== -1) {
              this.catalogueLogements[idx] = { ...this.catalogueLogements[idx], ...item };
            } else {
              this.catalogueLogements.push(item);
            }
          });
          this.saveCatalogToStorage();
        }
      }),
      map((list: Logement[]) => {
        const enhancedBackend: Logement[] = (list || []).map(l => {
          const isOcc = this.estLogementOccupe(l.id);
          const occStatus: 'occupe' | 'disponible' = isOcc ? 'occupe' : 'disponible';
          return { ...l, est_occupe: isOcc, statut_occupation: occStatus };
        });

        const backendIds = new Set(enhancedBackend.map(b => b.id));
        const localPublies: Logement[] = this.catalogueLogements
          .filter(l => l.statut === 'publie' && !backendIds.has(l.id))
          .map(l => {
            const isOcc = this.estLogementOccupe(l.id);
            const occStatus: 'occupe' | 'disponible' = isOcc ? 'occupe' : 'disponible';
            return { ...l, est_occupe: isOcc, statut_occupation: occStatus };
          });

        const all: Logement[] = [...enhancedBackend, ...localPublies];
        return this.filterLogementsList(all, filters);
      }),
      catchError(() => {
        const catalog = this.getSenegalCatalog();
        return of(this.filterLogementsList(catalog, filters));
      })
    );
  }

  // ─────────────────────────────────────────────
  // Filtrage précis et rigoureux multi-critères
  // ─────────────────────────────────────────────
  filterLogementsList(list: Logement[], filters: any = {}): Logement[] {
    let result = (list || []).filter(l => l.statut === 'publie' && !this.isLogementSupprime(l));

    // 1. Recherche plein texte
    if (filters.q && filters.q.trim()) {
      const q = filters.q.toLowerCase().trim();
      result = result.filter(l =>
        (l.titre && l.titre.toLowerCase().includes(q)) ||
        (l.description && l.description.toLowerCase().includes(q)) ||
        (l.ville && l.ville.toLowerCase().includes(q)) ||
        (l.quartier && l.quartier.toLowerCase().includes(q)) ||
        (l.adresse && l.adresse.toLowerCase().includes(q))
      );
    }

    // 2. Ville exacte
    if (filters.ville && filters.ville !== 'toutes' && filters.ville !== 'tous') {
      const v = filters.ville.toLowerCase().trim();
      result = result.filter(l => (l.ville || '').toLowerCase().trim() === v);
    }

    // 3. Quartier
    if (filters.quartier && filters.quartier !== 'tous' && filters.quartier.trim()) {
      const q = filters.quartier.toLowerCase().trim();
      result = result.filter(l => (l.quartier || '').toLowerCase().trim().includes(q));
    }

    // 4. Type de bien
    if (filters.type && filters.type !== 'tous' && filters.type !== 'toutes') {
      result = result.filter(l => (l.type || '').toLowerCase() === filters.type.toLowerCase());
    }

    // 5. Fourchette de prix : Min & Max
    if (filters.prix_min !== null && filters.prix_min !== undefined && Number(filters.prix_min) > 0) {
      result = result.filter(l => Number(l.prix_par_mois) >= Number(filters.prix_min));
    }
    if (filters.prix_max !== null && filters.prix_max !== undefined && Number(filters.prix_max) > 0) {
      result = result.filter(l => Number(l.prix_par_mois) <= Number(filters.prix_max));
    }

    // 6. Surface : Min & Max
    if (filters.surface_min !== null && filters.surface_min !== undefined && Number(filters.surface_min) > 0) {
      result = result.filter(l => Number(l.surface) >= Number(filters.surface_min));
    }
    if (filters.surface_max !== null && filters.surface_max !== undefined && Number(filters.surface_max) > 0) {
      result = result.filter(l => Number(l.surface) <= Number(filters.surface_max));
    }

    // 7. Nombre de pièces min
    if (filters.nb_pieces !== null && filters.nb_pieces !== undefined && Number(filters.nb_pieces) > 0) {
      result = result.filter(l => Number(l.nb_pieces || 1) >= Number(filters.nb_pieces));
    }

    // 8. Meublé (true, false, ou 'tous')
    if (filters.meuble !== null && filters.meuble !== undefined && filters.meuble !== '' && filters.meuble !== 'tous') {
      const meubleBool = String(filters.meuble) === 'true';
      result = result.filter(l => !!l.meuble === meubleBool);
    }

    // 9. Disponibilité
    if (filters.disponibilite === 'disponible') {
      result = result.filter(l => !l.est_occupe && l.statut_occupation !== 'occupe');
    }

    // 10. Mode réservation
    if (filters.mode_reservation && filters.mode_reservation !== 'tous') {
      result = result.filter(l => l.mode_reservation === filters.mode_reservation);
    }

    // 11. Équipements
    if (filters.equipements) {
      const eqReq: string[] = Array.isArray(filters.equipements)
        ? filters.equipements.map((x: any) => String(x).toLowerCase().trim())
        : String(filters.equipements).split(',').map(s => s.toLowerCase().trim()).filter(Boolean);

      if (eqReq.length > 0) {
        result = result.filter(l => {
          const logEqNoms = (l.equipements || []).map((e: any) => (e.nom || e.name || '').toLowerCase().trim());
          const logEqIds = (l.equipements || []).map((e: any) => String(e.id));
          return eqReq.every(req => logEqIds.includes(req) || logEqNoms.some(n => n.includes(req)));
        });
      }
    }

    // 12. Tri précis
    const tri = filters.tri || 'pertinence';
    if (tri === 'prix_asc') {
      result.sort((a, b) => Number(a.prix_par_mois) - Number(b.prix_par_mois));
    } else if (tri === 'prix_desc') {
      result.sort((a, b) => Number(b.prix_par_mois) - Number(a.prix_par_mois));
    } else if (tri === 'surface_asc') {
      result.sort((a, b) => Number(a.surface) - Number(b.surface));
    } else if (tri === 'surface_desc') {
      result.sort((a, b) => Number(b.surface) - Number(a.surface));
    } else if (tri === 'recent') {
      result.sort((a, b) => Number(b.id) - Number(a.id));
    } else if (tri === 'note') {
      result.sort((a, b) => (Number(b.note_moyenne) || 0) - (Number(a.note_moyenne) || 0));
    }

    return result;
  }

  // RF-14 : Détail logement avec garantie de chargement immédiat
  getLogement(id: number): Observable<Logement> {
    return this.http.get<Logement>(`${this.apiUrl}/logements/${id}`).pipe(
      tap((l: Logement) => {
        if (l) {
          const idx = this.catalogueLogements.findIndex(c => c.id === l.id);
          if (idx !== -1) {
            this.catalogueLogements[idx] = { ...this.catalogueLogements[idx], ...l };
          } else {
            this.catalogueLogements.unshift(l);
          }
          this.saveCatalogToStorage();
        }
      }),
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
    return this.catalogueLogements.filter(l => !this.isLogementSupprime(l)).map(l => {
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
      map(backendLogements => {
        const list = Array.isArray(backendLogements) ? backendLogements : [];
        const backendIds = new Set(list.map(l => l.id));
        const user = this.auth.currentUser();
        const adminId = user?.id;
        const isSuperAdmin = user?.role === 'superadmin';

        // Conserver les logements créés localement qui ne sont pas encore en base ou en cas de divergence
        const localItems = this.catalogueLogements.filter(l => {
          if (this.isLogementSupprime(l)) return false;
          if (backendIds.has(l.id)) return false;
          if (isSuperAdmin) return true;
          return !adminId || l.admin_id === adminId || l.admin?.id === adminId;
        });

        return [...list.filter(l => !this.isLogementSupprime(l)), ...localItems];
      }),
      catchError(() => {
        // Fallback : filtrer par admin_id de l'utilisateur connecté
        const user = this.auth.currentUser();
        const adminId = user?.id;
        const isSuperAdmin = user?.role === 'superadmin';
        const validLocal = this.catalogueLogements.filter(l => !this.isLogementSupprime(l));
        const mesLogements = isSuperAdmin
          ? validLocal
          : (adminId
            ? validLocal.filter(l => l.admin_id === adminId || l.admin?.id === adminId)
            : validLocal.slice(0, 3));
        return of(mesLogements);
      })
    );
  }

  // Création d'un logement : ajout local immédiat + synchronisation API robuste
  createLogement(data: any): Observable<Logement> {
    const headers = this.auth.getAuthHeaders();
    const user = this.auth.currentUser();

    // Normalisation des enums pour le backend
    if (data.mode_reservation === 'sur_demande') {
      data.mode_reservation = 'sur_validation';
    }
    if (data.politique_annulation === 'moderee') {
      data.politique_annulation = 'partielle';
    } else if (data.politique_annulation === 'stricte') {
      data.politique_annulation = 'non_remboursable';
    }

    // Résolution précise des coordonnées géographiques au Sénégal
    if (!data.latitude || !data.longitude || data.latitude < 11 || data.latitude > 18) {
      const geo = geocodeSenegal(data.ville, data.quartier);
      data.latitude = geo.lat;
      data.longitude = geo.lng;
    }

    // Préparer les photos : convertir les data URLs (upload local) en objets Photo
    const photos = (data.photos || []).filter((p: string) => p && p.trim()).map((url: string, i: number) => ({
      id: Date.now() + i,
      logement_id: 0,
      url: url,
      ordre: i + 1
    }));

    let equipementsNoms: string[] = [];
    if (Array.isArray(data.equipements_liste) && data.equipements_liste.length > 0) {
      equipementsNoms = data.equipements_liste;
    } else if (typeof data.equipements_texte === 'string' && data.equipements_texte.trim()) {
      equipementsNoms = data.equipements_texte.split(',').map((s: string) => s.trim()).filter((s: string) => !!s);
    } else if (typeof data.equipements === 'string' && data.equipements.trim()) {
      equipementsNoms = data.equipements.split(',').map((s: string) => s.trim()).filter((s: string) => !!s);
    }
    const equipementsObj = equipementsNoms.map((nom: string, i: number) => ({
      id: Date.now() + i + 100,
      nom,
      categorie: 'confort',
      icone: 'bi-check-circle'
    }));

    const statutParDefaut = data.statut || 'hors_ligne';
    data.statut = statutParDefaut;

    const currentAdminId = user?.id || 7;
    const newLogement: Logement = {
      id: Date.now(),
      ...data,
      statut: statutParDefaut,
      admin_id: currentAdminId,
      admin: {
        id: currentAdminId,
        name: user?.name || 'Gestionnaire',
        email: (user as any)?.email || '',
        raison_sociale: data.raison_sociale || 'Agence Immobilière'
      },
      photos: photos,
      equipements: equipementsObj,
      image_principale: photos[0]?.url || data.image_principale || '',
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
      tap((created) => {
        if (created && created.id) {
          const idx = this.catalogueLogements.findIndex(l => l.id === newLogement.id);
          const fullCreated = { ...newLogement, ...created };
          if (idx !== -1) {
            this.catalogueLogements[idx] = fullCreated;
          } else {
            this.catalogueLogements.unshift(fullCreated);
          }
          this.saveCatalogToStorage();
        }
      }),
      catchError((err) => {
        console.warn('API non joignable ou erreur création logement, conservation en local:', err);
        return of(newLogement);
      })
    );
  }

  updateLogement(id: number, data: any): Observable<Logement> {
    const headers = this.auth.getAuthHeaders();

    // Normalisation des enums pour le backend
    if (data.mode_reservation === 'sur_demande') {
      data.mode_reservation = 'sur_validation';
    }
    if (data.politique_annulation === 'moderee') {
      data.politique_annulation = 'partielle';
    } else if (data.politique_annulation === 'stricte') {
      data.politique_annulation = 'non_remboursable';
    }

    // Résolution précise des coordonnées géographiques au Sénégal
    if (!data.latitude || !data.longitude || data.latitude < 11 || data.latitude > 18) {
      const geo = geocodeSenegal(data.ville, data.quartier);
      data.latitude = geo.lat;
      data.longitude = geo.lng;
    }

    const photos = (data.photos || []).filter((p: string) => p && p.trim()).map((url: string, i: number) => ({
      id: Date.now() + i,
      logement_id: id,
      url: url,
      ordre: i + 1
    }));

    let equipementsNoms: string[] = [];
    if (Array.isArray(data.equipements_liste) && data.equipements_liste.length > 0) {
      equipementsNoms = data.equipements_liste;
    } else if (typeof data.equipements_texte === 'string' && data.equipements_texte.trim()) {
      equipementsNoms = data.equipements_texte.split(',').map((s: string) => s.trim()).filter((s: string) => !!s);
    } else if (typeof data.equipements === 'string' && data.equipements.trim()) {
      equipementsNoms = data.equipements.split(',').map((s: string) => s.trim()).filter((s: string) => !!s);
    }
    const equipementsObj = equipementsNoms.map((nom: string, i: number) => ({
      id: Date.now() + i + 100,
      nom,
      categorie: 'confort',
      icone: 'bi-check-circle'
    }));

    // Mise à jour locale immédiate
    const idx = this.catalogueLogements.findIndex(l => l.id === id);
    if (idx !== -1) {
      this.catalogueLogements[idx] = {
        ...this.catalogueLogements[idx],
        ...data,
        photos: photos.length > 0 ? photos : this.catalogueLogements[idx].photos,
        equipements: equipementsObj.length > 0 ? equipementsObj : this.catalogueLogements[idx].equipements,
        image_principale: photos[0]?.url || this.catalogueLogements[idx].image_principale
      };
      this.saveCatalogToStorage();
    }

    const updated = this.catalogueLogements[idx];
    return this.http.put<Logement>(`${this.apiUrl}/admin/logements/${id}`, data, { headers }).pipe(
      tap((updatedServer) => {
        if (updatedServer) {
          const i = this.catalogueLogements.findIndex(l => l.id === id);
          if (i !== -1) {
            this.catalogueLogements[i] = { ...this.catalogueLogements[i], ...updatedServer };
            this.saveCatalogToStorage();
          }
        }
      }),
      catchError(() => of(updated))
    );
  }

  deleteLogement(id: number): Observable<any> {
    const headers = this.auth.getAuthHeaders();

    // Suppression locale immédiate
    this.catalogueLogements = this.catalogueLogements.filter(l => l.id !== id);
    this.saveCatalogToStorage();

    return this.http.delete(`${this.apiUrl}/admin/logements/${id}`, { headers }).pipe(
      catchError(() => of({ success: true, id }))
    );
  }

  toggleStatut(id: number): Observable<any> {
    const headers = this.auth.getAuthHeaders();

    // Mise à jour locale immédiate
    const log = this.catalogueLogements.find(l => l.id === id);
    if (log) {
      log.statut = log.statut === 'publie' ? 'hors_ligne' : 'publie';
      this.saveCatalogToStorage();
    }

    return this.http.patch(`${this.apiUrl}/admin/logements/${id}/toggle-statut`, {}, { headers }).pipe(
      tap((res: any) => {
        if (res?.logement?.statut && log) {
          log.statut = res.logement.statut;
          this.saveCatalogToStorage();
        }
      }),
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

  // Méthode de calcul synchrone en direct basée sur les logements réels du catalogue et de la base de données
  computeNeighborhoodsSync(logements?: Logement[]): Neighborhood[] {
    const list = (logements && logements.length > 0) ? logements : this.catalogueLogements;
    if (!list || list.length === 0) return [];

    // Regroupement dynamique par quartier & ville depuis les logements réels de la BDD
    const map = new Map<string, Neighborhood>();

    for (const log of list) {
      const q = (log.quartier || '').trim();
      const v = (log.ville || '').trim() || 'Sénégal';
      if (!q) continue;

      const key = `${q.toLowerCase()}_${v.toLowerCase()}`;
      if (!map.has(key)) {
        let tag = v;
        const qLower = q.toLowerCase();
        if (qLower.includes('almadies')) tag = 'Prestige';
        else if (qLower.includes('fann')) tag = 'Résidentiel';
        else if (qLower.includes('plateau')) tag = 'Affaires';
        else if (qLower.includes('ngor')) tag = 'Bord de mer';
        else if (qLower.includes('saly')) tag = 'Détente';
        else if (qLower.includes('sanar') || qLower.includes('ugb')) tag = 'Saint-Louis';
        else if (qLower.includes('ngallele') || qLower.includes('ngallèle')) tag = 'Saint-Louis';
        else if (qLower.includes('sor')) tag = 'Saint-Louis';
        else if (qLower.includes('point e')) tag = 'Central';

        map.set(key, {
          name: q,
          count: 0,
          ville: v,
          tag: tag,
          label: `${q} • ${v}`,
          image: log.image_principale || 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=600&q=80'
        });
      }

      const entry = map.get(key)!;
      entry.count++;
      if ((!entry.image || entry.image.includes('unsplash')) && log.image_principale) {
        entry.image = log.image_principale;
      }
    }

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }
}
