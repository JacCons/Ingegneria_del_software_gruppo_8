import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AutenticazioneService } from '../../services/autenticazione.service';
import { Utente, TipoUtente } from '../../models/utente.model';
import { CommonModule } from '@angular/common';
import { SegnalazioniService } from '../../services/segnalazioni.service';
import { Segnalazione } from '../../models/segnalazione.model';
import { NotificaSegnalazione } from '../../models/notificaSegnalazione.model';
import { NotificheService } from '../../services/notifiche.service';
import { ChangeDetectorRef } from '@angular/core';
import { RichiesteAllocazioneService } from '../../services/richieste-allocazione.service';
import { RichiestaAllocazione } from '../../models/richieste-allocazione.model';
import { NotificaConfermaRichiestaAllocazione } from '../../models/notificaConfermaRichiestaAllocazione.model';

@Component({
  selector: 'notifiche-page',
  imports: [CommonModule],
  templateUrl: './notifiche-page.component.html',
  styleUrl: './notifiche-page.component.scss'
})
export class NotifichePageComponent {
  private autenticazioneService = inject(AutenticazioneService);
  private segnalazioniService = inject(SegnalazioniService);
  private notificheService = inject(NotificheService);
  private richiesteAllocazioneService = inject(RichiesteAllocazioneService);
  private cdr = inject(ChangeDetectorRef);

  currentUser: Utente | null = null;
  TipoUtente = TipoUtente;
  segnalazioni: Segnalazione[] = [];
  richiesteAllocazione: RichiestaAllocazione[] = [];
  notificheSegnalazioni: NotificaSegnalazione[] = [];
  notificheConfermaRichiesteAllocazione: NotificaConfermaRichiestaAllocazione[] = [];

  ngOnInit(): void {
    this.autenticazioneService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log("currentUser", this.currentUser);
    });

    if (this.currentUser?.tipoUtente === TipoUtente.FDO) {
      this.caricaNotificheSegnalazioni();
      this.caricaRichiesteAllocazione();
    }else if (this.currentUser?.tipoUtente === TipoUtente.COMUNALE) {
      this.caricaNotificheConfermaRichiesteAllocazione();
    }
  }

  caricaNotificheSegnalazioni() {
    if (this.currentUser && this.currentUser.tipoUtente === TipoUtente.FDO && this.currentUser._id) {
      this.notificheService.getNotificheSegnalazioni(this.currentUser._id, true, 2500).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificheSegnalazioni = response.data;
            console.log("notifiche segnalazioni: ", this.notificheSegnalazioni);
          } else {
            console.error('Errore nel recupero delle notifiche segnalazioni:', response.message);
          }
        },
        error: (error) => {
          console.error('Error fetching segnalazioni:', error);
        }
      });

      this.cdr.detectChanges();
    }
  }

  caricaRichiesteAllocazione() {
    this.richiesteAllocazioneService.getRichiesteAllocazione().subscribe({
      next: (response) => {
        if (response.success) {
          this.richiesteAllocazione = response.data;
          console.log("richieste allocazione: ", this.richiesteAllocazione);
        } else {
          console.error('Errore nel recupero delle richieste di allocazione');
        }
      },
      error: (error) => {
        console.error('Error fetching richieste allocazione:', error);
      }
    });
  }

  caricaNotificheConfermaRichiesteAllocazione(){
    this.notificheService.getNotificheConfermaRichiesteAllocazione().subscribe({
        next: (response) => {
          if (response.success) {
            this.notificheConfermaRichiesteAllocazione = response.data;
            console.log("notifiche conferma segnalazioni: ", this.notificheSegnalazioni);
          } else {
            console.error('Errore nel recupero delle notifiche conferma richiesta segnalazione:', response.message);
          }
        },
        error: (error) => {
          console.error('Error fetching segnalazioni:', error);
        }
      });

      this.cdr.detectChanges();

  }

  onButtonClick(richiestaId: string | undefined, richiesta: RichiestaAllocazione) {
    console.log('Bottone cliccato per richiesta ID:', richiestaId);
    console.log('Dati richiesta:', richiesta);
    console.log('Stato attuale:', richiesta.stato);

    if (richiestaId) {
      // Aggiorna lo stato della richiesta
      richiesta.stato = 'accettato' as any;

      // Chiama il metodo update del service
      this.richiesteAllocazioneService.updateRichiestaAllocazione(richiestaId, richiesta).subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Richiesta aggiornata con successo:', response.data);
            // Ricarica le richieste per aggiornare la vista
            this.caricaRichiesteAllocazione();
          } else {
            console.error('Errore nell\'aggiornamento della richiesta:', response.message);
          }
        },
        error: (error) => {
          console.error('Error updating richiesta:', error);
          // Ripristina lo stato precedente in caso di errore
          richiesta.stato = 'in attesa' as any;
        }
      });
    }
    this.caricaRichiesteAllocazione();
    this.cdr.detectChanges();
  }
}
