import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomCommentsComponent } from './custom-comments.component';

describe('CustomCommentsComponent', () => {
  let component: CustomCommentsComponent;
  let fixture: ComponentFixture<CustomCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomCommentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
