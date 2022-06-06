import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebSettingComponent } from './web-setting.component';

describe('WebSettingComponent', () => {
  let component: WebSettingComponent;
  let fixture: ComponentFixture<WebSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
