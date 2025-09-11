import { Component, computed, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { ArtistList } from '../artist-list/artist-list';
import { FollowedArtistsStore } from '../stores/followed-artists-store';

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
  userStore = inject(FollowedArtistsStore);
  userStoreReady = this.userStore.ready;

  artists = this.userStore.artists;
  sortedArtists = computed(() =>
    this.userStore.artists().sort((a, b) => a.name.localeCompare(b.name))
  );
}
