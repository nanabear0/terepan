import { HttpClient } from '@angular/common/http';
import { Component, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { TableModule, TablePageEvent } from 'primeng/table';
import { Album } from '../music-brainz/album';
import { ThumbnailStore } from '../stores/thumbnail-store';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-album-list',
  imports: [TableModule, RouterLink, ImageModule, ButtonModule, CommonModule],
  templateUrl: './album-list.html',
  styleUrl: './album-list.scss',
})
export class AlbumList {
  value = input<Album[]>([]);
  showArtist = input<boolean>(false);
  http = inject(HttpClient);
  thumbnailStore = inject(ThumbnailStore);

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
