import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Segnalazione } from '../models/segnalazione.model';
import { ApiResponse } from '../models/api-response.model';
import { Observable } from 'rxjs';
import { Utente, TipoUtente } from '../models/utente.model';

@Injectable({
  providedIn: 'root'
})
export class UtentiService {
  private apiBasePathUrl = 'http://localhost:3000';
  constructor(private http: HttpClient) { }

  getAllUtenti(): Observable<ApiResponse<Utente[]>> {
    return this.http.get<ApiResponse<Utente[]>>(`${this.apiBasePathUrl}/utenti`);
  }

  getUtentiByType(tipo: string): Observable<ApiResponse<Utente[]>> {
    return this.http.get<ApiResponse<Utente[]>>(`${this.apiBasePathUrl}/utenti/${tipo}`);
  }

  getUtenteById(utenteID: string): Observable<ApiResponse<Utente>> {
    return this.http.get<ApiResponse<Utente>>(`${this.apiBasePathUrl}/utenti/id/${utenteID}`);
  }

  registerUser(tipo: string, userData: Partial<Utente>): Observable<ApiResponse<Utente>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<ApiResponse<Utente>>(
      `${this.apiBasePathUrl}/utenti/register/${tipo}`,
      userData,
      { headers }
    );
  }

  deleteUtente(utenteID: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiBasePathUrl}/utenti/${utenteID}`);
  }

  updateUtente(utenteID: string, userData: Partial<Utente>): Observable<ApiResponse<Utente>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.put<ApiResponse<Utente>>(
      `${this.apiBasePathUrl}/utenti/${utenteID}`,
      userData,
      { headers }
    );
  }

}
