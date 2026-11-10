import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Temoignage } from '../models/models';

const INITIAL_TEMOIGNAGES: Temoignage[] = [
  {
    id: 1,
    nom_auteur: 'Fatou Diop',
    role_auteur: 'locataire',
    ville: 'Fann Résidence (Corniche)',
    note: 5,
    commentaire: "J'ai trouvé mon appartement 4 pièces à Fann Résidence en 48 heures. Le contrat PDF était prêt instantanément et le paiement Wave a été débité en 10 secondes. Service remarquable !",
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    badge: '✓ Avis Vérifié',
    est_affiche: true,
    est_verifie: true,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    nom_auteur: 'Mamadou Sy',
    role_auteur: 'locataire',
    ville: 'Les Almadies, Dakar',
    note: 5,
    commentaire: "À mon arrivée à Dakar, la garantie anti-délestage était ma priorité numéro 1. La villa aux Almadies dispose d'un groupe automatique silencieux et d'une bâche d'eau impeccable. Bravo à l'équipe.",
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    badge: '✓ Avis Vérifié',
    est_affiche: true,
    est_verifie: true,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    nom_auteur: 'El Hadj Ndiaye',
    role_auteur: 'gestionnaire',
    ville: 'Saly Portudal',
    note: 5,
    commentaire: "En tant que propriétaire bailleur de deux villas à Saly, la plateforme me permet de louer à des locataires vérifiés et de recevoir les loyers à date fixe sans aucun retard.",
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    badge: '✓ Bailleur Certifié',
    est_affiche: true,
    est_verifie: true,
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    nom_auteur: 'Dakar Immo Pro (Directeur)',
    role_auteur: 'agence',
    ville: 'Dakar Plateau',
    note: 5,
    commentaire: "Notre partenariat avec SanarHousings nous a permis de digitaliser 100% de nos mandats de gestion. La solvabilité des locataires est vérifiée et les litiges sont nuls.",
    avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
    badge: '✓ Agence Partenaire',
    est_affiche: true,
    est_verifie: true,
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    nom_auteur: 'Aissatou Bâ',
    role_auteur: 'locataire',
    ville: 'Dakar Plateau Centre',
    note: 5,
    commentaire: "Le dossier locataire numérique m'a ouvert les portes d'un studio au Plateau sans me déplacer. Tout est digital, rapide et sécurisé. Je recommande fortement SanarHousings.",
    avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80',
    badge: '✓ Avis Vérifié',
    est_affiche: true,
    est_verifie: true,
    created_at: new Date().toISOString()
  },
  {
    id: 6,
    nom_auteur: 'Moussa Traoré',
    role_auteur: 'locataire',
    ville: 'Ngor Virage',
    note: 5,
    commentaire: "Expatrié depuis Paris, j'ai signé mon bail et payé ma caution à distance via Wave. À mon arrivée à Dakar, les clés étaient prêtes. Une expérience sans stress, vraiment.",
    avatar_url: 'https://images.unsplash.com/photo-1542909168-82c3e7fdebef?auto=format&fit=crop&w=150&q=80',
    badge: '✓ Diaspora Certifié',
    est_affiche: true,
    est_verifie: true,
    created_at: new Date().toISOString()
  }
];

@Injectable({
  providedIn: 'root'
})
export class TemoignageService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api';
  private storageKey = 'logementplus_temoignages_v1';

  private temoignagesSubject = new BehaviorSubject<Temoignage[]>(this.loadFromStorage());
  public temoignages$ = this.temoignagesSubject.asObservable();

  constructor() {
    this.refresh();
  }

  private loadFromStorage(): Temoignage[] {
    const saved = localStorage.getItem(this.storageKey);
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // En cas d'erreur de parse
      }
    }
    this.saveToStorage(INITIAL_TEMOIGNAGES);
    return INITIAL_TEMOIGNAGES;
  }

  private saveToStorage(temoignages: Temoignage[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(temoignages));
    } catch (e) {
      console.warn('Impossible de sauvegarder les témoignages dans localStorage', e);
    }
  }

  public getTemoignagesSync(): Temoignage[] {
    return this.temoignagesSubject.value;
  }

  public getTemoignages(): Observable<Temoignage[]> {
    return this.http.get<Temoignage[]>(`${this.apiUrl}/temoignages`).pipe(
      tap(data => {
        if (data && Array.isArray(data)) {
          this.temoignagesSubject.next(data);
          this.saveToStorage(data);
        }
      }),
      catchError(() => of(this.temoignagesSubject.value))
    );
  }

  public refresh(): void {
    this.getTemoignages().subscribe();
  }

  public ajouterTemoignage(payload: {
    nom_auteur: string;
    role_auteur: 'locataire' | 'gestionnaire' | 'agence';
    ville?: string;
    note: number;
    commentaire: string;
    avatar_url?: string;
  }): Observable<Temoignage> {
    let badge = '✓ Avis Vérifié';
    if (payload.role_auteur === 'gestionnaire') {
      badge = '✓ Bailleur Certifié';
    } else if (payload.role_auteur === 'agence') {
      badge = '✓ Agence Partenaire';
    }

    const avatarsParDefaut = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
    ];
    const avatarChoisi = payload.avatar_url || avatarsParDefaut[Math.floor(Math.random() * avatarsParDefaut.length)];

    const nouveau: Temoignage = {
      id: Date.now(),
      nom_auteur: payload.nom_auteur.trim(),
      role_auteur: payload.role_auteur,
      ville: payload.ville || 'Sénégal',
      note: payload.note,
      commentaire: payload.commentaire.trim(),
      avatar_url: avatarChoisi,
      badge: badge,
      est_affiche: true,
      est_verifie: true,
      created_at: new Date().toISOString()
    };

    // Mise à jour immédiate
    const actuels = [nouveau, ...this.temoignagesSubject.value];
    this.temoignagesSubject.next(actuels);
    this.saveToStorage(actuels);

    // Envoi API
    return this.http.post<Temoignage>(`${this.apiUrl}/temoignages`, payload).pipe(
      tap(created => {
        if (created && created.id) {
          const updated = this.temoignagesSubject.value.map(t => t.id === nouveau.id ? created : t);
          this.temoignagesSubject.next(updated);
          this.saveToStorage(updated);
        }
      }),
      catchError(() => of(nouveau))
    );
  }

  public resetToDefault(): void {
    this.temoignagesSubject.next(INITIAL_TEMOIGNAGES);
    this.saveToStorage(INITIAL_TEMOIGNAGES);
  }

  public clearAll(): void {
    this.temoignagesSubject.next([]);
    this.saveToStorage([]);
  }
}
