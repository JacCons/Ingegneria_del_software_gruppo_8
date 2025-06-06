import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Segnalazione } from '../models/segnalazione.model';
import { ApiResponse } from '../models/api-response.model';
import { AutenticazioneService } from './autenticazione.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SegnalazioniService {
  private apiBasePathUrl = 'http://localhost:3000/api';
  constructor(private http: HttpClient,
    private autenticazioneService: AutenticazioneService
  ) { }

  getAllSegnalazioni(): Observable<ApiResponse<Segnalazione[]>> {
    return this.http.get<ApiResponse<Segnalazione[]>>(
      `${this.apiBasePathUrl}/segnalazioni`,
      { headers: this.autenticazioneService.getAuthHeaders() }
    );
  }

  getSegnalazioneById(segnalazioneID: String): Observable<ApiResponse<Segnalazione>> {
    return this.http.get<ApiResponse<Segnalazione>>(
      `${this.apiBasePathUrl}/segnalazioni/${segnalazioneID}`,
      { headers: this.autenticazioneService.getAuthHeaders() }
    );
  }

  getSegnalazioniNearby(utenteFdoID: String, radius: number): Observable<ApiResponse<Segnalazione[]>> {
    return this.http.get<ApiResponse<Segnalazione[]>>(
      `${this.apiBasePathUrl}/segnalazioni/nearby/${utenteFdoID}?radius=${radius}`,
      { headers: this.autenticazioneService.getAuthHeaders() }
    );
  }

  deleteSegnalazione(segnalazioneID: String): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.apiBasePathUrl}/segnalazioni/${segnalazioneID}`,
      { headers: this.autenticazioneService.getAuthHeaders() }
    );
  }

  updateSegnalazione(segnalazioneID: string, segnalazione: Segnalazione): Observable<ApiResponse<Segnalazione>> {
    return this.http.put<ApiResponse<Segnalazione>>(
      `${this.apiBasePathUrl}/segnalazioni/${segnalazioneID}`,
      segnalazione,
      { headers: this.autenticazioneService.getAuthHeaders() }
    );
  }

  createSegnalazione(segnalazione: Segnalazione): Observable<ApiResponse<Segnalazione>> {
    const headers = this.autenticazioneService.getAuthHeaders().set('Content-Type', 'application/json');
    return this.http.post<ApiResponse<Segnalazione>>(
      `${this.apiBasePathUrl}/segnalazioni`,
      segnalazione,
      { headers }
    );
  }
}
