import { Component, computed, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { AlbumList } from '../album-list/album-list';
import { LatestReleasesStore } from '../stores/latest-releases-store';

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
  latestReleasesStore = inject(LatestReleasesStore);
  albums = computed(() => this.latestReleasesStore.releases());
}
