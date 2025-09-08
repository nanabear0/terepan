import { computed, Injectable, signal } from '@angular/core';
import { IDBPDatabase, openDB } from 'idb';
import { Artist } from '../music-brainz/artist';

@Injectable({ providedIn: 'root' })
export class UserStore {
  private db!: IDBPDatabase;
  private readonly DB_NAME = 'userStore';
  private readonly STORE_NAME = 'users';
  private cache = signal(new Map<string, Artist>());
  public ready = signal(false);
  public artists = computed(() => Array.from(this.cache().entries()).map(([, data]) => data));

  constructor() {
    this.initDB().then(() => {
      this.loadCache().then(() => this.ready.set(true));
    });
  }

  private async initDB() {
    this.db = await openDB(this.DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users');
        }
      },
    });
  }

  private async loadCache() {
    const all = await this.db.getAll(this.STORE_NAME);
    const newCache = new Map<string, Artist>();
    all.forEach((artist: Artist) => newCache.set(artist.id, artist));
    this.cache.set(newCache);
  }

  async add(artist: Artist) {
    await this.db.put(this.STORE_NAME, artist, artist.id);
    this.cache.update((oldCache) => {
      oldCache.set(artist.id, artist);
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

  get(id: string): Artist | undefined {
    return this.cache().get(id);
  }

  contains(id: string): boolean {
    return this.cache().has(id);
  }

  async clearAll() {
    await this.db.clear(this.STORE_NAME);
    this.cache.set(new Map());
  }
}
