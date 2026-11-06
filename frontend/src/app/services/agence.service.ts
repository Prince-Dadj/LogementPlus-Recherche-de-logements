import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap, finalize } from 'rxjs/operators';
import { Agence } from '../models/models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AgenceService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = 'http://localhost:8000/api';

  private agencesSubject = new BehaviorSubject<Agence[]>([]);
  public agences$ = this.agencesSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor() {
    this.refresh();
  }

  public getAgencesSync(): Agence[] {
    return this.agencesSubject.value;
  }

  /**
   * Récupère les agences partenaires réelles depuis la base de données via l'API
   */
  public getAgences(): Observable<Agence[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<Agence[]>(`${this.apiUrl}/agences`).pipe(
      tap(data => {
        if (data && Array.isArray(data)) {
          this.agencesSubject.next(data);
          this.errorSubject.next(null);
        } else {
          this.agencesSubject.next([]);
        }
      }),
      catchError(err => {
        console.error('Erreur de récupération des agences depuis la base de données:', err);
        this.errorSubject.next('Impossible de charger les agences partenaires depuis le serveur.');
        return of(this.agencesSubject.value);
      }),
      finalize(() => {
        this.loadingSubject.next(false);
      })
    );
  }

  public refresh(): void {
    this.getAgences().subscribe();
  }

  /**
   * Récupère la liste complète des agences pour l'espace d'administration
   */
  public getAdminAgences(): Observable<Agence[]> {
    const headers = this.auth.getAuthHeaders();
    return this.http.get<Agence[]>(`${this.apiUrl}/admin/agences`, { headers }).pipe(
      catchError(err => {
        console.warn('Fallback admin agences vers public:', err);
        return this.http.get<Agence[]>(`${this.apiUrl}/agences`);
      })
    );
  }

  /**
   * Ajout d'une agence par l'administrateur avec persistance BDD et support d'upload
   */
  public ajouterAgence(data: FormData | Partial<Agence>): Observable<Agence> {
    const headers = this.auth.getAuthHeaders();

    return this.http.post<Agence>(`${this.apiUrl}/admin/agences`, data, { headers }).pipe(
      tap(created => {
        if (created && created.id) {
          const actuelles = [created, ...this.agencesSubject.value];
          this.agencesSubject.next(actuelles);
        }
      }),
      catchError(err => {
        // Tentative sur la route /agences si /admin/agences renvoie 404
        return this.http.post<Agence>(`${this.apiUrl}/agences`, data).pipe(
          tap(created => {
            if (created && created.id) {
              const actuelles = [created, ...this.agencesSubject.value];
              this.agencesSubject.next(actuelles);
            }
          })
        );
      })
    );
  }
}
