import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LogementListComponent } from './components/logement-list/logement-list.component';
import { LogementDetailComponent } from './components/logement-detail/logement-detail.component';
import { ReservationFlowComponent } from './components/reservation-flow/reservation-flow.component';
import { TenantDashboardComponent } from './components/tenant-dashboard/tenant-dashboard.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { SuperAdminDashboardComponent } from './components/superadmin-dashboard/superadmin-dashboard.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { LoginComponent } from './components/login/login.component';
import { ContactComponent } from './components/contact/contact.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'logements', component: LogementListComponent },
  { path: 'logements/:id', component: LogementDetailComponent },
  { path: 'logements/:id/reserver', component: ReservationFlowComponent },
  { path: 'reserver/:id', component: ReservationFlowComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'login', component: LoginComponent },
  { path: 'locataire', component: TenantDashboardComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'superadmin', component: SuperAdminDashboardComponent },
  { path: '**', redirectTo: '' }
];
