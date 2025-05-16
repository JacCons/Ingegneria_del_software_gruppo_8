import {Component, ChangeDetectionStrategy, inject} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {FormControl} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-segnalazioni-page',
  imports: [MatIconModule, 
    MatDividerModule, 
    MatButtonModule, 
    MatCardModule, 
    MatStepperModule, 
    FormsModule, 
    ReactiveFormsModule, 
    MatFormFieldModule, 
    MatInputModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule, 
    CommonModule],
  templateUrl: './segnalazioni-page.component.html',
  styleUrl: './segnalazioni-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SegnalazioniPageComponent {

  constructor(
    private router: Router
  ){}

  private _formBuilder = inject(FormBuilder);
  disableSelect = new FormControl(false);
  tipoSegnalazione = "";
  showSegnalazioneForm = false;
  ngOnInit(): void{
  }

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isLinear = false;

  creaSegnalazione(tipoSegnalazione: string){
    console.log("hai premuto: ", tipoSegnalazione);
    this.tipoSegnalazione = tipoSegnalazione;
    this.showSegnalazioneForm = !this.showSegnalazioneForm;
  }

}
