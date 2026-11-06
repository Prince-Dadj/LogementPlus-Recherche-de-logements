import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { ModalAlertService } from '../../services/modal-alert.service';
import { AuditLog, PlatformParam, SuperAdminStats, User } from '../../models/models';

@Component({
  selector: 'app-superadmin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container-fluid py-4 px-lg-4">
      <div class="row g-4">
        <!-- Barre latérale Super Admin -->
        <div class="col-lg-2">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white sticky-top" style="top: 80px;">
            <div class="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
              <i class="bi bi-shield-lock-fill text-danger fs-4"></i>
              <div>
                <strong class="d-block small text-dark">Plateforme</strong>
                <span class="badge bg-danger text-white small">SUPER ADMIN</span>
              </div>
            </div>

            <nav class="nav flex-column nav-pills gap-1">
              <button class="nav-link text-start py-2 px-3 rounded-3" [class.active]="tab === 'global'" (click)="tab = 'global'">
                <i class="bi bi-activity me-2"></i> Supervision Globale
              </button>
              <button class="nav-link text-start py-2 px-3 rounded-3" [class.active]="tab === 'users'" (click)="tab = 'users'">
                <i class="bi bi-people me-2"></i> Comptes & Admins
                @if (stats?.admins_en_attente) {
                  <span class="badge bg-warning text-dark rounded-pill float-end">{{ stats?.admins_en_attente }}</span>
                }
              </button>
              <button class="nav-link text-start py-2 px-3 rounded-3" [class.active]="tab === 'moderation'" (click)="tab = 'moderation'">
                <i class="bi bi-check2-circle me-2"></i> Modération Avis
              </button>
              <button class="nav-link text-start py-2 px-3 rounded-3" [class.active]="tab === 'parametres'" (click)="tab = 'parametres'">
                <i class="bi bi-sliders me-2"></i> Paramétrage
              </button>
              <button class="nav-link text-start py-2 px-3 rounded-3" [class.active]="tab === 'audit'" (click)="tab = 'audit'">
                <i class="bi bi-journal-text me-2"></i> Journal d'Audit
              </button>
            </nav>

            <div class="border-top pt-3 mt-4">
              <button class="btn btn-outline-danger btn-sm w-100 rounded-pill" (click)="exporterTransactions()">
                <i class="bi bi-download me-1"></i> Export Transactions
              </button>
            </div>
          </div>
        </div>

        <!-- Zone principale -->
        <div class="col-lg-10">
          <!-- Indicateurs globaux (Section 1.3 & Section 5) -->
          <div class="row g-3 mb-4">
            <div class="col-sm-6 col-xl-3">
              <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <span class="text-muted small">Volume d'affaires global</span>
                <div class="d-flex align-items-baseline justify-content-between mt-1">
                  <h2 class="h4 fw-bold tabular-numbers text-primary mb-0">{{ stats?.chiffre_affaires_global | number }} CFA</h2>
                  <span class="badge bg-primary bg-opacity-10 text-primary small">Total</span>
                </div>
              </div>
            </div>

            <div class="col-sm-6 col-xl-3">
              <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <span class="text-muted small">Commissions encaissées (10%)</span>
                <div class="d-flex align-items-baseline justify-content-between mt-1">
                  <h2 class="h4 fw-bold tabular-numbers text-success mb-0">{{ stats?.commissions_plateforme | number }} CFA</h2>
                  <span class="badge bg-success bg-opacity-10 text-success small">Marge brute</span>
                </div>
              </div>
            </div>

            <div class="col-sm-6 col-xl-3">
              <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <span class="text-muted small">Taux de conversion (CDC 1.3)</span>
                <div class="d-flex align-items-baseline justify-content-between mt-1">
                  <h2 class="h4 fw-bold tabular-numbers text-dark mb-0">{{ stats?.taux_conversion }}</h2>
                  <span class="badge bg-success bg-opacity-10 text-success small">&gt; 5% objectif</span>
                </div>
              </div>
            </div>

            <div class="col-sm-6 col-xl-3">
              <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <span class="text-muted small">Disponibilité système</span>
                <div class="d-flex align-items-baseline justify-content-between mt-1">
                  <h2 class="h4 fw-bold tabular-numbers text-info mb-0">{{ stats?.disponibilite_plateforme }}</h2>
                  <span class="badge bg-info bg-opacity-10 text-info small">SLA 99.5%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 1 : SUPERVISION GLOBALE (SECTION 5) -->
          @if (tab === 'global') {
            <div class="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
              <h3 class="h6 fw-bold mb-3 text-dark">Rapport Global d'Évolution de la Plateforme (Section 5)</h3>
              <div class="table-responsive">
                <table class="table table-bordered align-middle">
                  <thead class="table-light small">
                    <tr>
                      <th>Indicateur clé</th>
                      <th>Valeur actuelle</th>
                      <th>Période précédente</th>
                      <th>Évolution</th>
                      <th>Cible CDC v1.0</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Utilisateurs inscrits</strong></td>
                      <td class="tabular-numbers">{{ stats?.total_users }}</td>
                      <td class="tabular-numbers">4</td>
                      <td><span class="badge bg-success">+25%</span></td>
                      <td class="text-muted small">Montée en charge 5 000</td>
                    </tr>
                    <tr>
                      <td><strong>Logements publiés</strong></td>
                      <td class="tabular-numbers">{{ stats?.total_logements }}</td>
                      <td class="tabular-numbers">3</td>
                      <td><span class="badge bg-success">+66%</span></td>
                      <td class="text-muted small">Catalogue actif</td>
                    </tr>
                    <tr>
                      <td><strong>Paiements réussis</strong></td>
                      <td class="tabular-numbers">{{ stats?.taux_succes_paiements }}</td>
                      <td class="tabular-numbers">97.8%</td>
                      <td><span class="badge bg-success">+0.4%</span></td>
                      <td class="text-muted small">&gt; 95% (CDC 1.3)</td>
                    </tr>
                    <tr>
                      <td><strong>Temps moyen de réservation</strong></td>
                      <td class="tabular-numbers">&lt; 3 min</td>
                      <td class="tabular-numbers">4 min</td>
                      <td><span class="badge bg-success">-25%</span></td>
                      <td class="text-muted small">&lt; 5 min (CDC 1.3)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- TAB 2 : GESTION DES UTILISATEURS & VALIDATION ADMINS (CDC RF-04, RF-05, RF-50) -->
          @if (tab === 'users') {
            <div class="card border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-4">
              <div class="card-header bg-white border-bottom p-3">
                <h3 class="h6 fw-bold mb-0 text-dark">
                  <i class="bi bi-people-fill text-primary me-2"></i> Gestion des utilisateurs & Validation des agences (RF-04 / RF-50)
                </h3>
              </div>
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light small">
                    <tr>
                      <th>Utilisateur / Raison Sociale</th>
                      <th>Email & Téléphone</th>
                      <th>Rôle</th>
                      <th>Validation Gestionnaire</th>
                      <th>Statut Compte</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (u of users; track u.id) {
                      <tr>
                        <td>
                          <strong class="d-block small text-dark">{{ u.name }}</strong>
                          @if (u.raison_sociale) {
                            <span class="text-muted small"><i class="bi bi-building"></i> {{ u.raison_sociale }}</span>
                          }
                        </td>
                        <td class="small">{{ u.email }}<br><span class="text-muted">{{ u.telephone }}</span></td>
                        <td>
                          <span class="badge" [ngClass]="{
                            'bg-primary': u.role === 'locataire',
                            'bg-warning text-dark': u.role === 'admin',
                            'bg-danger': u.role === 'superadmin'
                          }">{{ u.role | uppercase }}</span>
                        </td>
                        <td>
                          @if (u.role === 'admin') {
                            <span class="badge" [ngClass]="u.statut_validation === 'valide' ? 'bg-success' : 'bg-warning text-dark'">
                              {{ u.statut_validation || 'En attente' }}
                            </span>
                          } @else {
                            <span class="text-muted small">—</span>
                          }
                        </td>
                        <td>
                          <span class="badge" [ngClass]="u.statut === 'actif' ? 'bg-success' : 'bg-danger'">
                            {{ u.statut }}
                          </span>
                        </td>
                        <td class="text-end">
                          @if (u.role === 'admin' && u.statut_validation === 'en_attente') {
                            <button class="btn btn-success btn-sm rounded-pill px-2 me-1" (click)="validerAdmin(u)">
                              <i class="bi bi-check-lg"></i> Valider Agence
                            </button>
                          }
                          <button class="btn btn-outline-secondary btn-sm rounded-pill" (click)="toggleStatutUser(u)">
                            {{ u.statut === 'actif' ? 'Suspendre' : 'Activer' }}
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- TAB 3 : MODÉRATION DES AVIS (CDC RF-51) -->
          @if (tab === 'moderation') {
            <div class="card border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-4">
              <div class="card-header bg-white border-bottom p-3">
                <h3 class="h6 fw-bold mb-0 text-dark"><i class="bi bi-chat-quote-fill text-primary me-2"></i> Modération des avis clients (RF-51)</h3>
              </div>
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light small">
                    <tr>
                      <th>Logement</th>
                      <th>Locataire</th>
                      <th>Note</th>
                      <th>Commentaire</th>
                      <th>Modéré</th>
                      <th class="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (av of avisList; track av.id) {
                      <tr>
                        <td class="small fw-semibold">{{ av.logement?.titre }}</td>
                        <td class="small">{{ av.locataire?.name }}</td>
                        <td class="text-warning fw-bold small"><i class="bi bi-star-fill"></i> {{ av.note }}/5</td>
                        <td class="small text-muted">{{ av.commentaire }}</td>
                        <td>
                          <span class="badge" [ngClass]="av.est_modere ? 'bg-success' : 'bg-warning text-dark'">
                            {{ av.est_modere ? 'Approuvé' : 'À modérer' }}
                          </span>
                        </td>
                        <td class="text-end">
                          <button class="btn btn-sm rounded-pill" [class.btn-outline-danger]="av.est_modere" [class.btn-success]="!av.est_modere" (click)="toggleAvis(av.id)">
                            {{ av.est_modere ? 'Masquer' : 'Approuver' }}
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- TAB 4 : PARAMÉTRAGE PLATEFORME (CDC RF-52) -->
          @if (tab === 'parametres') {
            <div class="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
              <h3 class="h6 fw-bold mb-3 text-dark"><i class="bi bi-sliders me-2 text-primary"></i> Configuration système & commissions (RF-52)</h3>
              <div class="row g-3">
                @for (p of parametres; track p.id) {
                  <div class="col-md-6">
                    <div class="p-3 border rounded-3 bg-light">
                      <label class="form-label small fw-semibold text-dark">{{ p.description || p.cle }}</label>
                      <div class="input-group input-group-sm">
                        <span class="input-group-text bg-white font-monospace small">{{ p.cle }}</span>
                        <input type="text" class="form-control" [(ngModel)]="p.valeur">
                        <button class="btn btn-primary" (click)="saveParam(p)">Enregistrer</button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- TAB 5 : JOURNAL D'AUDIT SÉCURITÉ (CDC RF-53) -->
          @if (tab === 'audit') {
            <div class="card border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-4">
              <div class="card-header bg-white border-bottom p-3">
                <h3 class="h6 fw-bold mb-0 text-dark"><i class="bi bi-shield-shaded text-danger me-2"></i> Journal d'audit des actions sensibles (RF-53)</h3>
              </div>
              <div class="table-responsive">
                <table class="table table-sm table-hover align-middle mb-0 font-monospace small">
                  <thead class="table-light">
                    <tr>
                      <th>Horodatage</th>
                      <th>Action</th>
                      <th>Entité</th>
                      <th>Utilisateur</th>
                      <th>Adresse IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (log of auditLogs; track log.id) {
                      <tr>
                        <td>{{ log.created_at }}</td>
                        <td><span class="badge bg-secondary">{{ log.action }}</span></td>
                        <td>{{ log.entite }} #{{ log.entite_id }}</td>
                        <td>{{ log.user?.name || 'Système' }}</td>
                        <td>{{ log.adresse_ip || '127.0.0.1' }}</td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="5" class="text-center py-3 text-muted font-sans-serif">Aucun événement sensible enregistré récemment.</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class SuperAdminDashboardComponent implements OnInit {
  tab: 'global' | 'users' | 'moderation' | 'parametres' | 'audit' = 'global';
  stats: SuperAdminStats | null = null;
  users: User[] = [];
  avisList: any[] = [];
  parametres: PlatformParam[] = [];
  auditLogs: AuditLog[] = [];

  constructor(
    private dashboardService: DashboardService,
    private auth: AuthService,
    private router: Router,
    private modalAlert: ModalAlertService
  ) {}

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (!user || user.role !== 'superadmin') {
      this.router.navigate(['/admin/login']);
      return;
    }
    this.loadAll();
  }

  loadAll(): void {
    this.dashboardService.getSuperAdminStats().subscribe(s => this.stats = s);
    this.dashboardService.getUsers().subscribe(u => this.users = u);
    this.dashboardService.getAvis().subscribe(a => this.avisList = a);
    this.dashboardService.getParametres().subscribe(p => this.parametres = p);
    this.dashboardService.getAuditLogs().subscribe(l => this.auditLogs = l);
  }

  validerAdmin(user: User): void {
    this.dashboardService.updateUserStatut(user.id, { statut_validation: 'valide' }).subscribe({
      next: () => {
        this.modalAlert.success(`Le gestionnaire ${user.name} a été validé avec succès.`, 'Compte Validé');
        this.loadAll();
      },
      error: (err) => this.modalAlert.error(err.error?.message || 'Erreur lors de la validation', 'Erreur')
    });
  }

  toggleStatutUser(user: User): void {
    const newStatut = user.statut === 'actif' ? 'suspendu' : 'actif';
    this.dashboardService.updateUserStatut(user.id, { statut: newStatut }).subscribe({
      next: () => {
        user.statut = newStatut;
      }
    });
  }

  toggleAvis(id: number): void {
    this.dashboardService.toggleModerationAvis(id).subscribe({
      next: () => this.loadAll()
    });
  }

  saveParam(p: PlatformParam): void {
    this.dashboardService.updateParametre(p.id, p.valeur).subscribe({
      next: () => this.modalAlert.success('Paramètre de la plateforme mis à jour avec succès !', 'Configuration Enregistrée'),
      error: (err) => this.modalAlert.error(err.error?.message || 'Erreur lors de la mise à jour', 'Erreur')
    });
  }

  exporterTransactions(): void {
    this.dashboardService.exportCsv('paiements');
  }
}
