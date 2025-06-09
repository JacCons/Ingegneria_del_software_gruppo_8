import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { Router, NavigationEnd } from '@angular/router';
import { NgIf } from '@angular/common';
import { AutenticazioneService } from './services/autenticazione.service';
import { MappaService } from './services/mappa.service';
import { UtentiService } from './services/utenti.service';
import { Utente } from './models/utente.model';
import { GeoPoint } from './models/utente.model';
import { interval, Subscription } from 'rxjs';
import * as L from 'leaflet';

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
  private utentiService = inject(UtentiService);
  private mappaService = inject(MappaService);
  private intervalSubscription: Subscription | null = null;
  private currentAgentMarker: L.Marker | null = null;
  private currentAgentCircle: L.Circle | null = null;
  private isFirstPositionUpdate: boolean = true;

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
    if (this.currentUser && this.currentUser.tipoUtente === 'UtenteFDO') {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          console.log(`Coordinate GPS agente ${this.currentUser?.TipoFDO}:`, { lat, lng });
          if (!this.currentUser?._id) {
            console.error('ID utente non disponibile per aggiornamento GPS');
            return;
          }

          const updatedUser: Partial<Utente> = {
            coordinateGps: {
              type: "Point",
              coordinates: [lng, lat]  //[longitude, latitude] per GeoJSON
            }
          };
          this.utentiService.updateUtente(this.currentUser._id, updatedUser).subscribe({
            next: (response) => {
              if (response.success) {
                console.log('Posizione GPS aggiornata con successo');
              }
            },
            error: (error) => {
              console.error('Errore nell\'aggiornamento della posizione GPS:', error);
            }
          });

          // Rimuovi il marker e il cerchio precedenti se esistono
          if (this.currentAgentMarker && this.mappaService.getMap()) {
            this.mappaService.getMap()?.removeLayer(this.currentAgentMarker);
          }
          if (this.currentAgentCircle && this.mappaService.getMap()) {
            this.mappaService.getMap()?.removeLayer(this.currentAgentCircle);
          }

          // Aggiungi il nuovo marker e cerchio dell'agente
          if (this.mappaService.getMap()) {
            // Crea l'icona personalizzata per l'agente
            const agentIcon = L.icon({
              iconUrl: 'm2.png',
              iconSize: [45, 45],
              iconAnchor: [22, 22],
              popupAnchor: [0, -22],
              shadowSize: [32, 32]
            });

            // Aggiungi il marker
            this.currentAgentMarker = this.mappaService.addMarker(
              [lat, lng],
              {
                icon: agentIcon,
                title: `Agente ${this.currentUser?.TipoFDO}`
              }
            );

            // Aggiungi il cerchio attorno al marker
            this.currentAgentCircle = L.circle([lat, lng], {
              color: '#F44336',
              fillColor: '#F44336',
              fillOpacity: 0.2,
              radius: 2500,
              weight: 2
            }).addTo(this.mappaService.getMap()!);

            // CENTRA LA MAPPA SOLO LA PRIMA VOLTA
            if (this.isFirstPositionUpdate) {
              console.log("Prima posizione aggiornata, centrando la mappa pper FDO...");
              this.mappaService.getMap()?.setView([lat, lng], 14);
              this.isFirstPositionUpdate = false; // Imposta a false dopo il primo aggiornamento
            }

            // Aggiungi popup al marker
            this.currentAgentMarker.bindPopup(
              `<b>Agente ${this.currentUser?.TipoFDO}</b><br>
               Lat: ${lat.toFixed(6)}<br>
               Lng: ${lng.toFixed(6)}<br>
               Raggio copertura: 2,5 km<br>
               Ultimo aggiornamento: ${new Date().toLocaleTimeString()}`
            );
          }
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

  clickRichiestaAllocazione(event: MouseEvent) {
    console.log("ho cliccato richiesta allocazione");
    this.router.navigate(['/richiesteAllocazione']);
  }

  clickLogout(event: MouseEvent) {
    console.log("ho cliccato logout");
    this.autenticazioneService.logout();
    this.router.navigate(['/login']);
  }
}
