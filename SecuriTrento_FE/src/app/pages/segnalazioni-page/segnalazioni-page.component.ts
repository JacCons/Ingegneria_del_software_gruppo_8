import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject, OnInit, AfterViewInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../services/dialog.service';
import { SegnalazioniService } from '../../services/segnalazioni.service';
import { Segnalazione, TipoSegnalazione } from '../../models/segnalazione.model';
import { MappaService } from '../../services/mappa.service';
import { AutenticazioneService } from '../../services/autenticazione.service';
import { Utente, TipoUtente } from '../../models/utente.model';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
const today = new Date();
const month = today.getMonth();
const year = today.getFullYear();

@Component({
  selector: 'app-segnalazioni-page',
  providers: [provideNativeDateAdapter()],
  imports: [
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatCardModule,
    MatStepperModule,
    MatInputModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    CommonModule,
    MatDatepickerModule,
    MatButtonToggleModule
  ],
  templateUrl: './segnalazioni-page.component.html',
  styleUrl: './segnalazioni-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SegnalazioniPageComponent implements OnInit, AfterViewInit {
  currentUser: Utente | null = null;
  private autenticazioneService = inject(AutenticazioneService);

  constructor(
    private router: Router,
    private mappaService: MappaService
  ) { }

  private cdr = inject(ChangeDetectorRef);
  private dialogService = inject(DialogService);
  private segnalazioniService = inject(SegnalazioniService);
  private _formBuilder = inject(FormBuilder);

  // Filtro selezione segnalazione se è aperta o chiusa
  hideSingleSelectionIndicator = signal(false);
  hideMultipleSelectionIndicator = signal(false);

  toggleMultipleSelectionIndicator() {
    this.hideMultipleSelectionIndicator.update(value => !value);
  }

  // Form controls per i filtri
  tipologie = new FormControl('');
  tipologieList?: string[];

  TipoSegnalazione = TipoSegnalazione;

  statoSegnalazioni = new FormControl([]);

  // Proprietà per i filtri data
  readonly campaignOne = new FormGroup({
    start: new FormControl(new Date(year, month, today.getDate() - 30)),
    end: new FormControl(new Date(year, month, today.getDate())),
  });
  readonly campaignTwo = new FormGroup({
    start: new FormControl(new Date(year, month, 15)),
    end: new FormControl(new Date(year, month, 19)),
  });

  // Proprietà del componente
  disableSelect = new FormControl(false);
  tipoSegnalazione: string = '';
  showSegnalazioneForm = false;
  segnalazioni: Segnalazione[] = [];
  segnalazioniOriginali: Segnalazione[] = []; // Backup delle segnalazioni originali per i filtri
  TipoUtente = TipoUtente;

  ngOnInit(): void {
    this.autenticazioneService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log("currentUser", this.currentUser);
    });
    this.mappaService.initMap('map');
    this.caricaSegnalazioniCluster();
    this.cdr.detectChanges();
  }

  firstFormGroup = this._formBuilder.group({
    newTipologiaSegnalazione: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    newDescrizione: ['', Validators.required],
  });
  isLinear = false;

  async ngAfterViewInit(): Promise<void> {
    await this.mappaService.initMap('map');
    this.caricaSegnalazioniCluster();
    this.cdr.detectChanges();
  }

  caricaSegnalazioni() {
    console.log("Tipo utente corrente:", this.currentUser?.tipoUtente);
    if (this.currentUser?.tipoUtente === TipoUtente.FDO || this.currentUser?.tipoUtente === TipoUtente.COMUNALE) {
      this.segnalazioniService.getAllSegnalazioni().subscribe({
        next: (response) => {
          if (response.success) {
            this.segnalazioni = response.data;
            this.segnalazioniOriginali = [...response.data];
            this.segnalazioni.sort((a, b) => {
              const dateA = a.timeStamp ? new Date(a.timeStamp) : new Date(0);
              const dateB = b.timeStamp ? new Date(b.timeStamp) : new Date(0);
              return dateB.getTime() - dateA.getTime();
            });// ordina in ordine decrescente

            this.cdr.detectChanges();
          } else {
            this.dialogService.showError('Errore nel recupero di tutte segnalazioni');
          }
          console.log("segnalazioni: ", this.segnalazioni);
        },
        error: (error) => {
          console.error('Error fetching segnalazioni:', error);
          this.dialogService.showError('Errore nel recupero di tutte le segnalazioni');
        }
      });
    } else if (this.currentUser?.tipoUtente === TipoUtente.CITTADINO) {
      const startDate = this.campaignOne.get('start')?.value;
      const endDate = this.campaignOne.get('end')?.value;
      const tipologieFinal = this.tipologieList;
      const stati = this.statoSegnalazioni.value;

      console.log('Filtri applicati:', {
        dataInizio: startDate,
        dataFine: endDate,
        tipologie: tipologieFinal,
        stati: stati
      });

      const dateArray: Date[] | undefined = (startDate && endDate) ? [startDate, endDate] : undefined;
      const tipologieArray: string[] | undefined = (tipologieFinal && Array.isArray(tipologieFinal) && tipologieFinal.length > 0) ? tipologieFinal as string[] : undefined;
      const statiArray: string[] | undefined = (stati && Array.isArray(stati) && stati.length > 0) ? stati as string[] : undefined;
      this.segnalazioniService.getSegnalazioniByUtente(dateArray, tipologieArray).subscribe({
        next: (response) => {
          if (response.success) {
            this.segnalazioni = response.data;
            this.segnalazioniOriginali = [...response.data];
            this.segnalazioni.sort((a, b) => {
              const dateA = a.timeStamp ? new Date(a.timeStamp) : new Date(0);
              const dateB = b.timeStamp ? new Date(b.timeStamp) : new Date(0);
              return dateB.getTime() - dateA.getTime();
            });// ordina in ordine decrescente

            this.cdr.detectChanges();
          } else {
            this.dialogService.showError('Errore nel recupero delle segnalazioni Utente');
          }
          console.log("segnalazioni: ", this.segnalazioni);
        },
        error: (error) => {
          console.error('Error fetching segnalazioni:', error);
          this.dialogService.showError('Errore nel recupero delle segnalazioni Utente');
        }
      });
    }
  }

  caricaSegnalazioniCluster() {
    if (this.currentUser?.tipoUtente === TipoUtente.FDO || this.currentUser?.tipoUtente === TipoUtente.COMUNALE) {
      this.segnalazioniService.getAllSegnalazioni().subscribe({
        next: (response) => {
          if (response.success) {
            this.segnalazioni = response.data;
            this.segnalazioniOriginali = [...response.data];
            this.segnalazioni.sort((a, b) => {
              const dateA = a.timeStamp ? new Date(a.timeStamp) : new Date(0);
              const dateB = b.timeStamp ? new Date(b.timeStamp) : new Date(0);
              return dateB.getTime() - dateA.getTime();
            });// ordina in ordine decrescente

            this.cdr.detectChanges();

            // Prima pulisci tutti i marker esistenti

            // Aggiungi i marker con clustering
            if (this.segnalazioni && this.segnalazioni.length) {
              this.segnalazioni.forEach(s => {
                const lon = Number(s.coordinateGps?.coordinates?.at(0));
                const lat = Number(s.coordinateGps?.coordinates?.at(1));
                if (lon && lat) {
                  this.mappaService.addMarker([lat, lon])
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
            this.segnalazioniOriginali = [...response.data];
            this.segnalazioni.sort((a, b) => {
              const dateA = a.timeStamp ? new Date(a.timeStamp) : new Date(0);
              const dateB = b.timeStamp ? new Date(b.timeStamp) : new Date(0);
              return dateB.getTime() - dateA.getTime();
            });// ordina in ordine decrescente

            this.cdr.detectChanges();
            // Prima pulisci tutti i marker esistenti

            // Aggiungi i marker con clustering
            if (this.segnalazioni && this.segnalazioni.length) {
              this.segnalazioni.forEach(s => {
                const lon = Number(s.coordinateGps?.coordinates?.at(0));
                const lat = Number(s.coordinateGps?.coordinates?.at(1));
                if (lon && lat) {
                  this.mappaService.addMarker([lat, lon])
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


  aggiungiMarkerSegnalazioni() {
    if (this.segnalazioni && this.segnalazioni.length) {
      this.segnalazioni.forEach(s => {
        const lon = Number(s.coordinateGps?.coordinates?.at(0));
        const lat = Number(s.coordinateGps?.coordinates?.at(1));
        if (lon && lat) {
          this.mappaService.addMarker([lat, lon])
            .bindPopup(`<b>${s.tipologia}</b><br>${s.descrizione}`);
        }
      });
    }

  }

  creaSegnalazione(tipoSegnalazione: string) {
    console.log("hai premuto: ", tipoSegnalazione);
    this.tipoSegnalazione = tipoSegnalazione;
    if (!this.showSegnalazioneForm) {
      this.showSegnalazioneForm = !this.showSegnalazioneForm;
    }
  }

  confermaNuovaSegnalazione() {
    this.dialogService.showCustom(
      'Conferma Segnalazione',
      'Vuoi confermare la segnalazione?',
      'Conferma',
      'Annulla'
    ).subscribe(async result => {
      if (result === 'confirm') {
        this.showSegnalazioneForm = false;
        console.log('Segnalazione confermata!');

        // Recupera i valori dai form groups
        const tipologia = this.firstFormGroup.get('newTipologiaSegnalazione')?.value;
        const descrizione = this.secondFormGroup.get('newDescrizione')?.value;

        if (!tipologia) {
          this.dialogService.showError('Tipologia segnalazione mancante');
          return;
        }

        try {
          // Aspetta di ricevere la posizione GPS
          const coordinates = await this.getCurrentPosition();
          console.log('Coordinate GPS ricevute:', coordinates);

          const segnalazione: Segnalazione = {
            tipologia: tipologia as TipoSegnalazione,
            descrizione: descrizione || '',
            coordinateGps: {
              type: 'Point',
              coordinates: [coordinates.lng, coordinates.lat]
            }
          };

          console.log('Segnalazione completa prima dell\'invio:', JSON.stringify(segnalazione, null, 2));

          this.creaSegnalazioneConDati(segnalazione);

        } catch (error) {
          console.error('Errore nel recuperare le coordinate GPS:', error);
          this.dialogService.showError('Impossibile ottenere la posizione GPS');

          // Procedi comunque con la creazione della segnalazione, ma senza coordinate
          const segnalazione: Segnalazione = {
            tipologia: tipologia as TipoSegnalazione,
            descrizione: descrizione || ''
          };

          this.creaSegnalazioneConDati(segnalazione);
        }
      } else if (result === 'cancel') {
        console.log('Operazione annullata');
      }
    });
  }

  // Metodo helper per ottenere la posizione come Promise
  private getCurrentPosition(): Promise<{ lat: number, lng: number }> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // Aumentato il timeout a 10 secondi
          maximumAge: 0
        }
      );
    });
  }

  // Metodo helper per creare la segnalazione
  private creaSegnalazioneConDati(segnalazione: Segnalazione): void {
    this.segnalazioniService.createSegnalazione(segnalazione).subscribe({
      next: (response) => {
        if (response.success) {
          this.dialogService.showSuccess("Operazione effettuata", 'Segnalazione creata con successo!');
          console.log('Segnalazione creata:', response.data);

          // Aggiorna la mappa con i nuovi dati
          this.caricaSegnalazioniCluster();

          // Reset dei form
          this.firstFormGroup.reset();
          this.secondFormGroup.reset();
        }
      },
      error: (error) => {
        console.error('Errore nella creazione della segnalazione:', error);
        this.dialogService.showError('Errore nella creazione della segnalazione');
      }
    });

    this.cdr.detectChanges();
  }

  applicaFiltri(): void {
    const startDate = this.campaignOne.get('start')?.value;
    const endDate = this.campaignOne.get('end')?.value;
    const tipologieFinal = this.tipologieList;
    const stati = this.statoSegnalazioni.value;

    console.log('Filtri applicati:', {
      dataInizio: startDate,
      dataFine: endDate,
      tipologie: tipologieFinal,
      stati: stati
    });

    const dateArray: Date[] | undefined = (startDate && endDate) ? [startDate, endDate] : undefined;
    const tipologieArray: string[] | undefined = (tipologieFinal && Array.isArray(tipologieFinal) && tipologieFinal.length > 0) ? tipologieFinal as string[] : undefined;
    const statiArray: string[] | undefined = (stati && Array.isArray(stati) && stati.length > 0) ? stati as string[] : undefined;
    // Chiama getAllSegnalazioni senza controlli - il BE gestisce i permessi
    if (this.currentUser?.tipoUtente !== TipoUtente.CITTADINO) {
      this.segnalazioniService.getAllSegnalazioni(dateArray, tipologieArray).subscribe({
        next: (response) => {
          if (response.success) {
            this.segnalazioni = response.data;
            this.segnalazioni.sort((a, b) => {
              const dateA = a.timeStamp ? new Date(a.timeStamp) : new Date(0);
              const dateB = b.timeStamp ? new Date(b.timeStamp) : new Date(0);
              return dateB.getTime() - dateA.getTime();
            });
            console.log('Segnalazioni filtrate ricevute:', this.segnalazioni.length);
            this.cdr.detectChanges();
          } else {
            this.dialogService.showError('Errore nel recupero delle segnalazioni filtrate');
          }
        },
        error: (error) => {
          console.error('Error fetching filtered segnalazioni:', error);
          this.dialogService.showError('Errore nel recupero delle segnalazioni filtrate');
        }
      });
    } else if (this.currentUser?.tipoUtente === TipoUtente.CITTADINO) {
      this.segnalazioniService.getSegnalazioniByUtente(dateArray, tipologieArray).subscribe({
        next: (response) => {
          if (response.success) {
            this.segnalazioni = response.data;
            this.segnalazioni.sort((a, b) => {
              const dateA = a.timeStamp ? new Date(a.timeStamp) : new Date(0);
              const dateB = b.timeStamp ? new Date(b.timeStamp) : new Date(0);
              return dateB.getTime() - dateA.getTime();
            });
            console.log('Segnalazioni filtrate ricevute:', this.segnalazioni.length);
            this.cdr.detectChanges();
          } else {
            this.dialogService.showError('Errore nel recupero delle segnalazioni Utente filtrate');
          }
        },
        error: (error) => {
          console.error('Error fetching filtered segnalazioni:', error);
          this.dialogService.showError('Errore nel recupero delle segnalazioni Utente filtrate');
        }
      });
    }

  }

  resetFiltri(): void {
    // Reset dei form controls
    this.campaignOne.reset({
      start: new Date(year, month, today.getDate() - 30),
      end: new Date(year, month, today.getDate())
    });

    this.tipologie.reset();
    this.statoSegnalazioni.reset();

    console.log('Filtri resettati');

    // Ripristina tutte le segnalazioni originali
    this.segnalazioni = [...this.segnalazioniOriginali];
    this.cdr.detectChanges();
  }
}
