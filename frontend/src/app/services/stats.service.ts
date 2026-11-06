import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { PlateformePublicStats } from '../models/models';
import { LogementService } from './logement.service';
import { AgenceService } from './agence.service';
import { TemoignageService } from './temoignage.service';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private http = inject(HttpClient);
  private logementService = inject(LogementService);
  private agenceService = inject(AgenceService);
  private temoignageService = inject(TemoignageService);

  private apiUrl = 'http://localhost:8000/api';

  private statsSubject = new BehaviorSubject<PlateformePublicStats>(this.computeLocalStats());
  public stats$ = this.statsSubject.asObservable();

  constructor() {
    this.refresh();
  }

  /**
   * Calcule dynamiquement les statistiques à partir des collections locales
   */
  public computeLocalStats(): PlateformePublicStats {
    const logements = this.logementService?.getSenegalCatalog() || [];
    const agences = this.agenceService?.getAgencesSync() || [];
    const temoignages = this.temoignageService?.getTemoignagesSync() || [];

    // 1. Nombre de logements
    const nbLogements = logements.length;

    // 2. Nombre d'agences partenaires
    const nbAgences = agences.length;

    // 3. Calcul de la note moyenne sur l'ensemble des logements et des témoignages
    let sommeNotes = 0;
    let countNotes = 0;

    logements.forEach(l => {
      if (l.note_moyenne) {
        sommeNotes += l.note_moyenne;
        countNotes++;
      }
    });

    temoignages.forEach(t => {
      if (t.note) {
        sommeNotes += t.note;
        countNotes++;
      }
    });

    const noteMoyenne = countNotes > 0 ? (sommeNotes / countNotes) : 4.9;
    const tauxSatisfaction = Math.min(100, Math.max(90, Math.round((noteMoyenne / 5) * 100)));

    // 4. Nombre de locations réelles et locataires
    let nbLocations = 0;
    try {
      if (typeof localStorage !== 'undefined') {
        const resRaw = localStorage.getItem('logementplus_reservations_v3');
        if (resRaw) {
          const reservations = JSON.parse(resRaw);
          if (Array.isArray(reservations)) {
            nbLocations = reservations.filter(r => ['confirmee', 'payee', 'terminee'].includes(r.statut)).length;
          }
        }
      }
    } catch (e) {}

    const nbAvisLogements = logements.reduce((acc, l) => acc + (l.nombre_avis || l.avis?.length || 0), 0);
    const locatairesSatisfaits = nbAvisLogements + temoignages.length;

    return {
      nb_agences: nbAgences,
      nb_logements: nbLogements,
      nb_annonces_disponibles: logements.filter(l => l.statut === 'publie').length || nbLogements,
      nb_locations_realisees: nbLocations,
      nb_locataires: locatairesSatisfaits,
      taux_satisfaction: tauxSatisfaction,
      note_moyenne: Number(noteMoyenne.toFixed(1)),
      nb_avis_total: nbAvisLogements + temoignages.length
    };
  }

  public getStatsSync(): PlateformePublicStats {
    return this.statsSubject.value;
  }

  public refresh(): void {
    // Calcul local immédiat
    const local = this.computeLocalStats();
    this.statsSubject.next(local);

    // Tentative de synchronisation avec l'API Laravel
    this.http.get<PlateformePublicStats>(`${this.apiUrl}/plateforme-stats`).pipe(
      tap(remoteStats => {
        if (remoteStats && remoteStats.nb_logements !== undefined) {
          this.statsSubject.next({
            nb_agences: remoteStats.nb_agences ?? local.nb_agences,
            nb_logements: remoteStats.nb_logements > 0 ? remoteStats.nb_logements : local.nb_logements,
            nb_annonces_disponibles: remoteStats.nb_annonces_disponibles ?? local.nb_annonces_disponibles,
            nb_locations_realisees: remoteStats.nb_locations_realisees ?? local.nb_locations_realisees,
            nb_locataires: remoteStats.nb_locataires ?? local.nb_locataires,
            taux_satisfaction: remoteStats.taux_satisfaction ?? local.taux_satisfaction,
            note_moyenne: remoteStats.note_moyenne ?? local.note_moyenne,
            nb_avis_total: remoteStats.nb_avis_total ?? local.nb_avis_total
          });
        }
      }),
      catchError(() => of(local))
    ).subscribe();
  }
}
