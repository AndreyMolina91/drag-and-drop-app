import { TestBed } from '@angular/core/testing';

import { CharactersService } from './characters.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CharactersService', () => {
  let service: CharactersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(CharactersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
