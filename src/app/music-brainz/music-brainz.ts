/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Artist } from './artist';
import { map, Observable } from 'rxjs';
import { Album } from './album';

@Injectable({
  providedIn: 'root',
})
export class MusicBrainz {
  private static API_ROOT = 'https://musicbrainz.org/ws/2/';

  httpClient = inject(HttpClient);

  private mapArtist(rawArtist: any): Artist {
    return {
      id: rawArtist.id,
      name: rawArtist.name,
      sortName: rawArtist['sort-name'],
      gender: rawArtist.gender,
      area: rawArtist.area?.name,
      begin: rawArtist['life-span']?.begin,
      beginArea: rawArtist['begin-area']?.name,
      end: rawArtist['life-span']?.end,
      endArea: rawArtist['end-area']?.name,
    };
  }

  private mapArtists(raw: any): Artist[] {
    return raw.artists?.map(this.mapArtist);
  }

  private mapAlbum(raw: any): Album {
    return {
      id: raw.id,
      title: raw.title,
      firstReleaseDate: new Date(raw['first-release-date']),
      primaryType: raw['primary-type'],
      secondaryTypes: raw['secondary-types'],
    };
  }
  private mapAlbums(raw: any): Album[] {
    return raw['release-groups']
      ?.map(this.mapAlbum)
      .filter((album: Album) => album.primaryType === 'Album' && !album.secondaryTypes?.length);
  }

  public searchArtist(artistName: string): Observable<Artist[]> {
    return this.httpClient
      .get<any>(`${MusicBrainz.API_ROOT}artist?query=name:${artistName}`)
      .pipe(map(this.mapArtists.bind(this)));
  }

  public getArtist(artistId: string): Observable<Artist> {
    return this.httpClient
      .get<any>(`${MusicBrainz.API_ROOT}artist/${artistId}`)
      .pipe(map(this.mapArtist.bind(this)));
  }

  public getAlbumsOfArtist(artistId: string): Observable<Album[]> {
    return this.httpClient
      .get<any>(`${MusicBrainz.API_ROOT}release-group?artist=${artistId}&type=album`)
      .pipe(map(this.mapAlbums.bind(this)));
  }
}
