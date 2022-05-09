import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(
      private authenticationService: AuthenticationService,
      private router: Router
      ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    //Roles are passed in route data
    const permissions = route.data.permissions as Array<string>;
    let isLoggedAndHasPermission = this.authenticationService.isUserLogged();
    if(isLoggedAndHasPermission && permissions && Array.isArray(permissions) && permissions.length){
        isLoggedAndHasPermission = this.authenticationService.hasUserAnyPermission(permissions);
    }else if(isLoggedAndHasPermission && permissions && typeof permissions === 'string'){
        isLoggedAndHasPermission = this.authenticationService.hasUserAnyPermission([permissions]);
    }else if(!isLoggedAndHasPermission){
      //DGDC TODO: definir ruta a la que redirigir si no se tiene permisos
      this.router.navigate([RouteConstants.LOGIN]);
    }
    return isLoggedAndHasPermission;
  }

}
