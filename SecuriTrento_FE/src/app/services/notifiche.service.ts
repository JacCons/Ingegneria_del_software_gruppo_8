import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiResponse } from '../models/api-response.model';
import { Observable } from 'rxjs';
import { AutenticazioneService } from './autenticazione.service';
import { NotificaSegnalazione } from '../models/notificaSegnalazione.model';

@Injectable({
  providedIn: 'root'
})
export class NotificheService {
  private apiBasePathUrl = 'http://localhost:3000/api';
  constructor(private http: HttpClient,
    private autenticazioneService: AutenticazioneService
  ) { }

  getNotificheSegnalazioni(utenteID: string): Observable<ApiResponse<NotificaSegnalazione[]>> {
    return this.http.get<ApiResponse<NotificaSegnalazione[]>>(
      `${this.apiBasePathUrl}/notifiche/notifiche-segnalazioni/destinatario/${utenteID}`,
      { headers: this.autenticazioneService.getAuthHeaders() }
    );
  }

  getNotificheConfermaRichiesteAllocazione(): Observable<ApiResponse<NotificaSegnalazione[]>> {
    return this.http.get<ApiResponse<NotificaSegnalazione[]>>(
      `${this.apiBasePathUrl}/notifiche/notifiche-conferma-richieste-allocazione`,
      { headers: this.autenticazioneService.getAuthHeaders() }
    );
  }

}
