import { HttpClient } from '@angular/common/http';
import { Component, computed, effect, HostBinding, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { TableModule, TablePageEvent } from 'primeng/table';
import { Album } from '../music-brainz/album';
import { ThumbnailStore } from '../stores/thumbnail-store';
import { CommonModule } from '@angular/common';
import { ChipModule } from 'primeng/chip';
import { ReleaseTypeFilter } from '../release-type-filter/release-type-filter';
import { ReleaseTypesStore } from '../stores/release-types-store';

@Component({
  selector: 'app-album-list',
  imports: [
    TableModule,
    RouterLink,
    ImageModule,
    ButtonModule,
    CommonModule,
    ChipModule,
    ReleaseTypeFilter,
  ],
  templateUrl: './album-list.html',
  styleUrl: './album-list.scss',
})
export class AlbumList {
  value = input<Album[]>([]);
  showArtist = input<boolean>(false);
  http = inject(HttpClient);
  thumbnailStore = inject(ThumbnailStore);
  releaseTypesStore = inject(ReleaseTypesStore);
  filteredAlbums = computed(() => {
    const { activeTypes } = this.releaseTypesStore.releaseTypes();
    return this.value().filter(
      (album) =>
        activeTypes.has(album.primaryType ?? '') &&
        (!album.secondaryTypes ||
          album.secondaryTypes?.every((secondaryType) => activeTypes.has(secondaryType ?? '')))
    );
  });

  thumbnailUpdateEffect = effect(() => {
    this.thumbnailStore.queueAlbumsForThumbnailUpdate(this.value());
  });

  first = 0;
  rows = 10;
  pageChange(event: TablePageEvent) {
    this.first = event.first;
    this.rows = event.rows;
  }
}
