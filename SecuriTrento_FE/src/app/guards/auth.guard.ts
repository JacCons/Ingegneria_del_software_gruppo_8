import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router, 
  UrlTree 
} from '@angular/router';
import { Observable } from 'rxjs';
import { AutenticazioneService } from '../services/autenticazione.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AutenticazioneService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    return this.checkAuthenticationAndRole(route, state.url);
  }

  private checkAuthenticationAndRole(route: ActivatedRouteSnapshot, url: string): boolean | UrlTree {
    console.log(`🛡️ AuthGuard: Controllo accesso a ${url}`);
    
    if (this.authService.isTokenExpired()) {
      console.log('🔓 Token scaduto/mancante - Reindirizzo al login');
      
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      
      return this.router.createUrlTree(['/login'], { 
        queryParams: { 
          returnUrl: url,
          message: 'Devi effettuare il login per accedere a questa pagina'
        }
      });
    }

    const userRole = this.authService.getUserRole();
    
    if (!userRole) {
      return this.router.createUrlTree(['/login']);
    }

    const requiredRoles = route.data['roles'] as string[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      console.log('✅ Route pubblica per utenti autenticati - Accesso consentito');
      return true;
    }

    const hasRequiredRole = requiredRoles.includes(userRole);

    if (hasRequiredRole) {
      return true;
    }

    return this.router.createUrlTree(['/access-denied'], {
      queryParams: {
        message: `Accesso negato. La tua autorizzazione (${userRole}) non è sufficiente per accedere a questa pagina.`,
        requiredRoles: requiredRoles.join(', '),
        currentRole: userRole,
        returnUrl: url
      }
    });
  }
}