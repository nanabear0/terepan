import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { ArtistList } from '../artist-list/artist-list';
import { FollowedArtistsStore } from '../stores/followed-artists-store';
import { Artist, ArtistWithAlbums } from '../music-brainz/artist';
import { combineLatest, forkJoin, zip, zipAll } from 'rxjs';
import { ArtistMetadataStore } from '../stores/artist-metadata-store';

@Component({
  selector: 'app-followed-artists',
  imports: [
    FormsModule,
    ArtistList,
    ReactiveFormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    ButtonModule,
    FieldsetModule,
  ],
  templateUrl: './followed-artists.html',
  styleUrl: './followed-artists.scss',
})
export class FollowedArtists {
  artistMetadataStore = inject(ArtistMetadataStore);
  followedArtistsStore = inject(FollowedArtistsStore);
  followedArtists = computed(() => {
    return (
      this.followedArtistsStore
        .artists()
        .flatMap((artist) => this.artistMetadataStore.readonlyCache()?.[artist])
        ?.filter((x): x is Artist => !!x) ?? []
    );
  });
}
