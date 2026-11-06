import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MobileNavComponent } from './components/mobile-nav/mobile-nav.component';
import { ModalAlertComponent } from './components/modal-alert/modal-alert.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, NavbarComponent, MobileNavComponent, ModalAlertComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
