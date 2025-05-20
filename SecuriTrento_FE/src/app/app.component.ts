import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { Router, NavigationEnd } from '@angular/router';
import { NgIf } from '@angular/common';
import { AutenticazioneService } from './services/autenticazione.service';
import { Utente } from './models/utente.model';


@Component({
  selector: 'app-root',
  imports: [NgIf, RouterOutlet, MatIconModule, MatDividerModule, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  title = 'SecuriTrento_FE';
  showDashboard = true;
  currentUser: Utente | null = null;
  private autenticazioneService = inject(AutenticazioneService);
  
  ngOnInit(): void {
    this.autenticazioneService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log("currentUser", this.currentUser);
    });
  }

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        console.log('ROUTE:', event.urlAfterRedirects);
        this.showDashboard = !event.urlAfterRedirects.includes('/login');
      }
    });
  }
  clickSegnalazioni(event: MouseEvent) {
    console.log("ho cliccato segnalazioni");
    this.router.navigate(['/segnalazioni']);
  }

  clickNotifiche(event: MouseEvent) {
    console.log("ho cliccato notifiche");
    this.router.navigate(['/notifiche']);
  }

  clickUtenti(event: MouseEvent) {
    console.log("ho cliccato utenti");
    this.router.navigate(['/gestioneUtenti']);
  }

  clickLogout(event: MouseEvent) {
    console.log("ho cliccato logout");
    this.router.navigate(['/login']);
  }

}
