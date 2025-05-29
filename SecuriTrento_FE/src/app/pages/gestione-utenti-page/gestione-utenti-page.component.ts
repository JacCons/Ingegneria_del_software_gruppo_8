import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { TipoFDO, Utente, TipoUtente } from '../../models/utente.model';
import { UtentiService } from '../../services/utenti.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'gestioneutenti-page',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gestione-utenti-page.component.html',
  styleUrl: './gestione-utenti-page.component.scss'
})

export class GestioneUtentiPageComponent {

  hide = signal(true);
  TipoUtente = TipoUtente;
  TipoFDO = TipoFDO;
  cellularPhone: string = "";
  password: string = "";
  name: string = "";
  surname: string = "";
  authPage: string = "register"; // "login" or "register"
  tipologiaUtente?: TipoUtente;
  typeUtente: string = '';
  showForm = false;
  showUsers = false

  utentiFDO: Utente[] = [];
  utentiComunali: Utente[] = [];

  corpoFDO?: TipoFDO;
  private utentiService = inject(UtentiService);
  private dialogService = inject(DialogService);

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    this.utentiService.getUtentiByType('fdo').subscribe({
      next: (response) => {
        if (response.success) {
          this.utentiFDO = response.data;
        } else {
          this.dialogService.showError("Errore nel recupero degli utenti FDO");
        }
      },
      error: (error) => {
        this.dialogService.showError("Errore nel recupero degli utenti FDO");
        console.error('Error fetching users:', error);
      }
    });

    this.utentiService.getUtentiByType('comunale').subscribe({
      next: (response) => {
        if (response.success) {
          this.utentiComunali = response.data;
        } else {
          this.dialogService.showError("Errore nel recupero degli utenti Comunali");
        }
      },
      error: (error) => {
        this.dialogService.showError("Errore nel recupero degli utenti Comunali");
        console.error('Error fetching users:', error);
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.showUsers = false; 
    }
  }

  toggleShow() {
    this.showUsers = !this.showUsers;
    if (this.showUsers){
      this.showForm = false; 
    }
  }

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
    console.log("tipologiaUtente", this.tipologiaUtente);
  }

  creaUtente(event: MouseEvent) {
    console.log("nuovo utente");
    console.log(this.tipologiaUtente);
    const newUser: Partial<Utente> = {
      nome: this.name,
      cognome: this.surname,
      telefono: this.cellularPhone,
      password: this.password,
      tipoUtente: this.tipologiaUtente,
    };

    if (this.tipologiaUtente === TipoUtente.FDO) {
      (newUser as any).TipoFDO = this.corpoFDO;
    }

    if (this.tipologiaUtente === TipoUtente.COMUNALE) {
      this.typeUtente = "comunale";
    } else {
      this.typeUtente = "fdo";
    }
    console.log("typeUtente", this.typeUtente);

    this.utentiService.registerUser(this.typeUtente, newUser).subscribe({
      next: (response) => {
        if (response.success) {
          this.dialogService.showSuccess("Creazione account avvenuta con successo", "Premi Ok per proseguire").subscribe(result => {
          });
        }
      },
      error: (error) => {
        this.dialogService.showError("Errore nella registrazione dell'utente");
        console.error('Error creating user:', error);
      }
    });
  }

  checkRegisterNotEmpty() {
    const phoneNumber = this.cellularPhone?.trim() || '';
    const password = this.password?.trim() || '';
    const name = this.name?.trim() || '';
    const surname = this.surname?.trim() || '';
    const isNameValid = /^[a-zA-Z\s]+$/.test(name);
    const isSurnameValid = /^[a-zA-Z\s]+$/.test(surname);
    const isPhoneValid = /^[0-9]{1,15}$/.test(phoneNumber);
    const isPasswordValid = password.length >= 7;
    const istipologiaUtenteValid = !!this.tipologiaUtente; // true se non è undefined o vuoto
    const isCorpoFDOValid = this.tipologiaUtente === TipoUtente.FDO ? !!this.corpoFDO : true;

    return isPhoneValid && isPasswordValid && isNameValid && isSurnameValid && istipologiaUtenteValid && isCorpoFDOValid;
  }

  validatePhoneInput(event: KeyboardEvent): boolean {
    const isDigit = /^\d$/.test(event.key);
    const isControlKey = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key);

    const currentValue = (event.target as HTMLInputElement).value;
    if (currentValue.length >= 10 && !isControlKey) {
      event.preventDefault();
      return false;
    }

    if (!isDigit && !isControlKey) {
      event.preventDefault();
      return false;
    }

    return true;
  }
}
