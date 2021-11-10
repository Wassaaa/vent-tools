import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoosePartComponent } from './choose-part.component';

describe('ChoosePartComponent', () => {
  let component: ChoosePartComponent;
  let fixture: ComponentFixture<ChoosePartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChoosePartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChoosePartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
