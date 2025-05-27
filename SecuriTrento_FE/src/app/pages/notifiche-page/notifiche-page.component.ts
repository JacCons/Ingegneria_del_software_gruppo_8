import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AutenticazioneService } from '../../services/autenticazione.service';
import { Utente, TipoUtente } from '../../models/utente.model';
import { CommonModule } from '@angular/common';
import { SegnalazioniService } from '../../services/segnalazioni.service';
import { Segnalazione } from '../../models/segnalazione.model';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'notifiche-page',
  imports: [CommonModule],
  templateUrl: './notifiche-page.component.html',
  styleUrl: './notifiche-page.component.scss'
})
export class NotifichePageComponent {
  private autenticazioneService = inject(AutenticazioneService);
  private segnalazioniService = inject(SegnalazioniService);
  private cdr = inject(ChangeDetectorRef);

  currentUser: Utente | null = null;
  TipoUtente = TipoUtente;
  segnalazioni: Segnalazione[] = [];


  ngOnInit(): void {
    this.autenticazioneService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log("currentUser", this.currentUser);
    });

    this.caricaNotificheSegnalazioni();
  }

  caricaNotificheSegnalazioni() {
    if (this.currentUser && this.currentUser.tipoUtente === TipoUtente.FDO && this.currentUser._id) {
      this.segnalazioniService.getSegnalazioniNearby(this.currentUser._id, 2000).subscribe({
        next: (response) => {
          if (response.success) {
            this.segnalazioni = response.data;
            console.log("segnalazioni: ", this.segnalazioni);
          } else {
            console.error('Errore nel recupero delle segnalazioni');
          }
        },
        error: (error) => {
          console.error('Error fetching segnalazioni:', error);
        }
      });

      this.cdr.detectChanges();
    }

  }

}
