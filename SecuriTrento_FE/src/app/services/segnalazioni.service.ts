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
}
