import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { MatButtonModule, MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MappaService } from '../../services/mappa.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../services/dialog.service';
import { UtentiService } from '../../services/utenti.service';
import { Utente } from '../../models/utente.model';
import { AutenticazioneService } from '../../services/autenticazione.service';


@Component({
  selector: 'login-page',
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatTooltip, MatButton, FormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})

export class LoginPageComponent {
  //variabili di support
  hide = signal(true);

  cellularPhone: string = "";
  password: string = "";
  name: string = "";
  surname: string = "";
  authPage: string = "login";
  private dialogService = inject(DialogService);
  private utentiService = inject(UtentiService);
  private autenticazioneService = inject(AutenticazioneService);
  private mappaService = inject(MappaService);

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  //pulsante mostra/nascondi password
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  clickAccedi(event: MouseEvent) {
    if (!this.checkLoginNotEmpty()) {
      this.dialogService.showError("Compila tutti i campi per accedere");
      return;
    }

    this.autenticazioneService.loginUser({
      telefono: this.cellularPhone,
      password: this.password
    }).subscribe({
      next: (response) => {
        // Salva il token JWT
        localStorage.setItem('token', response.token);

        // Salva l'utente corrente
        this.autenticazioneService.setCurrentUser(response.utente);

        this.dialogService.showSuccess("Login effettuato con successo", "Premi Ok per proseguire").subscribe(result => {
          if (result === 'confirm') {
            this.router.navigate(['/segnalazioni']);
          }
        });
      },
      error: (error) => {
        this.dialogService.showError("Telefono o password errati OR Utente disattivato");
        console.error('Errore login:', error);
      }
    });

    this.mappaService.initMap("map"); // inizializza la mappa dopo il login
  }

  switchToLogin() {
    this.authPage = "login";
  }

  clickRegistrati(event: MouseEvent) {
    console.log(this.cellularPhone);
    console.log(this.password)
    if (this.authPage === "login") {
      this.authPage = "register";
    } else {
      console.log("nuovo utente creato");
      console.log(this.cellularPhone);
      console.log(this.password);
      console.log(this.name);
      console.log(this.surname);

      console.log("UTENTE APPENA REGISTRATO E' STATO AUTENTICATO");  //inserisci qua login

      const newUser: Utente = {
        nome: this.name,
        cognome: this.surname,
        telefono: this.cellularPhone,
        password: this.password
      }

      this.utentiService.registerUser("standard", newUser).subscribe({
        next: (response) => {
          if (response.success) {
            // Logga l'utente dopo la registrazione
            this.autenticazioneService.setCurrentUser(response.data);
            this.dialogService.showSuccess("Registrazione avvenuta con successo", "Premi Ok per proseguire").subscribe(result => {
              if (result === 'confirm') {
                this.router.navigate(['/segnalazioni']);
              }
            });
          }
        },
        error: (error) => {
          this.dialogService.showError("Errore nella registrazione dell'utente");
          console.error('Error creating user:', error);
        }
      });

    }
  }

  checkLoginNotEmpty() {
    const phoneNumber = this.cellularPhone?.trim() || '';
    const password = this.password?.trim() || '';
    const isPhoneValid = /^[0-9]{1,15}$/.test(phoneNumber);
    const isPasswordValid = password.length >= 7;

    return isPhoneValid && isPasswordValid;
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

    if (this.authPage === "register") {
      return isPhoneValid && isPasswordValid && isNameValid && isSurnameValid;
    } else {
      return true
    }
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
