import { effect, inject, Injectable, signal } from '@angular/core';
import { Album, albumSchema } from '../music-brainz/album';
import { MusicBrainz } from '../music-brainz/music-brainz';
import { FollowedArtistsStore } from './followed-artists-store';
import { ThumbnailStore } from './thumbnail-store';
import { ReleaseTypesStore } from './release-types-store';

@Injectable({ providedIn: 'root' })
export class LatestReleasesStore {
  private localStorageKey = 'latestReleases';
  public releases = signal<Album[]>([]);
  public ready = signal(false);

  musicBrainz = inject(MusicBrainz);
  followedArtistsStore = inject(FollowedArtistsStore);
  thumbnailStore = inject(ThumbnailStore);
  updatesInProgress = signal(0);
  releaseTypesStore = inject(ReleaseTypesStore);

  public async parseAlbums(str: string): Promise<Array<Album> | null> {
    const albums: Album[] = [];
    try {
      const parsedJSON = JSON.parse(str ?? '');
      if (Array.isArray(parsedJSON)) {
        for (const album of parsedJSON) {
          try {
            const typedAlbum = await albumSchema.cast(album);
            albums.push(typedAlbum);
          } catch (e) {
            console.log(e, album);
          }
        }
        return albums;
      }
      return null;
    } catch (e: unknown) {
      console.error(e);
      return null;
    }
  }

  public stringifyAlbums(beautiful = false): string {
    if (beautiful) {
      return JSON.stringify(this.releases(), null, 2);
    } else {
      return JSON.stringify(this.releases());
    }
  }

  private async loadCache() {
    const newCache = await this.parseAlbums(localStorage.getItem(this.localStorageKey) ?? '');
    newCache?.forEach((album) =>
      this.releaseTypesStore.addReleaseTypes(album.primaryType, album.secondaryTypes)
    );
    this.releases.set(this.cleanUpAlbums(newCache ?? []));
  }

  constructor() {
    this.loadCache().then(() => this.ready.set(true));

    effect(() => {
      if (this.ready()) {
        localStorage.setItem(this.localStorageKey, this.stringifyAlbums());
      }
    });
  }

  cleanUpAlbums(albums: Album[]) {
    const cleanAlbums: Album[] = [];
    const set = new Set<string>();
    for (const album of albums) {
      if (set.has(album.id)) continue;
      set.add(album.id);
      cleanAlbums.push(album);
    }
    return cleanAlbums;
  }

  updateEffect = effect(() => {
    if (this.ready()) {
      this.updatesInProgress.update((i) => i + 1);
      this.musicBrainz
        .getAlbumsOfArtists(this.followedArtistsStore.artists())
        .subscribe((albums) => {
          this.releases.set(this.cleanUpAlbums(albums));
          this.updatesInProgress.update((i) => i - 1);
        });
    }
  });
}
