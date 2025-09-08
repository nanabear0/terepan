import { HttpClient } from '@angular/common/http';
import { Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImageModule } from 'primeng/image';
import { TableModule } from 'primeng/table';
import { map } from 'rxjs';
import { Album } from '../music-brainz/album';

@Component({
  selector: 'app-album-list',
  imports: [TableModule, RouterLink, ImageModule],
  templateUrl: './album-list.html',
  styleUrl: './album-list.scss',
})
export class AlbumList {
  value = input<Album[]>([]);
  showArtist = input<boolean>(false);
  cache = signal<Map<string, string>>(new Map<string, string>());
  http = inject(HttpClient);

  constructor() {
    effect(() => {
      this.value().forEach(({ id }) => {
        this.http
          .get('https://coverartarchive.org/release-group/' + id)
          .pipe(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            map((r: any) => {
              return r.images[0].thumbnails.small;
            })
          )
          .subscribe((url: string) => {
            this.cache.update((oldCache: Map<string, string>) => {
              oldCache.set(id, url);
              return new Map(oldCache);
            });
          });
      });
    });
  }
  hasImageYet(id: string) {
    return this.cache().has(id);
  }

  getSrc(id: string) {
    return this.cache().get(id);
  }
}
