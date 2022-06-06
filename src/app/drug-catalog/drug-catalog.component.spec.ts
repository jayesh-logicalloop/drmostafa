import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrugCatalogComponent } from './drug-catalog.component';

describe('DrugCatalogComponent', () => {
  let component: DrugCatalogComponent;
  let fixture: ComponentFixture<DrugCatalogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DrugCatalogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrugCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
