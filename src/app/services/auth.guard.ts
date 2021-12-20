import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot
} from "@angular/router";
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard  implements CanActivate {
  

  constructor(private authenticationService: AuthenticationService, private router: Router) { }
 
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean | Promise<boolean> {
    var isAuthenticated = this.authenticationService.getAuthStatus();
    if (!isAuthenticated) {
        this.router.navigate(['/']);
    }
    return isAuthenticated;
  }

}
