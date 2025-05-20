import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { SegnalazioniPageComponent } from './pages/segnalazioni-page/segnalazioni-page.component';
import { NotifichePageComponent } from './pages/notifiche-page/notifiche-page.component';
import { GestioneUtentiPageComponent } from './pages/gestione-utenti-page/gestione-utenti-page.component';
import { AppComponent } from './app.component';


export const routes: Routes = [
    { path: "login", component: LoginPageComponent },
    { path: "segnalazioni", component: SegnalazioniPageComponent },
    { path: "notifiche", component: NotifichePageComponent },
    { path: "gestioneUtenti", component: GestioneUtentiPageComponent },
    { path: "app", component: AppComponent}

];
