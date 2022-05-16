import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { AuthenticationService } from '../authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  constructor(private authenticationService: AuthenticationService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    //Roles are passed in route data
    const permissions = route.data.permissions as Array<string>;
    const userLogged = this.authenticationService.isUserLogged();
    if (userLogged && permissions && Array.isArray(permissions) && permissions.length) {
      return this.authenticationService.hasUserAnyPermission(permissions);
    } else if (userLogged && permissions && (!Array.isArray(permissions) || permissions.length)) {
      if (!userLogged) {
        this.router.navigate([RouteConstants.LOGIN]);
      } else {
        this.router.navigate([RouteConstants.DASHBOARD]);
      }
      return false;
    }
    return userLogged;
  }
}
