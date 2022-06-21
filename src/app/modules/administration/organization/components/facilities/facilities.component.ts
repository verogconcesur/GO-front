/* eslint-disable max-len */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import FacilityDTO from '@data/models/facility-dto';
import { FacilityService } from '@data/services/facility.sevice';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-facilities',
  templateUrl: './facilities.component.html',
  styleUrls: ['./facilities.component.scss']
})
export class FacilitiesComponent implements OnInit {
  public facilities$: Observable<FacilityDTO[]>;

  public labels = {
    title: marker('organizations.facilities.title'),
    createActionLabel: marker('organizations.facilities.create')
  };

  private brandId: number;

  constructor(private router: Router, private route: ActivatedRoute, private facilitiesService: FacilityService) {}

  ngOnInit(): void {
    this.brandId = parseInt(this.route.snapshot.paramMap.get('idBrand'), 10);
    this.facilities$ = this.facilitiesService.getFacilitiesByBrandsIds([this.brandId]);
  }

  public goTo(facility: FacilityDTO) {
    this.router.navigate(
      [
        `${RouteConstants.ADMINISTRATION}/${RouteConstants.ORGANIZATION}/` +
          `${RouteConstants.BRANDS}/${this.brandId}/` +
          `${RouteConstants.FACILITIES}/${facility.id}/` +
          `${RouteConstants.DEPARTMENTS}`
      ],
      { state: { facility } }
    );
  }

  public buttonCreateAction() {}
}
