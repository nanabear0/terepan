import { Component, effect, inject, input, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlbumList } from '../album-list/album-list';
import { Album } from '../music-brainz/album';
import { Artist as Art } from '../music-brainz/artist';
import { MusicBrainz } from '../music-brainz/music-brainz';
import { ButtonModule } from 'primeng/button';
import { FollowedArtistsStore } from '../stores/followed-artists-store';

@Component({
  selector: 'app-artist',
  imports: [AlbumList, ButtonModule],
  templateUrl: './artist.html',
  styleUrl: './artist.scss',
})
export class Artist {
  private route = inject(ActivatedRoute);
  value = input('');
  musicBrainzService = inject(MusicBrainz);

  artist = signal<Art | undefined>(undefined);
  albums = signal<Album[]>([]);

  constructor() {
    effect(() => {
      const artistId = this.route.snapshot.paramMap.get('id') ?? this.value();
      this.musicBrainzService.getArtist(artistId).subscribe((value: Art) => {
        this.artist.set(value);
        this.musicBrainzService.getAlbumsOfArtist(value).subscribe((value: Album[]) => {
          this.albums.set(value);
        });
      });
    });
  }

  userStore = inject(FollowedArtistsStore);
  public async addArtist() {
    const artist = this.artist()!;
    if (!artist) return;

    if (this.userStore.contains(artist.id)) {
      await this.userStore.remove(artist.id);
    } else {
      await this.userStore.add(artist);
    }
  }

  public rowSelectionIcon() {
    const artist = this.artist();
    if (!artist) return '';

    if (!this.userStore.contains(artist.id)) {
      return 'pi-plus';
    }

    return 'pi-minus';
  }
}
