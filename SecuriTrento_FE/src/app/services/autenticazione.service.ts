import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Utente } from '../models/utente.model';
import { Router } from '@angular/router';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AutenticazioneService {
  private currentUserSubject: BehaviorSubject<Utente | null> = new BehaviorSubject<Utente | null>(null);
  public currentUser$: Observable<Utente | null> = this.currentUserSubject.asObservable();

  private apiBasePathUrl = environment.apiBasePathUrl;

  constructor(private router: Router, private http: HttpClient) {
    this.loadUserFromStorage();
  }

  public isTokenExpired(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch {
      return true;
    }
  }

  private checkTokenAndLogout(): void {
    if (this.isTokenExpired()) {
      this.logout();
    }
  }

  public getAuthHeaders(): HttpHeaders {
    this.checkTokenAndLogout();
    
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  public getUserRole(): string | null {
    const currentUser = this.currentUserSubject.value;
    return currentUser?.tipoUtente || null;
  }

  public setCurrentUser(user: Utente): void {
    this.currentUserSubject.next(user);

    const userToSave = { ...user };
    delete userToSave.password;
    localStorage.setItem('currentUser', JSON.stringify(userToSave));
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedUser && !this.isTokenExpired()) { // ✅ Controlla token
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user', error);
        this.logout();
      }
    } else if (storedUser) {
      this.logout();
    }
  }

  public logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  public loginUser(credentials: { telefono: string; password: string }): Observable<{ message: string, token: string, utente: Utente }> {
    return this.http.post<{ message: string, token: string, utente: Utente }>(
      `${this.apiBasePathUrl}/login`,
      credentials
    );
  }
}
