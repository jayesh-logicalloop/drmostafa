import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentPriceComponent } from './appointment-price.component';

describe('AppointmentPriceComponent', () => {
  let component: AppointmentPriceComponent;
  let fixture: ComponentFixture<AppointmentPriceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppointmentPriceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
