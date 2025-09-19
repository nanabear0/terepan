/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
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
      firstReleaseDate: new Date(raw['first-release-date']),
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
      delayWhen((attempt) => timer(50 * Math.pow(2, attempt - 1))),
      takeWhile(() => true) // retry forever
    )
  );

  private fetchAllPages<T>(
    urlBase: string,
    mapFn: (raw: unknown) => T[],
    limit = 100,
    countKey = 'count',
    offsetKey = 'offset'
  ): Observable<T[]> {
    const loadPage = (offset: number, acc: T[] = []): Observable<T[]> =>
      this.httpClient.get<any>(`${urlBase}&limit=${limit}&offset=${offset}`).pipe(
        delay(50),
        this.infiniteRetry,
        mergeMap((res: any) => {
          const newAcc = [...acc, ...mapFn(res)];
          const fixedOffset = res[offsetKey] ?? offset;
          return (res[countKey] ?? 0) <= fixedOffset + limit
            ? of(newAcc)
            : loadPage(fixedOffset + limit, newAcc);
        })
      );
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
