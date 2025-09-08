import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { AlbumList } from '../album-list/album-list';
import { Album } from '../music-brainz/album';
import { MusicBrainz } from '../music-brainz/music-brainz';
import { UserStore } from '../user-store/user-store';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-latest-releases',
  imports: [
    FormsModule,
    AlbumList,
    ReactiveFormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    ButtonModule,
    FieldsetModule,
    ProgressSpinner,
  ],
  templateUrl: './latest-releases.html',
  styleUrl: './latest-releases.scss',
})
export class LatestReleases {
  userStore = inject(UserStore);
  musicBrainz = inject(MusicBrainz);
  userStoreReady = this.userStore.ready;
  artists = this.userStore.artists;
  albums = signal<Album[]>([]);

  constructor() {
    effect(() => {
      if (this.artists().length && !this.albums().length) {
        this.musicBrainz
          .getAlbumsOfArtists([...this.artists()])
          .subscribe((albums) => this.albums.set(albums));
      }
    });
  }
}
