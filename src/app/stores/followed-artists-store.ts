import { computed, effect, Injectable, signal } from '@angular/core';
import { Artist, artistSchema } from '../music-brainz/artist';

@Injectable({ providedIn: 'root' })
export class FollowedArtistsStore {
  private localStorageKey = 'followedArtists';
  private cache = signal(new Map<string, Artist>());
  public ready = signal(false);
  public artists = computed(() => Array.from(this.cache().entries()).map(([, data]) => data));

  constructor() {
    this.loadCache().then(() => this.ready.set(true));
    effect(() => {
      localStorage.setItem(this.localStorageKey, this.stringifyArtistMap());
    });
  }

  public async importArtists(newMap: Map<string, Artist>) {
    this.cache.update((oldCache) => new Map([...oldCache, ...newMap]));
  }

  public stringifyArtistMap(beautiful = false): string {
    const objectToStringify = Array.from(this.cache().entries()).reduce(
      (pv, [k, v]) => ({ ...pv, [k]: v }),
      {}
    );
    if (beautiful) {
      return JSON.stringify(objectToStringify, null, 2);
    } else {
      return JSON.stringify(objectToStringify);
    }
  }

  public async parseArtistMap(str: string): Promise<Map<string, Artist> | null> {
    const map = new Map<string, Artist>();
    try {
      const parsedJSON = JSON.parse(str ?? '');
      for (const artistId in parsedJSON) {
        if (Object.prototype.hasOwnProperty.call(parsedJSON, artistId)) {
          const artist = await artistSchema.cast(parsedJSON[artistId]);
          map.set(artistId, artist);
        }
      }
      return map;
    } catch (e: unknown) {
      console.error(e);
      return null;
    }
  }

  private async loadCache() {
    const newCache = await this.parseArtistMap(localStorage.getItem(this.localStorageKey) ?? '');
    this.cache.set(newCache ?? new Map());
  }

  async add(artist: Artist) {
    this.cache.update((oldCache) => {
      oldCache.set(artist.id, artist);
      return new Map(oldCache);
    });
  }

  async addAll(artists: Artist[]) {
    this.cache.update((oldCache) => {
      artists.forEach((artist) => oldCache.set(artist.id, artist));
      return new Map(oldCache);
    });
  }

  async remove(id: string) {
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
    this.cache.set(new Map());
  }
}
