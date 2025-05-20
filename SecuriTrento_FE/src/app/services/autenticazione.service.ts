import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Utente } from '../models/utente.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AutenticazioneService {
  private currentUserSubject: BehaviorSubject<Utente | null> = new BehaviorSubject<Utente | null>(null);
  public currentUser$: Observable<Utente | null> = this.currentUserSubject.asObservable();


  constructor(private router: Router) {
    this.loadUserFromStorage();
  }

  public setCurrentUser(user: Utente): void {
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
}
