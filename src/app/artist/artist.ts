import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlbumList } from '../album-list/album-list';
import { Album } from '../music-brainz/album';
import { Artist as Art } from '../music-brainz/artist';
import { MusicBrainz } from '../music-brainz/music-brainz';
import { ButtonModule } from 'primeng/button';
import { UserStore } from '../user-store/user-store';

@Component({
  selector: 'app-artist',
  imports: [AlbumList, ButtonModule],
  templateUrl: './artist.html',
  styleUrl: './artist.scss',
})
export class Artist {
  readonly artistId: string;
  private route = inject(ActivatedRoute);
  musicBrainzService = inject(MusicBrainz);

  artist = signal<Art | undefined>(undefined);
  albums = signal<Album[]>([]);

  constructor() {
    this.artistId = this.route.snapshot.paramMap.get('id')!;
    this.musicBrainzService.getArtist(this.artistId).forEach((value: Art) => {
      this.artist.set(value);
      this.musicBrainzService.getAlbumsOfArtist(value).forEach((value: Album[]) => {
        this.albums.set(value);
      });
    });
  }

  userStore = inject(UserStore);
  public async addArtist() {
    const artist = this.artist()!;
    if (this.userStore.contains(artist.id)) {
      await this.userStore.remove(artist.id);
    } else {
      await this.userStore.add(artist);
    }
  }

  public rowSelectionIcon() {
    const artist = this.artist()!;
    if (!this.userStore.contains(artist.id)) {
      return 'pi-plus';
    }

    return 'pi-minus';
  }
}
