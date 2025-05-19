import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Segnalazione } from '../models/segnalazione.model';
import { ApiResponse } from '../models/api-response.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SegnalazioniService {
  private apiBasePathUrl = 'http://localhost:3000';
  constructor(private http: HttpClient) { }

  getAllSegnalazioni(): Observable<ApiResponse<Segnalazione[]>> {
    return this.http.get<ApiResponse<Segnalazione[]>>(`${this.apiBasePathUrl}/segnalazioni`);
  }

  getSegnalazioneById(segnalazioneID: String): Observable<ApiResponse<Segnalazione>> {
    return this.http.get<ApiResponse<Segnalazione>>(`${this.apiBasePathUrl}/segnalazioni/${segnalazioneID}`);
  }

  deleteSegnalazione(segnalazioneID: String): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiBasePathUrl}/segnalazioni/${segnalazioneID}`);
  }

  updateSegnalazione(segnalazioneID : string, segnalazione: Segnalazione): Observable<ApiResponse<Segnalazione>> {
    return this.http.put<ApiResponse<Segnalazione>>(
      `${this.apiBasePathUrl}/segnalazioni/${segnalazioneID}`,
      segnalazione
    );
  }

  createSegnalazione(segnalazione: Segnalazione): Observable<ApiResponse<Segnalazione>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<ApiResponse<Segnalazione>>(`${this.apiBasePathUrl}/segnalazioni`,
      segnalazione,
      { headers });
  }
}
