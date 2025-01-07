import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';

@Injectable({
  providedIn: 'root'
})
export class ModularizationGuard implements CanActivate {
  public modularizationPermisions: { [key: string]: boolean } = {
    listView: false,
    advancedSearch: false,
    calendarView: false
  };
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const property = route.data.property;
    if (this.modularizationPermisions[property] !== true) {
      this.router.navigate([RouteConstants.DASHBOARD]);
      return false;
    }

    return true;
  }
}
