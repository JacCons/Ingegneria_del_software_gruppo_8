import { Component, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MappaService } from '../../services/mappa.service';
import { AutenticazioneService } from '../../services/autenticazione.service';
import { Utente, TipoUtente } from '../../models/utente.model';
import { SegnalazioniService } from '../../services/segnalazioni.service';
import { DialogService } from '../../services/dialog.service';
import { ChangeDetectorRef } from '@angular/core';
import { Segnalazione } from '../../models/segnalazione.model';
import { RichiesteAllocazioneService } from '../../services/richieste-allocazione.service';
import { RichiestaAllocazione } from '../../models/richieste-allocazione.model';
import { GiornoSettimana, StatoRichiesta } from '../../models/richieste-allocazione.model';
import { G } from '@angular/cdk/keycodes';

@Component({
  selector: 'richiesta-allocazione',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule],
  templateUrl: './richiesta-allocazione.component.html',
  styleUrl: './richiesta-allocazione.component.scss'
})
export class RichiestaAllocazioneComponent {

  currentUser: Utente | null = null;

  GiornoSettimana = GiornoSettimana;
  StatoRichiesta = StatoRichiesta;
  segnalazioni: Segnalazione[] = [];
  coordinates: [number, number] = [0, 0];
  giornoSelezionato?: GiornoSettimana;
  orarioSelezionato?: string;
  raggio: number = 500;
  stato?: StatoRichiesta;

  private autenticazioneService = inject(AutenticazioneService);
  private cdr = inject(ChangeDetectorRef);
  private dialogService = inject(DialogService);
  private segnalazioniService = inject(SegnalazioniService);
  private richiesteAllocazioneService = inject(RichiesteAllocazioneService);
  private currentMarker: any = null;  // Add this property to track the current marker

  constructor(private mappaService: MappaService) { }

  ngOnInit(): void {
    this.autenticazioneService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log("currentUser", this.currentUser);
    });
  }
  ngAfterViewInit(): void {
    this.mappaService.initMap('map');
    this.caricaSegnalazioniCluster();
    this.setupMapClickListener();
  }

  private setupMapClickListener(): void {
    const map = this.mappaService.getMap();
    if (!map) {
      console.error('Map not initialized');
      return;
    }

    map.on('click', (e: any) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      this.coordinates = [lng, lat];

      // Remove only the current marker if it exists
      if (this.currentMarker) {
        this.currentMarker.remove();
      }

      // Add new marker and store reference
      this.currentMarker = this.mappaService.addMarker([lat, lng])
        .bindPopup('Posizione selezionata')
        .openPopup();

      console.log('Coordinates selected:', this.coordinates);
      this.cdr.detectChanges();
    });
  }

  inviaRichiestaAllocazione() {

    if (!this.giornoSelezionato || !this.orarioSelezionato || this.coordinates[0] === 0) {
      console.log('Giorno selezionato', this.giornoSelezionato);
      console.log('Orario selezionato:', this.orarioSelezionato);
      console.log('Coordinate selezionate:', this.coordinates);
      this.dialogService.showError('Compila tutti i campi richiesti');
      return;
    }

    const richiesta: RichiestaAllocazione = {
      timeStamp: new Date(),
      zonaDiOperazione: {
        coordinateGps: {
          type: "Point",
          coordinates: this.coordinates,
          raggio: this.raggio // Include the radius in the request
        },
        fasciaOraria: parseInt(this.orarioSelezionato.split(':')[0]), // converts "HH:mm" to hour number
        giornoSettimana: this.giornoSelezionato as GiornoSettimana // Use the selected day of the week;
      },
      stato: StatoRichiesta.IN_ATTESA // Default state for new requests
    };

    console.log('Richiesta allocazione:', richiesta);

    this.richiesteAllocazioneService.createRichiestaAllocazione(richiesta).subscribe({
      next: (response) => {
        if (response.success) {
          this.dialogService.showSuccess("Operazione effettuata", 'Richiesta creata con successo!');
          // Reset form
          this.giornoSelezionato = GiornoSettimana.LUNEDI; // Reset to default value
          this.orarioSelezionato = ''; // Reset to default value
          this.coordinates = [0, 0];
          this.raggio = 500; // Reset raggio to default

          if (this.currentMarker) {
            this.currentMarker.remove();
          }
        } else {
          this.dialogService.showError('Errore nell\'invio della richiesta');
        }
      },
      error: (error) => {
        console.error('Error sending request:', error);
        this.dialogService.showError('Errore nell\'invio della richiesta');
      }
    });
  }


  caricaSegnalazioniCluster() {
    if (this.currentUser?.tipoUtente === TipoUtente.FDO || this.currentUser?.tipoUtente === TipoUtente.COMUNALE) {
      this.segnalazioniService.getAllSegnalazioni().subscribe({
        next: (response) => {
          if (response.success) {
            this.segnalazioni = response.data;
            this.segnalazioni.sort((a, b) => {
              const dateA = a.timeStamp ? new Date(a.timeStamp) : new Date(0);
              const dateB = b.timeStamp ? new Date(b.timeStamp) : new Date(0);
              return dateB.getTime() - dateA.getTime();
            });// ordina in ordine decrescente

            this.cdr.detectChanges();

            // Prima pulisci tutti i marker esistenti
            this.mappaService.clearMarkers();

            // Aggiungi i marker con clustering
            if (this.segnalazioni && this.segnalazioni.length) {
              this.segnalazioni.forEach(s => {
                const lon = Number(s.coordinateGps?.coordinates?.at(0));
                const lat = Number(s.coordinateGps?.coordinates?.at(1));
                if (lon && lat) {
                  this.mappaService.addMarkerToCluster([lat, lon])
                    .bindPopup(`<b>${s.tipologia}</b><br>${s.descrizione}`);
                }
              });
            }
            this.cdr.detectChanges();
          } else {
            this.dialogService.showError('Errore nel recupero delle segnalazioni');
          }
        },
        error: (error) => {
          console.error('Error fetching segnalazioni:', error);
          this.dialogService.showError('Errore nel recupero delle segnalazioni');
        }
      });
    } else if (this.currentUser?.tipoUtente === TipoUtente.CITTADINO) {
      this.segnalazioniService.getSegnalazioniByUtente().subscribe({
        next: (response) => {
          if (response.success) {
            this.segnalazioni = response.data;
            this.segnalazioni.sort((a, b) => {
              const dateA = a.timeStamp ? new Date(a.timeStamp) : new Date(0);
              const dateB = b.timeStamp ? new Date(b.timeStamp) : new Date(0);
              return dateB.getTime() - dateA.getTime();
            });// ordina in ordine decrescente

            this.cdr.detectChanges();
            // Prima pulisci tutti i marker esistenti
            this.mappaService.clearMarkers();

            // Aggiungi i marker con clustering
            if (this.segnalazioni && this.segnalazioni.length) {
              this.segnalazioni.forEach(s => {
                const lon = Number(s.coordinateGps?.coordinates?.at(0));
                const lat = Number(s.coordinateGps?.coordinates?.at(1));
                if (lon && lat) {
                  this.mappaService.addMarkerToCluster([lat, lon])
                    .bindPopup(`<b>${s.tipologia}</b><br>${s.descrizione}`);
                }
              });
            }
            this.cdr.detectChanges();
          } else {
            this.dialogService.showError('Errore nel recupero delle segnalazioni Utente');
          }
        },
        error: (error) => {
          console.error('Error fetching segnalazioni:', error);
          this.dialogService.showError('Errore nel recupero delle segnalazioni Utente');
        }
      });
    }
  }


}
