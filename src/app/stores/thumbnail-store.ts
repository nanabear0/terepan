import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { map } from 'rxjs';
import * as yup from 'yup';
import { Album } from '../music-brainz/album';

@Injectable({ providedIn: 'root' })
export class ThumbnailStore {
  private localStorageKey = 'thumbnails';
  private cache = signal(new Map<string, string>());
  public ready = signal(false);

  constructor() {
    this.loadCache().then(() => this.ready.set(true));
    effect(() => {
      localStorage.setItem(
        this.localStorageKey,
        JSON.stringify(
          Array.from(this.cache().entries()).reduce((pv, [k, v]) => ({ ...pv, [k]: v }), {})
        )
      );
    });
  }

  public async parseThumbnailMap(str: string): Promise<Map<string, string> | null> {
    const map = new Map<string, string>();
    try {
      const parsedJSON = JSON.parse(str ?? '');
      for (const releaseGroupId in parsedJSON) {
        if (Object.prototype.hasOwnProperty.call(parsedJSON, releaseGroupId)) {
          const url = await yup.string().cast(parsedJSON[releaseGroupId]);
          if (url) map.set(releaseGroupId, url);
        }
      }
      return map;
    } catch (e: unknown) {
      console.error(e);
      return null;
    }
  }

  private async loadCache() {
    const newCache = await this.parseThumbnailMap(localStorage.getItem(this.localStorageKey) ?? '');
    this.cache.set(newCache ?? new Map());
  }

  async add(id: string, thumbnail: string) {
    this.cache.update((oldCache) => {
      oldCache.set(id, thumbnail);
      return new Map(oldCache);
    });
  }

  async remove(id: string) {
    this.cache.update((oldCache) => {
      oldCache.delete(id);
      return new Map(oldCache);
    });
  }

  get(id: string): string | undefined {
    return this.cache().get(id);
  }

  contains(id: string): boolean {
    return this.cache().has(id);
  }

  async clearAll() {
    this.cache.set(new Map());
  }

  http = inject(HttpClient);
  updateQueue = signal<Set<string>>(new Set());
  queueAlbumsForThumbnailUpdate(albums: Album[]) {
    this.updateQueue.update(
      (oldQueue) => new Set([...oldQueue, ...albums.map((album) => album.id)])
    );
  }

  updateThumbnailStore = effect(async () => {
    if (!this.ready()) return;
    const updateQueue = this.updateQueue();
    const first = updateQueue.values().next().value;
    if (!first) return;

    updateQueue.delete(first);
    const url = await this.http
      .get('https://coverartarchive.org/release-group/' + first)
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map((r: any) => r.images[0].thumbnails.small)
      )
      .toPromise();
    this.add(first, url);
    this.updateQueue.set(new Set([...updateQueue]));
  });
}
