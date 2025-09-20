import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { last, lastValueFrom, Observable, of, switchMap, tap, timer } from 'rxjs';
import { ArtistWithAlbums, artistWithAlbumsSchema } from '../music-brainz/artist';
import { MusicBrainz } from '../music-brainz/music-brainz';
import { FollowedArtistsStore } from './followed-artists-store';

@Injectable({ providedIn: 'root' })
export class ArtistMetadataStore {
  private localStorageKey = 'artistMetadataStore';
  private localStorageLastMetadataUpdateKey = 'lastMetadataUpdate';
  public lastMetadataUpdate = signal<Date | undefined>(undefined);
  private cache = signal<Record<string, ArtistWithAlbums>>({});
  public ready = signal(false);
  public readonlyCache = computed<Readonly<Record<string, Readonly<ArtistWithAlbums>>>>(() =>
    this.cache()
  );
  public artistsWithAlbums = computed(() => [...Object.values(this.cache())]);

  constructor() {
    this.loadCache().then(() => this.ready.set(true));
    effect(() => {
      if (!this.ready()) return;

      localStorage.setItem(this.localStorageKey, this.stringifyArtistMap());
      const lastMetadataUpdate = this.lastMetadataUpdate();
      if (lastMetadataUpdate)
        localStorage.setItem(
          this.localStorageLastMetadataUpdateKey,
          lastMetadataUpdate.toISOString()
        );
    });
    effect(() => {
      if (!this.ready()) return;

      const lastUpdate = this.lastMetadataUpdate();

      if (!lastUpdate || new Date().getTime() - lastUpdate.getTime() > 1000 * 60 * 60 * 24) {
        this.updateMetadataCache();
      }
    });
  }

  updateMetadataCache() {
    const artistsList: string[] = [
      ...new Set([...this.followedArtistsStore.artists(), ...Object.keys(this.cache())]),
    ];
    this.queueArtistUpdate(artistsList, true);
    this.queueAlbumUpdate(artistsList, true);
    this.lastMetadataUpdate.set(new Date());
  }

  public async importArtists(newValues: Record<string, ArtistWithAlbums>) {
    this.cache.update((oldCache) => ({ ...oldCache, ...newValues }));
  }

  public stringifyArtistMap(beautiful = false): string {
    const objectToStringify = this.cache();
    if (beautiful) {
      return JSON.stringify(objectToStringify, null, 2);
    } else {
      return JSON.stringify(objectToStringify);
    }
  }

  public async parseArtistMap(str: string): Promise<Record<string, ArtistWithAlbums> | null> {
    const constructedObject: Record<string, ArtistWithAlbums> = {};
    try {
      const parsedJSON = JSON.parse(str ?? '');
      for (const [key, value] of Object.entries(parsedJSON)) {
        constructedObject[key] = await artistWithAlbumsSchema.cast(value);
      }
      return constructedObject;
    } catch (e: unknown) {
      console.error(e);
      return null;
    }
  }

  parseDate(str?: string): Date | undefined {
    if (!str) return;
    const date = new Date(str);
    if (date.toString() === 'Invalid Date') return;
    return date;
  }

  private async loadCache() {
    const newCache = await this.parseArtistMap(localStorage.getItem(this.localStorageKey) ?? '');
    const lastMetadataUpdate = this.parseDate(
      localStorage.getItem(this.localStorageLastMetadataUpdateKey) ?? ''
    );
    this.cache.set(newCache ?? {});
    this.lastMetadataUpdate.set(lastMetadataUpdate ?? undefined);
  }

  async add(artist: ArtistWithAlbums) {
    this.cache.update((oldCache) => ({ ...oldCache, [artist.id]: artist }));
  }

  musicBrainz = inject(MusicBrainz);

  updateInProgress = computed(() => {
    return !!this.artistUpdateQueue().size || !!this.albumUpdateQueue().size;
  });
  artistUpdateQueue = signal<Set<string>>(new Set());
  albumUpdateQueue = signal<Set<string>>(new Set());

  followedArtistsStore = inject(FollowedArtistsStore);
  queueArtistUpdates = effect(() => {
    this.queueArtistUpdate(this.followedArtistsStore.artists());
  });

  queueArtistUpdate(artists: string[], forceAll: boolean = false) {
    const cache = this.cache();
    const needsUpdate = artists.filter((artist) => forceAll || !cache[artist]);
    if (needsUpdate) {
      this.artistUpdateQueue.update((oldQueue) => new Set([...needsUpdate, ...oldQueue]));
    }
  }

  queueAlbumUpdate(artists: string[], forceAll: boolean = false) {
    const cache = this.cache();
    const needsUpdate = artists.filter((artist) => forceAll || !cache[artist]?.albums?.length);
    if (needsUpdate) {
      this.albumUpdateQueue.update((oldQueue) => new Set([...needsUpdate, ...oldQueue]));
    }
  }

  updateArtistCache = effect(async () => {
    if (!this.ready()) return;
    const updateQueue = this.artistUpdateQueue();
    if (!updateQueue.size) return;
    const results = await lastValueFrom(this.musicBrainz.getArtists([...updateQueue]));

    this.cache.update((oc) => {
      const nc = { ...oc };
      for (const result of results) {
        nc[result.id] = { ...nc[result.id], ...result };
      }
      return nc;
    });
    this.queueAlbumUpdate([...updateQueue]);
    this.artistUpdateQueue.update((oq) => {
      const nq = new Set(oq);
      for (const v of updateQueue) {
        nq.delete(v);
      }
      return new Set(nq);
    });
  });

  updateAlbumCache = effect(async () => {
    if (!this.ready()) return;
    const updateQueue = this.albumUpdateQueue();
    if (!updateQueue.size) return;
    const results = await lastValueFrom(
      this.musicBrainz.getAlbumsOfArtists(
        [...updateQueue].map((id) => this.cache()[id]).filter((x) => x)
      )
    );

    this.cache.update((oc) => {
      const nc = { ...oc };
      for (const result of results) {
        const artistId = result.artist?.id;
        if (artistId && nc[artistId]) {
          nc[artistId] = { ...nc[artistId], albums: [...(nc[artistId].albums ?? []), result] };
        }
      }
      Object.values<ArtistWithAlbums>(nc).forEach((artist) => {
        artist.albums = artist.albums && MusicBrainz.cleanUpAlbums(artist.albums);
      });
      return nc;
    });
    this.albumUpdateQueue.update((oq) => {
      const nq = new Set(oq);
      for (const v of updateQueue) {
        nq.delete(v);
      }
      return new Set(nq);
    });
  });

  get(id: string): ArtistWithAlbums | undefined {
    return this.cache()[id];
  }

  clear() {
    localStorage.removeItem(this.localStorageKey);
  }
}
