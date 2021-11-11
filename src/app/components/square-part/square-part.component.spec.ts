import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SquarePartComponent } from './square-part.component';

describe('SquarePartComponent', () => {
  let component: SquarePartComponent;
  let fixture: ComponentFixture<SquarePartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SquarePartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SquarePartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
