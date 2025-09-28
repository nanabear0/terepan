/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import {
  delay,
  delayWhen,
  map,
  mergeMap,
  mergeScan,
  Observable,
  of,
  retryWhen,
  takeWhile,
  tap,
  timer,
} from 'rxjs';
import { Album } from './album';
import { Artist, ArtistWithAlbums } from './artist';
import { ReleaseTypesStore } from '../stores/release-types-store';
import { DisplayTrack, Medium as Medium, Release, Track } from './release';

@Injectable({
  providedIn: 'root',
})
export class MusicBrainz {
  private static API_ROOT = 'https://musicbrainz.org/ws/2/';

  httpClient = inject(HttpClient);
  releaseTypesStore = inject(ReleaseTypesStore);

  private static toDateOrUndefined(input: string): Date | undefined {
    return input ? new Date(input) : undefined;
  }
  private static mapArtist(rawArtist: any): Artist {
    return {
      id: rawArtist.id,
      score: rawArtist.score,
      name: rawArtist.name,
      area: rawArtist.area?.name,
      begin: MusicBrainz.toDateOrUndefined(rawArtist['life-span']?.begin),
      end: MusicBrainz.toDateOrUndefined(rawArtist['life-span']?.end),
    };
  }

  private static mapArtists(raw: any): Artist[] {
    return raw.artists?.map(MusicBrainz.mapArtist);
  }

  private static mapAlbum(raw: any, artist?: Artist): Album {
    return {
      id: raw.id,
      artist: artist
        ? artist
        : {
            id: raw['artist-credit']?.[0]?.artist.id,
            name: raw['artist-credit']?.[0]?.artist.name,
          },
      title: raw.title,
      firstReleaseDate: this.toDateOrUndefined(raw['first-release-date']),
      primaryType: raw['primary-type'],
      secondaryTypes: raw['secondary-types'],
    };
  }

  private static mapAlbums(raw: any, artist?: Artist): Album[] {
    return raw['release-groups']
      ?.map((album: unknown) => MusicBrainz.mapAlbum(album, artist))
      .filter((album: Album) => !!album.primaryType)
      .sort(
        (a1: Album, a2: Album) =>
          (a1.firstReleaseDate?.getTime() ?? 0) - (a2.firstReleaseDate?.getTime() ?? 0)
      );
  }

  private static mapTrack(raw: any): Track {
    return {
      id: raw.id,
      position: raw.position,
      length: raw.length,
      title: raw.title,
    };
  }

  private static mapMedium(raw: any): Medium {
    return {
      id: raw.id,
      title: raw.title,
      format: raw.format,
      position: raw.position,
      trackCount: raw['track-count'],
      tracks: raw['tracks']
        ?.map(MusicBrainz.mapTrack)
        .sort((a: Track, b: Track) => a.position - b.position),
    };
  }
  private static mapRelease(raw: any): Release {
    const media: Medium[] = raw['media']
      ?.map(MusicBrainz.mapMedium)
      .sort((a: Medium, b: Medium) => a.position - b.position);
    const displayTracks = media.flatMap((m) =>
      m.tracks.map(
        (t): DisplayTrack => ({
          ...t,
          medium: m,
        })
      )
    );
    return {
      id: raw.id,
      status: raw.status,
      country: raw.country,
      date: this.toDateOrUndefined(raw['date']),
      media: raw['media']?.map(MusicBrainz.mapMedium),
      format: [...new Set([...(media?.map((x: Medium) => x?.format) ?? [])])].join(', '),
      tracks: media?.map((x: Medium) => x.trackCount).join('+'),
      displayTracks,
    };
  }

  private static mapReleases(raw: any): Release[] {
    return raw['releases']?.map((album: unknown) => MusicBrainz.mapRelease(album));
  }

  public searchArtistByName(artistName: string, score?: number): Observable<Artist[]> {
    return this.httpClient
      .get<any>(`${MusicBrainz.API_ROOT}artist?query=name:${artistName}&limit=100`)
      .pipe(
        this.infiniteRetry,
        map(MusicBrainz.mapArtists),
        map((artists: Artist[]) =>
          artists.filter((artist: Artist) => !artist.score || !score || artist.score > score)
        )
      );
  }

  public getArtist(artistId: string): Observable<Artist> {
    return this.httpClient
      .get<any>(`${MusicBrainz.API_ROOT}artist/${artistId}`)
      .pipe(this.infiniteRetry, map(MusicBrainz.mapArtist));
  }

  public static cleanUpAlbums(albums: Album[]) {
    const cleanAlbums: Album[] = [];
    const set = new Set<string>();
    for (const album of albums) {
      if (set.has(album.id)) continue;
      set.add(album.id);
      cleanAlbums.push(album);
    }
    return cleanAlbums;
  }

  public getArtistWithAlbums(artistId: string): Observable<ArtistWithAlbums> {
    return this.getArtist(artistId).pipe(
      mergeMap((artist: Artist) => {
        return this.getAlbumsOfArtist(artist).pipe(
          tap((albums: Album[]) => {
            albums.forEach((album) =>
              this.releaseTypesStore.addReleaseTypes(album.primaryType, album.secondaryTypes)
            );
          }),
          map((value: Album[]) => ({
            ...artist,
            albums: value,
          }))
        );
      }),
      map((a) => {
        a.albums = MusicBrainz.cleanUpAlbums(a.albums);
        return a;
      })
    );
  }

  private infiniteRetry = retryWhen((err$) =>
    err$.pipe(
      mergeScan((attempt) => of(attempt + 1), 0),
      delayWhen((attempt) => timer(1000 * (attempt - 1))),
      takeWhile(() => true) // retry forever
    )
  );

  progress = signal<Record<string, [number, number]>>({});
  totalProgress = computed<[number, number] | undefined>(() => {
    const values = Object.values(this.progress());
    if (!values?.length) return undefined;

    return Object.values(this.progress()).reduce(
      (pv, cv) => [pv[0] + cv[0], pv[1] + cv[1]],
      [0, 0]
    );
  });
  private fetchAllPages<T>(
    urlBase: string,
    mapFn: (raw: unknown) => T[],
    limit = 100,
    countKey = 'count',
    offsetKey = 'offset'
  ): Observable<T[]> {
    const runId = crypto.randomUUID();
    const loadPage = (offset: number, acc: T[] = []): Observable<T[]> =>
      this.httpClient.get<any>(`${urlBase}&limit=${limit}&offset=${offset}`).pipe(
        delay(1000),
        this.infiniteRetry,
        mergeMap((res: any) => {
          const newAcc = [...acc, ...mapFn(res)];
          const fixedOffset = res[offsetKey] ?? offset;

          if ((res[countKey] ?? 0) <= fixedOffset + limit) {
            this.progress.update((ov) => {
              delete ov[runId];
              return { ...ov };
            });
            return of(newAcc);
          } else {
            this.progress.update((ov) => ({
              ...ov,
              [runId]: [fixedOffset + limit, res[countKey] ?? 0],
            }));
            return loadPage(fixedOffset + limit, newAcc);
          }
        })
      );
    this.progress.update((ov) => ({ ...ov, [runId]: [0, 0] }));
    return loadPage(0);
  }

  public getAlbumsOfArtist(artist: Artist): Observable<Album[]> {
    return this.fetchAllPages<Album>(
      `${MusicBrainz.API_ROOT}release-group?artist=${artist.id}`,
      (album) => MusicBrainz.mapAlbums(album, artist),
      100,
      'release-group-count',
      'release-group-offset'
    ).pipe(
      tap((albums) => {
        albums.forEach((album) =>
          this.releaseTypesStore.addReleaseTypes(album.primaryType, album.secondaryTypes)
        );
      })
    );
  }

  public getReleasesOfAlbum(album: Album): Observable<Release[]> {
    return this.fetchAllPages<Release>(
      `${MusicBrainz.API_ROOT}release?release-group=${album.id}&inc=recordings`,
      (album) => MusicBrainz.mapReleases(album),
      100,
      'release-count',
      'release-offset'
    );
  }

  public getArtists(ids: string[]): Observable<Artist[]> {
    return this.fetchAllPages<Artist>(
      `${MusicBrainz.API_ROOT}artist?query=arid:(${ids.join(' OR ')})`,
      (artist) => MusicBrainz.mapArtists(artist),
      100
    );
  }

  public getAlbumsOfArtists(artists: Artist[]): Observable<Album[]> {
    const ids = artists.map(({ id }) => id);

    return this.fetchAllPages<Album>(
      `${MusicBrainz.API_ROOT}release-group?query=arid:(${ids.join(' OR ')})`,
      (album) => MusicBrainz.mapAlbums(album),
      100
    ).pipe(
      tap((albums) => {
        albums.forEach((album) =>
          this.releaseTypesStore.addReleaseTypes(album.primaryType, album.secondaryTypes)
        );
      })
    );
  }
}
