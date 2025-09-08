/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { concatMap, delay, from, map, mergeMap, Observable, of, toArray } from 'rxjs';
import { Album } from './album';
import { Artist } from './artist';

@Injectable({
  providedIn: 'root',
})
export class MusicBrainz {
  private static API_ROOT = 'https://musicbrainz.org/ws/2/';

  httpClient = inject(HttpClient);

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

  private static mapAlbum(raw: any, artist: Artist): Album {
    return {
      id: raw.id,
      artist,
      title: raw.title,
      firstReleaseDate: new Date(raw['first-release-date']),
      primaryType: raw['primary-type'],
      secondaryTypes: raw['secondary-types'],
    };
  }

  private static mapAlbums(raw: any, artist: Artist): Album[] {
    return raw['release-groups']
      ?.map((album: unknown) => MusicBrainz.mapAlbum(album, artist))
      .filter((album: Album) => album.primaryType === 'Album' && !album.secondaryTypes?.length)
      .sort((a1: Album, a2: Album) => a1.firstReleaseDate < a2.firstReleaseDate);
  }

  public searchArtist(artistName: string, score?: number): Observable<Artist[]> {
    return this.httpClient
      .get<any>(`${MusicBrainz.API_ROOT}artist?query=name:${artistName}&limit=100`)
      .pipe(map(MusicBrainz.mapArtists))
      .pipe(
        map((artists: Artist[]) =>
          artists
            .filter((artist: Artist) => !artist.score || !score || artist.score > score)
            .sort((a, b) => a.name.localeCompare(b.name))
        )
      );
  }

  public getArtist(artistId: string): Observable<Artist> {
    return this.httpClient
      .get<any>(`${MusicBrainz.API_ROOT}artist/${artistId}`)
      .pipe(map(MusicBrainz.mapArtist));
  }

  private fetchAllPages<T>(
    urlBase: string,
    mapFn: (raw: unknown) => T[],
    limit = 100,
    countKey = 'count',
    offsetKey = 'offset'
  ): Observable<T[]> {
    const loadPage = (offset: number, acc: T[] = []): Observable<T[]> =>
      this.httpClient.get<any>(`${urlBase}&limit=${limit}&offset=${offset}`).pipe(
        mergeMap((res) => {
          const newAcc = [...acc, ...mapFn(res)];
          const fixedOffset = res[offsetKey] ?? offset;
          if ((res[countKey] ?? 0) <= fixedOffset + limit) return of(newAcc);

          return loadPage(fixedOffset + limit, newAcc);
        })
      );

    return loadPage(0);
  }

  public getAlbumsOfArtist(artist: Artist): Observable<Album[]> {
    return this.fetchAllPages<Album>(
      `${MusicBrainz.API_ROOT}release-group?artist=${artist.id}&type=album`,
      (album) => MusicBrainz.mapAlbums(album, artist),
      100,
      'release-group-count',
      'release-group-offset'
    );
  }

  getAllAlbumsOfArtists(artists: Artist[]): Observable<Album[]> {
    return from(artists).pipe(
      concatMap((artist) => this.getAlbumsOfArtist(artist).pipe(delay(250))),
      toArray(),
      map((arrays) => arrays.flat()),
      map((array) =>
        array.sort(
          (a1: Album, a2: Album) => a2.firstReleaseDate.getTime() - a1.firstReleaseDate.getTime()
        )
      )
    );
  }
}
