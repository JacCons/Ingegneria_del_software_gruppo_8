import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { SegnalazioniPageComponent } from './pages/segnalazioni-page/segnalazioni-page.component';
import { NotifichePageComponent } from './pages/notifiche-page/notifiche-page.component';
import { GestioneUtentiPageComponent } from './pages/gestione-utenti-page/gestione-utenti-page.component';
import { RichiestaAllocazioneComponent } from './pages/richiesta-allocazione/richiesta-allocazione.component';
import { AppComponent } from './app.component';
import { AuthGuard } from './guards/auth.guard';


export const routes: Routes = [
    { path: "login", component: LoginPageComponent },
    { path: "segnalazioni", component: SegnalazioniPageComponent, canActivate: [AuthGuard] },
    { path: "notifiche", component: NotifichePageComponent, canActivate: [AuthGuard], data: { roles: ['UtenteFDO', 'UtenteComunale'] } },
    { path: "gestioneUtenti", component: GestioneUtentiPageComponent, canActivate: [AuthGuard], data: { roles: ['UtenteComunale'] } },
    { path: "richiesteAllocazione", component: RichiestaAllocazioneComponent, canActivate: [AuthGuard], data: { roles: ['UtenteComunale'] } },
    { path: '**', redirectTo: '/login'}
];
