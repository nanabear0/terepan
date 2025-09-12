import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Album, albumSchema } from '../music-brainz/album';
import { MusicBrainz } from '../music-brainz/music-brainz';
import { FollowedArtistsStore } from './followed-artists-store';
import { ThumbnailStore } from './thumbnail-store';
import { map } from 'rxjs';

function within6Months(album: Album) {
  const now = new Date();
  const date = album.firstReleaseDate;
  const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  return diff <= 6 * 30;
}

@Injectable({ providedIn: 'root' })
export class LatestReleasesStore {
  private localStorageKey = 'latestReleases';
  public releases = signal<Album[]>([]);
  public ready = signal(false);

  musicBrainz = inject(MusicBrainz);
  followedArtistsStore = inject(FollowedArtistsStore);
  thumbnailStore = inject(ThumbnailStore);
  updatesInProgress = signal(0);

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
            console.log(e);
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

  filterLatest(albums: Album[]) {
    return albums.filter(within6Months);
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
