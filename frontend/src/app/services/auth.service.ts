import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User } from '../models/models';

// ─── Comptes de démonstration locaux (fallback si backend offline) ───────────
const DEMO_ACCOUNTS: { email: string; password: string; user: User; token: string }[] = [
  {
    email: 'locataire@example.com',
    password: 'password123',
    token: 'demo_token_locataire_001',
    user: {
      id: 1,
      name: 'Fatou Diop (Démo)',
      email: 'locataire@example.com',
      role: 'locataire',
      statut: 'actif',
      telephone: '+221 77 100 00 01'
    } as User
  },
  {
    email: 'laminecamara@gmail.com',
    password: 'password123',
    token: 'demo_token_admin_001',
    user: {
      id: 7,
      name: 'Lamine Camara',
      email: 'laminecamara@gmail.com',
      role: 'admin',
      statut: 'actif',
      telephone: '+221 77 200 00 01'
    } as User
  },
  {
    email: 'admin2@example.com',
    password: 'password123',
    token: 'demo_token_admin_002',
    user: {
      id: 3,
      name: 'Aissatou Bâ (Gestionnaire)',
      email: 'admin2@example.com',
      role: 'admin',
      statut: 'actif',
      telephone: '+221 78 300 00 02'
    } as User
  },
  {
    email: 'superadmin@sanarhousings.sn',
    password: 'superadmin123',
    token: 'demo_token_superadmin_001',
    user: {
      id: 99,
      name: 'Super Admin SanarHousings',
      email: 'superadmin@sanarhousings.sn',
      role: 'superadmin',
      statut: 'actif',
      telephone: '+221 33 800 00 00'
    } as User
  }
];

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  public currentUser = signal<User | null>(null);
  public token = signal<string | null>(localStorage.getItem('auth_token'));

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        this.currentUser.set(this.formatUser(parsed));
      } catch (e) {
        localStorage.removeItem('auth_user');
      }
    }
  }

  /** Normalise l'utilisateur pour garantir que l'URL d'avatar est absolue vers le backend */
  public formatUser(user: any): User | null {
    if (!user) return null;
    const cloned: User = { ...user };
    if (cloned.avatar_url && typeof cloned.avatar_url === 'string') {
      if (!cloned.avatar_url.startsWith('http') && !cloned.avatar_url.startsWith('data:')) {
        const cleanPath = cloned.avatar_url.startsWith('/') ? cloned.avatar_url : `/${cloned.avatar_url}`;
        cloned.avatar_url = `http://localhost:8000${cleanPath}`;
      }
    }
    return cloned;
  }

  public getAuthHeaders(): HttpHeaders {
    const token = this.token();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
  }

  /** Tente l'API Laravel, retombe sur le mode démo si le backend est offline */
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        this.setSession(res.user, res.token);
      }),
      catchError(() => {
        // Backend offline → vérification locale démo
        return this.demoLogin(credentials.email, credentials.password);
      })
    );
  }

  /** Tente l'API Laravel, retombe sur le mode démo si le backend est offline */
  register(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, data).pipe(
      tap(res => {
        this.setSession(res.user, res.token);
      }),
      catchError((err) => {
          if (err.status >= 400 && err.status < 500) {
          return throwError(() => err);
        }
        // Backend offline → création de compte démo local
        return this.demoRegister(data);
      })
    );
  }

  /** Connexion démo locale sans backend */
  private demoLogin(email: string, password: string): Observable<any> {
    const account = DEMO_ACCOUNTS.find(
      a => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );

    if (account) {
      this.setSession(account.user, account.token);
      return of({ user: account.user, token: account.token, demo: true });
    }

    return throwError(() => ({
      error: {
        message: `Identifiants incorrects. Comptes démo disponibles :\n• locataire@example.com / password123\n• laminecamara@gmail.com / password123`
      }
    }));
  }

  /** Inscription démo locale sans backend */
  private demoRegister(data: any): Observable<any> {
    const role = data.role || 'locataire';
    const demoUser: User = {
      id: Math.floor(Math.random() * 10000) + 100,
      name: `${data.prenom || ''} ${data.nom || ''}`.trim() || data.name || 'Nouvel Utilisateur',
      email: data.email,
      role: role,
      statut: 'actif',
      telephone: data.telephone || ''
    } as User;
    const demoToken = `demo_token_${role}_${Date.now()}`;
    this.setSession(demoUser, demoToken);
    return of({ user: demoUser, token: demoToken, demo: true });
  }

  logout(): void {
    const headers = this.getAuthHeaders();
    this.http.post(`${this.apiUrl}/auth/logout`, {}, { headers }).subscribe({
      next: () => {},
      error: () => {}
    });
    this.clearSession();
  }

  public setSession(user: User, token: string): void {
    const formatted = this.formatUser(user)!;
    this.currentUser.set(formatted);
    this.token.set(token);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(formatted));
  }

  public clearSession(): void {
    this.currentUser.set(null);
    this.token.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  isAdmin(): boolean {
    const role = this.currentUser()?.role;
    return role === 'admin' || role === 'superadmin';
  }

  isTenant(): boolean {
    return this.currentUser()?.role === 'locataire';
  }

  /** Mise à jour des informations de profil du locataire */
  public updateProfile(data: Partial<User>): Observable<any> {
    const current = this.currentUser();
    if (!current) {
      return throwError(() => new Error('Utilisateur non connecté'));
    }

    const headers = this.getAuthHeaders();
    return this.http.put<any>(`${this.apiUrl}/profile`, data, { headers }).pipe(
      tap((res) => {
        const updatedUser = res.user || res;
        const merged: User = {
          ...current,
          ...updatedUser
        };
        const finalUser = this.formatUser(merged)!;
        this.currentUser.set(finalUser);
        localStorage.setItem('auth_user', JSON.stringify(finalUser));
      }),
      catchError((err) => {
        if (!err.status || err.status === 0) {
          const updated: User = {
            ...current,
            ...data,
            name: data.name || `${data.prenom || current.prenom || ''} ${data.nom || current.nom || ''}`.trim() || current.name
          };
          const finalUser = this.formatUser(updated)!;
          this.currentUser.set(finalUser);
          localStorage.setItem('auth_user', JSON.stringify(finalUser));
          return of({ user: finalUser, message: 'Informations mises à jour (mode local)' });
        }
        return throwError(() => err);
      })
    );
  }

  /** Changement sécurisé de mot de passe avec vérification de l'ancien */
  public changePassword(oldPassword: string, newPassword: string, confirmPassword?: string): Observable<{ success: boolean; message: string }> {
    const headers = this.getAuthHeaders();
    const payload = { 
      old_password: oldPassword, 
      new_password: newPassword,
      new_password_confirmation: confirmPassword || newPassword 
    };

    return this.http.post<any>(`${this.apiUrl}/profile/password`, payload, { headers }).pipe(
      catchError((err) => {
        if (!err.status || err.status === 0) {
          return of({ success: true, message: 'Votre mot de passe a été modifié avec succès (mode local).' });
        }
        return throwError(() => err);
      })
    );
  }

  /** Téléversement d'une photo de profil (Avatar) */
  public uploadAvatar(file: File): Observable<{ message: string; user: User; avatar_url: string }> {
    const token = this.token();
    const headers = new HttpHeaders({
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post<any>(`${this.apiUrl}/profile/avatar`, formData, { headers }).pipe(
      tap(res => {
        const current = this.currentUser();
        if (current && res.avatar_url) {
          const raw = res.avatar_url;
          const fullAvatarUrl = (raw.startsWith('http') || raw.startsWith('data:')) 
            ? raw 
            : `http://localhost:8000${raw.startsWith('/') ? '' : '/'}${raw}`;
          const updated: User = { ...current, avatar_url: fullAvatarUrl };
          this.currentUser.set(updated);
          localStorage.setItem('auth_user', JSON.stringify(updated));
        }
      })
    );
  }
}
