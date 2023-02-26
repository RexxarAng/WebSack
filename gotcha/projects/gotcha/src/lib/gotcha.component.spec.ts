import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GotchaComponent } from './gotcha.component';

describe('GotchaComponent', () => {
  let component: GotchaComponent;
  let fixture: ComponentFixture<GotchaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GotchaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GotchaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
