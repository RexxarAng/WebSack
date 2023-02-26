import { TestBed } from '@angular/core/testing';

import { GotchaService } from './gotcha.service';

describe('GotchaService', () => {
  let service: GotchaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GotchaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
