import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants, RoutingUseHash } from '@app/constants/route.constants';
import { AuthGuardService } from '@app/security/guards/authentication.guard';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import BrandDTO from '@data/models/organization/brand-dto';
import DepartmentDTO from '@data/models/organization/department-dto';
import FacilityDTO from '@data/models/organization/facility-dto';
import { BrandService } from '@data/services/brand.service';
import { DepartmentService } from '@data/services/deparment.service';
import { FacilityService } from '@data/services/facility.sevice';
import { BrandsComponent } from './components/brands/brands.component';
import { DepartmentsComponent } from './components/departments/departments.component';
import { FacilitiesComponent } from './components/facilities/facilities.component';
import { SpecialtiesComponent } from './components/specialties/specialties.component';
import { OrganizationComponent } from './organization.component';

const routes: Routes = [
  {
    path: RouteConstants.EMPTY,
    canActivate: [AuthGuardService],
    //Brand level
    children: [
      {
        path: RouteConstants.BRANDS,
        canActivate: [AuthGuardService],
        component: BrandsComponent
      },
      {
        path: RouteConstants.FACILITIES,
        canActivate: [AuthGuardService],
        component: OrganizationComponent,
        //Facility level
        children: [
          {
            path: RouteConstants.EMPTY,
            canActivate: [AuthGuardService],
            //Department level
            children: [
              {
                path: `${RouteConstants.ID_FACILITY}/${RouteConstants.DEPARTMENTS}`,
                canActivate: [AuthGuardService],
                data: {
                  breadcrumb: [
                    {
                      id: RouteConstants.FACILITIES,
                      label: 'organizations.facilities.title',
                      numberOfPathsToRemoveFromTheUrl: 2
                    },
                    {
                      id: RouteConstants.DEPARTMENTS,
                      label: (data: { facility: FacilityDTO }) => `${data.facility.name}`
                    }
                  ]
                },
                resolve: { facility: FacilityService },
                //Specialty level
                children: [
                  {
                    path: `${RouteConstants.ID_DEPARTMENT}/${RouteConstants.SPECIALTIES}`,
                    canActivate: [AuthGuardService],
                    data: {
                      breadcrumb: {
                        id: RouteConstants.SPECIALTIES,
                        label: (data: { department: DepartmentDTO }) => `${data.department.name}`
                      }
                    },
                    resolve: { department: DepartmentService },
                    component: SpecialtiesComponent
                  },
                  {
                    path: RouteConstants.EMPTY,
                    canActivate: [AuthGuardService],
                    component: DepartmentsComponent
                  }
                ]
              },
              {
                path: RouteConstants.EMPTY,
                canActivate: [AuthGuardService],
                component: FacilitiesComponent
              }
            ]
          }
        ]
      },
      {
        path: RouteConstants.OTHER,
        pathMatch: 'full',
        redirectTo: RouteConstants.BRANDS
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationRoutingModule {}
