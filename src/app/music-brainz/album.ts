import { Artist } from './artist';

export interface Album {
  id: string;
  firstReleaseDate: Date;
  artist: Artist;
  title: string;
  primaryType: string;
  secondaryTypes: string[];
}
