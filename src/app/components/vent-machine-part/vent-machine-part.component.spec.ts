import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentMachinePartComponent } from './vent-machine-part.component';

describe('VentMachinePartComponent', () => {
  let component: VentMachinePartComponent;
  let fixture: ComponentFixture<VentMachinePartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VentMachinePartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VentMachinePartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
