import { CommonModule } from '@angular/common';
import { Component, effect, inject, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { ImageModule } from 'primeng/image';
import { TableModule } from 'primeng/table';
import { Album } from '../../music-brainz/album';
import { ThumbnailStore } from '../../stores/thumbnail-store';

@Component({
  selector: 'app-album-cover',
  imports: [TableModule, ImageModule, ButtonModule, CommonModule, ChipModule],
  templateUrl: './album-cover.html',
  styleUrl: './album-cover.scss',
})
export class AlbumCover {
  id = input<string>();
  alt = input<string>();
  placeholderStyle = input<string>();
  type = input<'release' | 'release-group'>('release-group');
  thumbnailStore = inject(ThumbnailStore);

  thumbnailUpdateEffect = effect(() => {
    const albumId = this.id();
    if (albumId) {
      switch (this.type()) {
        case 'release':
          this.thumbnailStore.queueReleasesForThumbnailUpdate(albumId);
          break;
        case 'release-group':
          this.thumbnailStore.queueAlbumsForThumbnailUpdate(albumId);
          break;
      }
    }
  });
}
