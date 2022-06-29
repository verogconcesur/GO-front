import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditFacilityComponent } from './create-edit-facility.component';

describe('CreateEditFacilityComponent', () => {
  let component: CreateEditFacilityComponent;
  let fixture: ComponentFixture<CreateEditFacilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateEditFacilityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEditFacilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
