import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import BrandDTO from '@data/models/organization/brand-dto';
import DepartmentDTO from '@data/models/organization/department-dto';
import FacilityDTO from '@data/models/organization/facility-dto';
import SpecialtyDTO from '@data/models/organization/specialty-dto';

@Component({
  selector: 'app-organization-card',
  templateUrl: './organization-card.component.html',
  styleUrls: ['./organization-card.component.scss']
})
export class OrganizationCardComponent implements OnInit {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() bgImgB64 = '';
  @Input() item: BrandDTO | DepartmentDTO | FacilityDTO | SpecialtyDTO;
  @Input() importView = false;
  @Output() edit: EventEmitter<BrandDTO | DepartmentDTO | FacilityDTO | SpecialtyDTO> = new EventEmitter();
  @Output() delete: EventEmitter<BrandDTO | DepartmentDTO | FacilityDTO | SpecialtyDTO> = new EventEmitter();
  @Output() duplicate: EventEmitter<BrandDTO | DepartmentDTO | FacilityDTO | SpecialtyDTO> = new EventEmitter();
  @Output() showUsers: EventEmitter<BrandDTO | DepartmentDTO | FacilityDTO | SpecialtyDTO> = new EventEmitter();
  @Output() import: EventEmitter<BrandDTO | DepartmentDTO | FacilityDTO | SpecialtyDTO> = new EventEmitter();

  public labels = {
    duplicate: marker('common.duplicate'),
    edit: marker('common.edit'),
    users: marker('common.users'),
    delete: marker('common.delete'),
    import: marker('common.import')
  };

  constructor() {}

  ngOnInit(): void {}
}
