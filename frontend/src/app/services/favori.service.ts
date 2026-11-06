import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Logement } from '../models/models';
import { AuthService } from './auth.service';
import { LogementService } from './logement.service';

@Injectable({
  providedIn: 'root'
})
export class FavoriService {
  private auth = inject(AuthService);
  private logementService = inject(LogementService);

  private favorisSubject = new BehaviorSubject<Logement[]>([]);
  public favoris$ = this.favorisSubject.asObservable();

  constructor() {
    this.chargerFavoris();
  }

  private getStorageKey(): string {
    const user = this.auth.currentUser();
    const userId = user ? user.id : 'invite';
    return `logementplus_favoris_${userId}`;
  }

  public chargerFavoris(): void {
    const key = this.getStorageKey();
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const ids: number[] = JSON.parse(saved);
        const catalog = this.logementService.getSenegalCatalog();
        const matching = catalog.filter(l => ids.includes(l.id));
        this.favorisSubject.next(matching);
        return;
      } catch (e) {
        // En cas d'erreur de parsing
      }
    }

    // Initialisation 100% dynamique : aucun favori fictif injecté
    this.favorisSubject.next([]);
  }

  private sauvegarderIds(ids: number[]): void {
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(ids));
    } catch (e) {
      console.warn('Impossible de sauvegarder les favoris', e);
    }
  }

  public isFavori(id: number): boolean {
    if (!this.auth.isLoggedIn()) return false;
    return this.favorisSubject.value.some(l => l.id === id);
  }

  public toggleFavori(logement: Logement): boolean {
    if (!this.auth.isLoggedIn()) {
      return false;
    }

    const actuels = this.favorisSubject.value;
    const exists = actuels.some(l => l.id === logement.id);
    let nouveau: Logement[];

    if (exists) {
      nouveau = actuels.filter(l => l.id !== logement.id);
    } else {
      nouveau = [logement, ...actuels];
    }

    this.favorisSubject.next(nouveau);
    this.sauvegarderIds(nouveau.map(l => l.id));
    return !exists;
  }

  public retirerFavori(id: number): void {
    const filtered = this.favorisSubject.value.filter(l => l.id !== id);
    this.favorisSubject.next(filtered);
    this.sauvegarderIds(filtered.map(l => l.id));
  }

  public getFavoris(): Logement[] {
    return this.favorisSubject.value;
  }
}
