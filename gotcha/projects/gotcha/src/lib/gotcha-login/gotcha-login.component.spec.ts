import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GotchaLoginComponent } from './gotcha-login.component';

describe('GotchaLoginComponent', () => {
  let component: GotchaLoginComponent;
  let fixture: ComponentFixture<GotchaLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GotchaLoginComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GotchaLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
