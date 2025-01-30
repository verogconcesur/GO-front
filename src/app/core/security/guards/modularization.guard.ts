import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { ModulesConstants } from '@app/constants/modules.constants';
import { RouteConstants } from '@app/constants/route.constants';
import { AuthenticationService } from '../authentication.service';

@Injectable({
  providedIn: 'root'
})
export class ModularizationGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthenticationService) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const configList = this.authService.getConfigList();
    if (!configList.includes(ModulesConstants.ADVANCED_SEARCH)) {
      this.router.navigate([RouteConstants.DASHBOARD]);
      return false;
    }

    return true;
  }
}
