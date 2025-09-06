import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Album } from '../music-brainz/album';
import { Artist as Art } from '../music-brainz/artist';
import { MusicBrainz } from '../music-brainz/music-brainz';
import { AlbumList } from '../album-list/album-list';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-artist',
  imports: [AlbumList, MatIconModule, RouterLink],
  templateUrl: './artist.html',
  styleUrl: './artist.scss',
})
export class Artist {
  readonly artistId: string;
  private route = inject(ActivatedRoute);
  musicBrainzService = inject(MusicBrainz);

  artist = signal<Art>(null!);
  albums = signal<Album[]>([]);
  constructor() {
    this.artistId = this.route.snapshot.paramMap.get('id')!;
    this.musicBrainzService.getArtist(this.artistId).forEach((value: Art) => {
      this.artist.set(value);
    });
    this.musicBrainzService.getAlbumsOfArtist(this.artistId).forEach((value: Album[]) => {
      this.albums.set(value);
    });
  }
}
