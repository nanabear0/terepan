import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { lastValueFrom, map } from 'rxjs';
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
  albumUpdateQueue = signal<Set<string>>(new Set());
  releaseUpdateQueue = signal<Set<string>>(new Set());
  updatesInProgress = computed(() => {
    return this.albumUpdateQueue().size || this.releaseUpdateQueue().size;
  });
  queueAlbumsForThumbnailUpdate(...albumIds: string[]) {
    const needsUpdate = albumIds.filter((albumId) => !this.contains(albumId));
    if (needsUpdate) {
      this.albumUpdateQueue.update((oldQueue) => new Set([...needsUpdate, ...oldQueue]));
    }
  }

  queueReleasesForThumbnailUpdate(...releaseIds: string[]) {
    const needsUpdate = releaseIds.filter((releaseId) => !this.contains(releaseId));
    if (needsUpdate) {
      this.releaseUpdateQueue.update((oldQueue) => new Set([...needsUpdate, ...oldQueue]));
    }
  }

  getThumbnails(type: 'release' | 'release-group', first: string) {
    return lastValueFrom(
      this.http.get(`https://coverartarchive.org/${type}/` + first).pipe(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map((r: any) => r.images[0].thumbnails.small),
        map((url) => ({
          first,
          url,
        }))
      )
    );
  }

  updateThumbnailStore = effect(async () => {
    if (!this.ready()) return;
    const albumUpdateQueue = this.albumUpdateQueue();
    const releaseUpdateQueue = this.releaseUpdateQueue();
    if (!albumUpdateQueue.size && !releaseUpdateQueue.size) return;
    const releaseToUpdate = [...releaseUpdateQueue].slice(0, 10);
    const albumToUpdate = [...albumUpdateQueue].slice(0, 10 - releaseToUpdate.length);
    releaseToUpdate.forEach((first) => releaseUpdateQueue.delete(first));
    albumToUpdate.forEach((first) => albumUpdateQueue.delete(first));
    console.log('updating', releaseToUpdate, albumToUpdate);

    const results = await Promise.allSettled([
      ...releaseToUpdate.map(this.getThumbnails.bind(this, 'release')),
      ...albumToUpdate.map(this.getThumbnails.bind(this, 'release-group')),
    ]);

    for (const result of results) {
      if (result.status == 'fulfilled') {
        console.log('found', result.value.first);
        this.add(result.value.first, result.value.url);
      }
    }
    this.albumUpdateQueue.set(new Set([...albumUpdateQueue]));
    this.releaseUpdateQueue.set(new Set([...releaseUpdateQueue]));
  });
}
