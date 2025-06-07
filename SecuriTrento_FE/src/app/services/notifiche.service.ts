import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiResponse } from '../models/api-response.model';
import { Observable } from 'rxjs';
import { AutenticazioneService } from './autenticazione.service';
import { NotificaSegnalazione } from '../models/notificaSegnalazione.model';
import { NotificaConfermaRichiestaAllocazione } from '../models/notificaConfermaRichiestaAllocazione.model';

@Injectable({
  providedIn: 'root'
})
export class NotificheService {
  private apiBasePathUrl = 'http://localhost:3000/api';
  constructor(private http: HttpClient,
    private autenticazioneService: AutenticazioneService
  ) { }

  getNotificheSegnalazioni(utenteID: string, autoCheck?: boolean, raggio?: number): Observable<ApiResponse<NotificaSegnalazione[]>> {
    let params = new HttpParams();

    if (autoCheck !== undefined) {
      params = params.set('autoCheck', autoCheck.toString());
    }
    
    if (raggio !== undefined) {
      params = params.set('raggio', raggio.toString());
    }

    return this.http.get<ApiResponse<NotificaSegnalazione[]>>(
      `${this.apiBasePathUrl}/notifiche/notifiche-segnalazioni/destinatario/${utenteID}`,
      { headers: this.autenticazioneService.getAuthHeaders(),
        params: params
       }
    );
  }

  getNotificheConfermaRichiesteAllocazione(): Observable<ApiResponse<NotificaConfermaRichiestaAllocazione[]>> {
    return this.http.get<ApiResponse<NotificaConfermaRichiestaAllocazione[]>>(
      `${this.apiBasePathUrl}/notifiche/notifiche-conferma-richieste-allocazione`,
      { headers: this.autenticazioneService.getAuthHeaders() }
    );
  }

}
