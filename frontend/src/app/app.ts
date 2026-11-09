import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MobileNavComponent } from './components/mobile-nav/mobile-nav.component';
import { ModalAlertComponent } from './components/modal-alert/modal-alert.component';
import { SessionTimeoutModalComponent } from './components/session-timeout-modal/session-timeout-modal.component';
import { SessionTimeoutService } from './services/session-timeout.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, NavbarComponent, MobileNavComponent, ModalAlertComponent, SessionTimeoutModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // Démarre le service global de gestion du délai de session
  private sessionTimeoutService = inject(SessionTimeoutService);
}
