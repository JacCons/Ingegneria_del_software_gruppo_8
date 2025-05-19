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
    private router: Router
  ) { }

  private cdr = inject(ChangeDetectorRef);
  private dialogService = inject(DialogService);
  private segnalazioniService = inject(SegnalazioniService);
  private _formBuilder = inject(FormBuilder);
  disableSelect = new FormControl(false);
  tipoSegnalazione : string = '';
  newTipologiaSegnalazione : TipoSegnalazione = TipoSegnalazione.ALTRO;
  showSegnalazioneForm = false;
  segnalazioni: Segnalazione[] = [];
  newDescrizione: string = '';
  newTipologia: TipoSegnalazione = TipoSegnalazione.ALTRO;

  ngOnInit(): void {
  }

  firstFormGroup = this._formBuilder.group({
    newTipologia: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    newDescrizione: ['', Validators.required],
  });
  isLinear = false;


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

        const segnalazione: Segnalazione = {
          tipologia: this.newTipologiaSegnalazione as TipoSegnalazione,
          descrizione: this.newDescrizione
        };

        this.segnalazioniService.createSegnalazione(segnalazione).subscribe({
          next: (response) => {
            if (response.success) {
              this.dialogService.showSuccess('Segnalazione creata con successo!');
              console.log('Segnalazione creata:', response.data);
            } else {
              this.dialogService.showError('Errore nella creazione della segnalazione');
            }
          },
          error: (error) => {
            console.error('Error creating segnalazione:', error);
            this.dialogService.showError('Errore nella creazione della segnalazione');
          }
        });

        this.cdr.detectChanges();

      } else if (result === 'cancel') {
        console.log('Operazione annullata');
      }
    });

  }

}
