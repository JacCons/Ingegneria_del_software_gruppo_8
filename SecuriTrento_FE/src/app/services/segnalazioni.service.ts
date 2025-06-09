import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Segnalazione } from '../models/segnalazione.model';
import { ApiResponse } from '../models/api-response.model';
import { AutenticazioneService } from './autenticazione.service';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SegnalazioniService {
  //private apiBasePathUrl = 'http://localhost:3000/api';
  private apiBasePathUrl = environment.apiBasePathUrl;
  constructor(private http: HttpClient,
    private autenticazioneService: AutenticazioneService
  ) { }

  getAllSegnalazioni(date?: Date[], tipologie?: string[], stati?: string[]): Observable<ApiResponse<Segnalazione[]>> {
    let params = new HttpParams();

    // Array di date [dataInizio, dataFine]
    if (date && date.length >= 2) {
      params = params.set('dataDa', date[0].toISOString());
      params = params.set('dataA', date[1].toISOString());
    }

    // Array di tipologie
    if (tipologie && tipologie.length > 0) {
      tipologie.forEach(tipologia => {
        params = params.append('tipologia', tipologia);
      });
    }

    // Array di stati
    if (stati && stati.length > 0) {
      params = params.set('stato', stati.join(','));
    }

    return this.http.get<ApiResponse<Segnalazione[]>>(
      `${this.apiBasePathUrl}/segnalazioni`,
      {
        headers: this.autenticazioneService.getAuthHeaders(),
        params: params
      }
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

  getSegnalazioniByUtente(date?: Date[], tipologie?: string[], stati?: string[]): Observable<ApiResponse<Segnalazione[]>> {
    let params = new HttpParams();

    // Array di date [dataInizio, dataFine]
    if (date && date.length >= 2) {
      params = params.set('dataDa', date[0].toISOString());
      params = params.set('dataA', date[1].toISOString());
    }

    // Array di tipologie
    if (tipologie && tipologie.length > 0) {
      tipologie.forEach(tipologia => {
        params = params.append('tipologia', tipologia);
      });
    }

    // Array di stati
    if (stati && stati.length > 0) {
      params = params.set('stato', stati.join(','));
    }
    return this.http.get<ApiResponse<Segnalazione[]>>(
      `${this.apiBasePathUrl}/segnalazioni/mySegnalazioni`,
      {
        headers: this.autenticazioneService.getAuthHeaders(),
        params: params
      }
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
