import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminStats, AuditLog, PlatformParam, SuperAdminStats, User } from '../models/models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  // RF-70 & RF-73 : Statistiques Gestionnaire
  getAdminStats(): Observable<AdminStats> {
    const headers = this.auth.getAuthHeaders();
    return this.http.get<AdminStats>(`${this.apiUrl}/admin/dashboard-stats`, { headers });
  }

  // Section 5 & RF-70 : Statistiques Super Admin
  getSuperAdminStats(): Observable<SuperAdminStats> {
    const headers = this.auth.getAuthHeaders();
    return this.http.get<SuperAdminStats>(`${this.apiUrl}/superadmin/dashboard-stats`, { headers });
  }

  // RF-50 : Gestion des comptes
  getUsers(role?: string): Observable<User[]> {
    const headers = this.auth.getAuthHeaders();
    const url = role ? `${this.apiUrl}/superadmin/users?role=${role}` : `${this.apiUrl}/superadmin/users`;
    return this.http.get<User[]>(url, { headers });
  }

  updateUserStatut(userId: number, data: { statut?: string; statut_validation?: string }): Observable<any> {
    const headers = this.auth.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/superadmin/users/${userId}`, data, { headers });
  }

  // RF-51 : Modération avis
  getAvis(): Observable<any[]> {
    const headers = this.auth.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/superadmin/avis`, { headers });
  }

  toggleModerationAvis(avisId: number): Observable<any> {
    const headers = this.auth.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/superadmin/avis/${avisId}/toggle-moderation`, {}, { headers });
  }

  // RF-52 : Paramètres plateforme
  getParametres(): Observable<PlatformParam[]> {
    const headers = this.auth.getAuthHeaders();
    return this.http.get<PlatformParam[]>(`${this.apiUrl}/superadmin/parametres`, { headers });
  }

  updateParametre(id: number, valeur: string): Observable<any> {
    const headers = this.auth.getAuthHeaders();
    return this.http.put(`${this.apiUrl}/superadmin/parametres/${id}`, { valeur }, { headers });
  }

  // RF-53 : Journaux d'audit
  getAuditLogs(): Observable<AuditLog[]> {
    const headers = this.auth.getAuthHeaders();
    return this.http.get<AuditLog[]>(`${this.apiUrl}/superadmin/audit-logs`, { headers });
  }

  // RF-72 : Export CSV
  exportCsv(type: 'reservations' | 'paiements'): void {
    window.open(`${this.apiUrl}/reports/export-csv?type=${type}`, '_blank');
  }
}
