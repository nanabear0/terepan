/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
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

  private static mapAlbum(raw: any): Album {
    return {
      id: raw.id,
      title: raw.title,
      firstReleaseDate: new Date(raw['first-release-date']),
      primaryType: raw['primary-type'],
      secondaryTypes: raw['secondary-types'],
    };
  }

  private static mapAlbums(raw: any): Album[] {
    return raw['release-groups']
      ?.map(MusicBrainz.mapAlbum)
      .filter((album: Album) => album.primaryType === 'Album' && !album.secondaryTypes?.length)
      .sort((a1: Album, a2: Album) => a1.firstReleaseDate < a2.firstReleaseDate);
  }

  public searchArtist(artistName: string, score?: number): Observable<Artist[]> {
    return this.httpClient
      .get<any>(`${MusicBrainz.API_ROOT}artist?query=name:${artistName}`)
      .pipe(map(MusicBrainz.mapArtists))
      .pipe(
        map((artists: Artist[]) =>
          artists.filter((artist: Artist) => !artist.score || !score || artist.score > score)
        )
      );
  }

  public getArtist(artistId: string): Observable<Artist> {
    return this.httpClient
      .get<any>(`${MusicBrainz.API_ROOT}artist/${artistId}`)
      .pipe(map(MusicBrainz.mapArtist));
  }

  public getAlbumsOfArtist(artistId: string): Observable<Album[]> {
    return this.httpClient
      .get<any>(`${MusicBrainz.API_ROOT}release-group?artist=${artistId}&type=album`)
      .pipe(map(MusicBrainz.mapAlbums));
  }
}
