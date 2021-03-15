import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmsComponent } from './subms.component';

describe('SubmsComponent', () => {
  let component: SubmsComponent;
  let fixture: ComponentFixture<SubmsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubmsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
