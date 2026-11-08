import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap, finalize, map } from 'rxjs/operators';
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

  private getHeaders(isFormData = false): { headers: HttpHeaders } {
    const token = this.auth.token();
    if (isFormData) {
      return {
        headers: new HttpHeaders({
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        })
      };
    }
    return { headers: this.auth.getAuthHeaders() };
  }

  /**
   * Ajout d'une agence par l'administrateur avec persistance BDD et support d'upload
   */
  public ajouterAgence(data: FormData | Partial<Agence>): Observable<Agence> {
    const isFormData = data instanceof FormData;
    const options = this.getHeaders(isFormData);

    return this.http.post<any>(`${this.apiUrl}/admin/agences`, data, options).pipe(
      map(res => (res?.agence || res?.data || res) as Agence),
      tap(created => {
        if (created && created.id) {
          const actuelles = [created, ...this.agencesSubject.value.filter(a => a.id !== created.id)];
          this.agencesSubject.next(actuelles);
        }
      }),
      catchError(err => {
        return this.http.post<any>(`${this.apiUrl}/agences`, data).pipe(
          map(res => (res?.agence || res?.data || res) as Agence),
          tap(created => {
            if (created && created.id) {
              const actuelles = [created, ...this.agencesSubject.value.filter(a => a.id !== created.id)];
              this.agencesSubject.next(actuelles);
            }
          })
        );
      })
    );
  }

  /**
   * Modification d'une agence existante avec mise à jour immédiate
   */
  public modifierAgence(id: number, data: FormData | Partial<Agence>): Observable<Agence> {
    const isFormData = data instanceof FormData;
    const options = this.getHeaders(isFormData);

    return this.http.post<any>(`${this.apiUrl}/admin/agences/${id}`, data, options).pipe(
      map(res => (res?.agence || res?.data || res) as Agence),
      tap(updated => {
        if (updated && updated.id) {
          const actuelles = this.agencesSubject.value.map(a => a.id === updated.id ? { ...a, ...updated } : a);
          this.agencesSubject.next(actuelles);
        }
      })
    );
  }

  /**
   * Suppression d'une agence partenaire
   */
  public supprimerAgence(id: number): Observable<any> {
    const options = this.getHeaders(false);
    return this.http.delete<any>(`${this.apiUrl}/admin/agences/${id}`, options).pipe(
      tap(() => {
        const actuelles = this.agencesSubject.value.filter(a => a.id !== id);
        this.agencesSubject.next(actuelles);
      })
    );
  }

  /**
   * Basculer le statut certifié d'une agence
   */
  public toggleCertification(id: number): Observable<Agence> {
    const options = this.getHeaders(false);
    return this.http.patch<any>(`${this.apiUrl}/admin/agences/${id}/toggle-certification`, {}, options).pipe(
      map(res => (res?.agence || res?.data || res) as Agence),
      tap(updated => {
        if (updated && updated.id) {
          const actuelles = this.agencesSubject.value.map(a => a.id === updated.id ? { ...a, ...updated } : a);
          this.agencesSubject.next(actuelles);
        }
      })
    );
  }
}
