import { TestBed } from '@angular/core/testing';

import { MusicBrainz } from './music-brainz';

describe('MusicBrainz', () => {
  let service: MusicBrainz;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MusicBrainz);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
