import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { IDBPDatabase, openDB } from 'idb';
import { map } from 'rxjs';
import { Album } from '../music-brainz/album';

interface KeyValuePair {
  key: string;
  value: string;
}

@Injectable({ providedIn: 'root' })
export class ThumbnailStore {
  private db!: IDBPDatabase;
  private readonly DB_NAME = 'thumbnailStore';
  private readonly STORE_NAME = 'thumbnails';
  private cache = signal(new Map<string, KeyValuePair>());
  public ready = signal(false);

  constructor() {
    this.initDB().then(() => {
      this.loadCache().then(() => this.ready.set(true));
    });
  }

  private async initDB() {
    this.db = await openDB(this.DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('thumbnails')) {
          db.createObjectStore('thumbnails');
        }
      },
    });
  }

  private async loadCache() {
    const all = await this.db.getAll(this.STORE_NAME);
    console.log(all);
    const newCache = new Map<string, KeyValuePair>();
    all.forEach((value: KeyValuePair) => newCache.set(value.key, value));
    this.cache.set(newCache);
  }

  async add(id: string, thumbnail: string) {
    await this.db.put(this.STORE_NAME, { key: id, value: thumbnail }, id);
    this.cache.update((oldCache) => {
      oldCache.set(id, { key: id, value: thumbnail });
      return new Map(oldCache);
    });
  }

  async remove(id: string) {
    await this.db.delete(this.STORE_NAME, id);
    this.cache.update((oldCache) => {
      oldCache.delete(id);
      return new Map(oldCache);
    });
  }

  get(id: string): string | undefined {
    return this.cache().get(id)?.value;
  }

  contains(id: string): boolean {
    return this.cache().has(id);
  }

  async clearAll() {
    await this.db.clear(this.STORE_NAME);
    this.cache.set(new Map());
  }

  http = inject(HttpClient);
  updateStoreForRelease(albums: Album[]) {
    albums.forEach(({ id }) => {
      if (this.contains(id)) return;

      this.http
        .get('https://coverartarchive.org/release-group/' + id)
        .pipe(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          map((r: any) => r.images[0].thumbnails.small)
        )
        .subscribe((url: string) => {
          this.add(id, url);
        });
    });
  }
}
