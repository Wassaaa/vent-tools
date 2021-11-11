import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AxialPartComponent } from './axial-part.component';

describe('AxialPartComponent', () => {
  let component: AxialPartComponent;
  let fixture: ComponentFixture<AxialPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AxialPartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AxialPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
