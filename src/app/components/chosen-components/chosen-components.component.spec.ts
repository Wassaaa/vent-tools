import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChosenComponentsComponent } from './chosen-components.component';

describe('ChosenComponentsComponent', () => {
  let component: ChosenComponentsComponent;
  let fixture: ComponentFixture<ChosenComponentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChosenComponentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChosenComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
