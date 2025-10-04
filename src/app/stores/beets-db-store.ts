import { computed, effect, inject, Injectable, signal } from '@angular/core';
import * as yup from 'yup';
import { BeetsDbReader } from '../beets-db-reader/beets-db-reader.ts';

@Injectable({ providedIn: 'root' })
export class BeetsDbStore {
  private localStorageKey = 'beetsDb';
  private cache = signal<Set<string>>(new Set());
  public ready = signal(false);
  public cacheAvailable = computed(() => this.cache()?.size > 0);

  constructor() {
    this.loadCache().then(() => this.ready.set(true));
    effect(() => {
      localStorage.setItem(this.localStorageKey, this.stringifyStore());
    });
  }

  public stringifyStore(beautiful = false): string {
    const objectToStringify = Array.from(this.cache());
    if (beautiful) {
      return JSON.stringify(objectToStringify, null, 2);
    } else {
      return JSON.stringify(objectToStringify);
    }
  }

  public async parseStore(str: string): Promise<Set<string> | null> {
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
      console.error('Invalid beets db store', e);
      return null;
    }
  }

  private async loadCache() {
    const newCache = await this.parseStore(localStorage.getItem(this.localStorageKey) ?? '');
    this.cache.set(newCache ?? new Set());
  }

  dbReader = inject(BeetsDbReader);
  async importDb(file: File) {
    const result = await this.dbReader.readAlbumsFromDbFile(file);

    this.cache.set(result);
  }

  contains(id: string): boolean {
    return this.cache().has(id);
  }
}
