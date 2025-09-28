import { Component, computed, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { AlbumList } from '../album-list/album-list';
import { Album } from '../music-brainz/album';
import { ArtistMetadataStore } from '../stores/artist-metadata-store';
import { FollowedArtistsStore } from '../stores/followed-artists-store';

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
  ],
  templateUrl: './latest-releases.html',
  styleUrl: './latest-releases.scss',
})
export class LatestReleases {
  artistMetadataStore = inject(ArtistMetadataStore);
  followedArtistsStore = inject(FollowedArtistsStore);
  latestReleases = computed(() => {
    return (
      this.followedArtistsStore
        .artists()
        .flatMap((artist) => this.artistMetadataStore.get(artist)?.albums)
        ?.filter((x): x is Album => !!x) ?? []
    );
  });
}
