import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { AuthenticationService } from '../authentication.service';

@Injectable({
  providedIn: 'root'
})
export class ModularizationGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthenticationService) {}
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredModule = route.data.requiredModule;
    const configList = this.authService.getConfigList();
    if (!configList.includes(requiredModule)) {
      this.router.navigate([RouteConstants.DASHBOARD]);
      return false;
    }

    return true;
  }
}
