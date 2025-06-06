import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiResponse } from '../models/api-response.model';
import { Observable } from 'rxjs';
import { RichiestaAllocazione } from '../models/richieste-allocazione.model';

@Injectable({
  providedIn: 'root'
})
export class RichiesteAllocazioneService {
  private apiBasePathUrl = 'http://localhost:3000/api';
  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // GET - Ottieni tutte le richieste di allocazione
  getRichiesteAllocazione(): Observable<ApiResponse<RichiestaAllocazione[]>> {
    return this.http.get<ApiResponse<RichiestaAllocazione[]>>(
      `${this.apiBasePathUrl}/richieste-allocazione`,
      { headers: this.getAuthHeaders() }
    );
  }

  // GET - Ottieni una richiesta di allocazione per ID
  getRichiestaAllocazioneById(id: string): Observable<ApiResponse<RichiestaAllocazione>> {
    return this.http.get<ApiResponse<RichiestaAllocazione>>(
      `${this.apiBasePathUrl}/richieste-allocazione/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // POST - Crea una nuova richiesta di allocazione
  createRichiestaAllocazione(richiesta: RichiestaAllocazione): Observable<ApiResponse<RichiestaAllocazione>> {
    const headers = this.getAuthHeaders().set('Content-Type', 'application/json');
    return this.http.post<ApiResponse<RichiestaAllocazione>>(
      `${this.apiBasePathUrl}/richieste-allocazione`,
      richiesta,
      { headers }
    );
  }

  // PUT - Aggiorna una richiesta di allocazione
  updateRichiestaAllocazione(id: string, richiesta: RichiestaAllocazione): Observable<ApiResponse<RichiestaAllocazione>> {
    return this.http.put<ApiResponse<RichiestaAllocazione>>(
      `${this.apiBasePathUrl}/richieste-allocazione/${id}`,
      richiesta,
      { headers: this.getAuthHeaders() }
    );
  }

  // DELETE - Elimina una richiesta di allocazione
  deleteRichiestaAllocazione(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.apiBasePathUrl}/richieste-allocazione/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }
}