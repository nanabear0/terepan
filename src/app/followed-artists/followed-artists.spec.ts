import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowedArtists } from './followed-artists';

describe('FollowedArtists', () => {
  let component: FollowedArtists;
  let fixture: ComponentFixture<FollowedArtists>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowedArtists]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FollowedArtists);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
