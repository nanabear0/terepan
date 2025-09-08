import { Artist } from './artist';

export interface Album {
  id: string;
  firstReleaseDate: Date;
  artist?: Pick<Artist, 'id' | 'name'>;
  title: string;
  primaryType: string;
  secondaryTypes: string[];
}
