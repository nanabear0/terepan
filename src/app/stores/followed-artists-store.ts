import { computed, effect, Injectable, signal } from '@angular/core';
import { Artist, artistSchema } from '../music-brainz/artist';
import * as yup from 'yup';

@Injectable({ providedIn: 'root' })
export class FollowedArtistsStore {
  private localStorageKey = 'followedArtists';
  private cache = signal<Set<string>>(new Set());
  public ready = signal(false);
  public artists = computed(() => Array.from(this.cache()));

  constructor() {
    this.loadCache().then(() => this.ready.set(true));
    effect(() => {
      localStorage.setItem(this.localStorageKey, this.stringifyArtistMap());
    });
  }

  public async importArtists(newList: string[]) {
    this.cache.update((oldCache) => new Set([...oldCache, ...newList]));
  }

  public stringifyArtistMap(beautiful = false): string {
    const objectToStringify = Array.from(this.cache());
    if (beautiful) {
      return JSON.stringify(objectToStringify, null, 2);
    } else {
      return JSON.stringify(objectToStringify);
    }
  }

  public async parseArtistMap(str: string): Promise<Set<string> | null> {
    try {
      const parsedJSON = JSON.parse(str ?? '');
      let list: string[];
      if (parsedJSON && !Array.isArray(parsedJSON)) {
        list = Object.keys(parsedJSON);
      } else {
        list = await yup.array().of(yup.string().required()).required().cast(parsedJSON);
      }
      return new Set(list);
    } catch (e: unknown) {
      console.error('Invalid followed artists cache', e);
      return null;
    }
  }

  private async loadCache() {
    const newCache = await this.parseArtistMap(localStorage.getItem(this.localStorageKey) ?? '');
    this.cache.set(newCache ?? new Set());
  }

  async add(artist: string) {
    this.cache.update((oldCache) => {
      oldCache.add(artist);
      return new Set(oldCache);
    });
  }

  async addAll(artists: string[]) {
    this.cache.update((oldCache) => {
      artists.forEach((artist) => oldCache.add(artist));
      return new Set(oldCache);
    });
  }

  async remove(id: string) {
    this.cache.update((oldCache) => {
      oldCache.delete(id);
      return new Set(oldCache);
    });
  }

  contains(id: string): boolean {
    return this.cache().has(id);
  }
}
