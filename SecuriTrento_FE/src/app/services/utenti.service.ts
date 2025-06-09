import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Segnalazione } from '../models/segnalazione.model';
import { ApiResponse } from '../models/api-response.model';
import { Observable } from 'rxjs';
import { Utente, TipoUtente } from '../models/utente.model';
import { AutenticazioneService } from './autenticazione.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UtentiService {
  //private apiBasePathUrl = 'http://localhost:3000/api';
  private apiBasePathUrl = environment.apiBasePathUrl ;
  constructor(
    private http: HttpClient,
    private autenticazioneService: AutenticazioneService
  ) { }

  getAllUtenti(): Observable<ApiResponse<Utente[]>> {
    return this.http.get<ApiResponse<Utente[]>>(
      `${this.apiBasePathUrl}/utenti`,
      { headers: this.autenticazioneService.getAuthHeaders() }
    );
  }

  getUtentiByType(tipo: string): Observable<ApiResponse<Utente[]>> {
    return this.http.get<ApiResponse<Utente[]>>(
      `${this.apiBasePathUrl}/utenti/${tipo}`,
      { headers: this.autenticazioneService.getAuthHeaders() }
    );
  }

  getUtenteById(utenteID: string): Observable<ApiResponse<Utente>> {
    return this.http.get<ApiResponse<Utente>>(
      `${this.apiBasePathUrl}/utenti/id/${utenteID}`,
      { headers: this.autenticazioneService.getAuthHeaders() }
    );
  }

  registerUser(tipo: string, userData: Partial<Utente>): Observable<ApiResponse<Utente>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<ApiResponse<Utente>>(
      `${this.apiBasePathUrl}/utenti/register/${tipo}`,
      userData,
      { headers: this.autenticazioneService.getAuthHeaders() }
    );
  }

  deleteUtente(utenteID: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.apiBasePathUrl}/utenti/${utenteID}`,
      { headers: this.autenticazioneService.getAuthHeaders() }
    );
  }

  updateUtente(utenteID: string, userData: Partial<Utente>): Observable<ApiResponse<Utente>> {
    const headers = this.autenticazioneService.getAuthHeaders().set('Content-Type', 'application/json');
    return this.http.put<ApiResponse<Utente>>(
      `${this.apiBasePathUrl}/utenti/${utenteID}`,
      userData,
      { headers }
    );
  }

}
