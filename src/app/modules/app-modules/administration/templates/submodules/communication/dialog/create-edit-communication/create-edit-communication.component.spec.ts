import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditCommunicationComponent } from './create-edit-communication.component';

describe('CreateEditCommunicationComponent', () => {
  let component: CreateEditCommunicationComponent;
  let fixture: ComponentFixture<CreateEditCommunicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateEditCommunicationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEditCommunicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
