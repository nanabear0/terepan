import { Artist } from './artist';
import * as yup from 'yup';

export interface Album {
  id: string;
  firstReleaseDate: Date | null;
  artist?: Pick<Artist, 'id' | 'name'>;
  title: string;
  primaryType: string | null;
  secondaryTypes?: string[];
}

const partialArtistSchema = yup.object({
  id: yup.string().required(),
  name: yup.string().required(),
});

export const albumSchema = yup.object({
  id: yup.string().required(),
  firstReleaseDate: yup.date().required().nullable(),
  artist: partialArtistSchema.optional(),
  title: yup.string().required(),
  primaryType: yup.string().required().nullable(),
  secondaryTypes: yup.array().of(yup.string().required()).optional(),
});
