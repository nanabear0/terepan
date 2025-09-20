import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlbumCover } from './album-cover';

describe('AlbumCover', () => {
  let component: AlbumCover;
  let fixture: ComponentFixture<AlbumCover>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlbumCover]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlbumCover);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
