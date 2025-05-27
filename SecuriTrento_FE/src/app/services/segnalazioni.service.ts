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

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAllSegnalazioni(): Observable<ApiResponse<Segnalazione[]>> {
    return this.http.get<ApiResponse<Segnalazione[]>>(
      `${this.apiBasePathUrl}/segnalazioni`,
      { headers: this.getAuthHeaders() }
    );
  }

  getSegnalazioneById(segnalazioneID: String): Observable<ApiResponse<Segnalazione>> {
    return this.http.get<ApiResponse<Segnalazione>>(
      `${this.apiBasePathUrl}/segnalazioni/${segnalazioneID}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getSegnalazioniNearby(utenteFdoID: String, radius: number): Observable<ApiResponse<Segnalazione[]>> {
    return this.http.get<ApiResponse<Segnalazione[]>>(
      `${this.apiBasePathUrl}/segnalazioni/nearby/${utenteFdoID}?radius=${radius}`,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteSegnalazione(segnalazioneID: String): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.apiBasePathUrl}/segnalazioni/${segnalazioneID}`,
      { headers: this.getAuthHeaders() }
    );
  }

  updateSegnalazione(segnalazioneID: string, segnalazione: Segnalazione): Observable<ApiResponse<Segnalazione>> {
    return this.http.put<ApiResponse<Segnalazione>>(
      `${this.apiBasePathUrl}/segnalazioni/${segnalazioneID}`,
      segnalazione,
      { headers: this.getAuthHeaders() }
    );
  }

  createSegnalazione(segnalazione: Segnalazione): Observable<ApiResponse<Segnalazione>> {
    const headers = this.getAuthHeaders().set('Content-Type', 'application/json');
    return this.http.post<ApiResponse<Segnalazione>>(
      `${this.apiBasePathUrl}/segnalazioni`,
      segnalazione,
      { headers }
    );
  }
}
