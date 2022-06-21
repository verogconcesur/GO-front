import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import DepartmentDTO from '@data/models/department-dto';
import { DepartmentService } from '@data/services/deparment.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss']
})
export class DepartmentsComponent implements OnInit {
  public departments$: Observable<DepartmentDTO[]>;

  public labels = {
    title: marker('organizations.departments.title'),
    createActionLabel: marker('organizations.departments.create')
  };

  private brandId: number;
  private facilityId: number;

  constructor(private router: Router, private route: ActivatedRoute, private departmentsService: DepartmentService) {}

  ngOnInit(): void {
    this.brandId = parseInt(this.route.snapshot.paramMap.get('idBrand'), 10);
    this.facilityId = parseInt(this.route.snapshot.paramMap.get('idFacility'), 10);
    this.departments$ = this.departmentsService.getDepartmentsByFacilitiesIds([this.facilityId]);
  }

  public goTo(department: DepartmentDTO) {
    this.router.navigate(
      [
        `${RouteConstants.ADMINISTRATION}/${RouteConstants.ORGANIZATION}/` +
          `${RouteConstants.BRANDS}/${this.brandId}/` +
          `${RouteConstants.FACILITIES}/${this.facilityId}/` +
          `${RouteConstants.DEPARTMENTS}/${department.id}/` +
          `${RouteConstants.SPECIALTIES}`
      ],
      { state: { department } }
    );
  }

  public buttonCreateAction() {}
}
