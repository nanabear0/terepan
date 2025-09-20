import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { ImageModule } from 'primeng/image';
import { TableModule } from 'primeng/table';
import { Album } from '../music-brainz/album';
import { ReleaseTypeFilter } from '../release-type-filter/release-type-filter';
import { ReleaseTypesStore } from '../stores/release-types-store';
import { AlbumCover } from './album-cover/album-cover';

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
    AlbumCover,
    TagModule,
  ],
  templateUrl: './album-list.html',
  styleUrl: './album-list.scss',
})
export class AlbumList {
  value = input<Album[]>([]);
  showArtist = input<boolean>(false);
  http = inject(HttpClient);
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
}
