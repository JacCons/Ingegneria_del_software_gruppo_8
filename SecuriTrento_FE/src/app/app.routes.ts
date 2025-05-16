import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { SegnalazioniPageComponent } from './pages/segnalazioni-page/segnalazioni-page.component';

export const routes: Routes = [
    { path: "login", component: LoginPageComponent },
    { path: "segnalazioni", component: SegnalazioniPageComponent },

];
