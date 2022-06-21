import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import SpecialtyDTO from '@data/models/specialty-dto';
import { SpecialtyService } from '@data/services/specialty.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-specialties',
  templateUrl: './specialties.component.html',
  styleUrls: ['./specialties.component.scss']
})
export class SpecialtiesComponent implements OnInit {
  public specialties$: Observable<SpecialtyDTO[]>;

  public labels = {
    title: marker('organizations.specialties.title'),
    createActionLabel: marker('organizations.specialties.create')
  };

  private departmentId: number;

  constructor(private router: Router, private route: ActivatedRoute, private specialtiesService: SpecialtyService) {}

  ngOnInit(): void {
    this.departmentId = parseInt(this.route.snapshot.paramMap.get('idDepartment'), 10);
    this.specialties$ = this.specialtiesService.getSpecialtiesByDepartmentIds([this.departmentId]);
  }

  public buttonCreateAction() {}
}
