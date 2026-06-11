import { TestBed } from '@angular/core/testing';

import { Issuevoucher } from './issuevoucher';

describe('Issuevoucher', () => {
  let service: Issuevoucher;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Issuevoucher);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
