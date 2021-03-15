import { TestBed } from '@angular/core/testing';

import { TonService } from './ton.service';

describe('TonService', () => {
  let service: TonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
