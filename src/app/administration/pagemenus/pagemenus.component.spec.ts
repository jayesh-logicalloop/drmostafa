import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PagemenusComponent } from './pagemenus.component';

describe('PagemenusComponent', () => {
  let component: PagemenusComponent;
  let fixture: ComponentFixture<PagemenusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PagemenusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PagemenusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
