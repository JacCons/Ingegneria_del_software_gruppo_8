import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { Router, NavigationEnd } from '@angular/router';
import { NgIf } from '@angular/common';
import { AutenticazioneService } from './services/autenticazione.service';
import { Utente } from './models/utente.model';
import { interval, Subscription } from 'rxjs';


@Component({
  selector: 'app-root',
  imports: [NgIf, RouterOutlet, MatIconModule, MatDividerModule, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {

  title = 'SecuriTrento_FE';
  showDashboard = true;
  currentUser: Utente | null = null;
  private autenticazioneService = inject(AutenticazioneService);
  private intervalSubscription: Subscription | null = null;
  
  ngOnInit(): void {
    this.autenticazioneService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log("currentUser", this.currentUser);
    });
    
    // Inizia l'intervallo che esegue la funzione ogni 5 secondi
    this.intervalSubscription = interval(5000).subscribe(() => {
      this.controllaPosizioneUtente();
    });
  }
  
  ngOnDestroy(): void {
    // Cancella la sottoscrizione quando il componente viene distrutto
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }
  
  // Funzione eseguita ogni 5 secondi
  controllaPosizioneUtente(): void {
    //console.log(`Coordinate GPS agente` + this.currentUser?.tipoUtente);
    // Controllo se l'utente è di tipo forze dell'ordine
    if (this.currentUser && this.currentUser.tipoUtente === 'UtenteFDO') {
      
      // Ottieni le coordinate GPS dell'utente
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          console.log(`Coordinate GPS agente ${this.currentUser?.TipoFDO}:`, { lat, lng });
          
          // Qui puoi aggiungere la logica per inviare le coordinate al server
          // this.inviaPosizioneAgente(lat, lng);
        },
        (error) => {
          console.error('Errore nel recuperare le coordinate GPS:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
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
