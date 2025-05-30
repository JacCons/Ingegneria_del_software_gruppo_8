import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../services/dialog.service';
import { SegnalazioniService } from '../../services/segnalazioni.service';
import { Segnalazione, TipoSegnalazione } from '../../models/segnalazione.model';
import { MappaService } from '../../services/mappa.service';

@Component({
  selector: 'app-segnalazioni-page',
  imports: [MatIconModule,
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
    MatButtonModule,
    CommonModule],
  templateUrl: './segnalazioni-page.component.html',
  styleUrl: './segnalazioni-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class SegnalazioniPageComponent {

  constructor(
    private router: Router,
    private mappaService: MappaService
  ) { }

  private cdr = inject(ChangeDetectorRef);
  private dialogService = inject(DialogService);
  private segnalazioniService = inject(SegnalazioniService);
  private _formBuilder = inject(FormBuilder);
  disableSelect = new FormControl(false);
  tipoSegnalazione : string = '';
  showSegnalazioneForm = false;
  segnalazioni: Segnalazione[] = [];

  ngOnInit(): void {
    this.segnalazioniService.getAllSegnalazioni().subscribe({
      next: (response) => {
        if (response.success) {
          this.segnalazioni = response.data;
          this.cdr.detectChanges();
        } else {
          this.dialogService.showError('Errore nel recupero delle segnalazioni');
        }
        console.log("segnalazioni: ", this.segnalazioni);
      },
      error: (error) => {
        console.error('Error fetching segnalazioni:', error);
        this.dialogService.showError('Errore nel recupero delle segnalazioni');
      }
    });
  }

  firstFormGroup = this._formBuilder.group({
    newTipologiaSegnalazione: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    newDescrizione: ['', Validators.required],
  });
  isLinear = false;

  ngAfterViewInit(): void {
    this.mappaService.initMap('map');
    this.caricaSegnalazioniCluster();
  }

  caricaSegnalazioniCluster() {
  this.segnalazioniService.getAllSegnalazioni().subscribe({
    next: (response) => {
      if (response.success) {
        this.segnalazioni = response.data;
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
}


  aggiungiMarkerSegnalazioni() {
    if (this.segnalazioni && this.segnalazioni.length) {
      this.segnalazioni.forEach(s => {
        const lon = Number(s.coordinateGps?.coordinates?.at(0));
        const lat = Number(s.coordinateGps?.coordinates?.at(1));
        if ( lon && lat ) {
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
  ).subscribe(result => {
    if (result === 'confirm') {
      this.showSegnalazioneForm = false;
      console.log('Segnalazione confermata!');

      // Recupera i valori dai form groups
      const tipologia = this.firstFormGroup.get('newTipologiaSegnalazione')?.value;
      const descrizione = this.secondFormGroup.get('newDescrizione')?.value;

      const segnalazione: Segnalazione = {
        tipologia: tipologia as TipoSegnalazione,
        descrizione: descrizione || ''
      };

      // Verifica che i dati siano validi prima di inviare
      if (!tipologia) {
        this.dialogService.showError('Tipologia segnalazione mancante');
        return;
      }

      this.segnalazioniService.createSegnalazione(segnalazione).subscribe({
        next: (response) => {
          if (response.success) {
            this.dialogService.showSuccess("Operazione effettuata",'Segnalazione creata con successo!');
            console.log('Segnalazione creata:', response.data);
            // Aggiorna la mappa con i nuovi dati
            this.caricaSegnalazioniCluster();
            
            // Reset dei form
            this.firstFormGroup.reset();
            this.secondFormGroup.reset();
          } 
        },
      });

      this.cdr.detectChanges();

    } else if (result === 'cancel') {
      console.log('Operazione annullata');
    }
  });
}

}
