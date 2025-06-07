import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Utente } from '../models/utente.model';
import { Router } from '@angular/router';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})

export class AutenticazioneService {
  private currentUserSubject: BehaviorSubject<Utente | null> = new BehaviorSubject<Utente | null>(null);
  public currentUser$: Observable<Utente | null> = this.currentUserSubject.asObservable();

  private apiBasePathUrl = 'http://localhost:3000/api';

  constructor(private router: Router, private http: HttpClient) {
    this.loadUserFromStorage();
  }

  public getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  public setCurrentUser(user: Utente): void { //serve per avere l'utente a disposizione in tutta l'app
    this.currentUserSubject.next(user);

    const userToSave = { ...user };
    delete userToSave.password;
    localStorage.setItem('currentUser', JSON.stringify(userToSave));
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  //fa la richiesta post all'API per il login
  public loginUser(credentials: { telefono: string; password: string }): Observable<{ message: string, token: string, utente: Utente }> {
    return this.http.post<{ message: string, token: string, utente: Utente }>(
      `${this.apiBasePathUrl}/login`,
      credentials
    );
  }

}
