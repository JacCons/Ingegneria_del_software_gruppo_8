import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { DialogService } from './services/dialog.service';
import { SegnalazioniService } from './services/segnalazioni.service';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { MappaService } from './services/mappa.service';
import { UtentiService } from './services/utenti.service';
import { AutenticazioneService } from './services/autenticazione.service';
import { NotificheService } from './services/notifiche.service';
import { RichiesteAllocazioneService } from './services/richieste-allocazione.service';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    DialogService,
    SegnalazioniService,
    MappaService,
    UtentiService,
    AutenticazioneService,
    RichiesteAllocazioneService,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    DialogService,
    SegnalazioniService,
    MappaService,
    UtentiService,
    AutenticazioneService,
    NotificheService
  ]
};
