import * as yup from 'yup';
import { Album, albumSchema } from './album';

export interface Artist {
  id: string;
  score?: number;
  name: string;
  area?: string;
  begin?: Date;
  end?: Date;
}

export interface ArtistWithAlbums {
  id: string;
  score?: number;
  name: string;
  area?: string;
  begin?: Date;
  end?: Date;
  albums?: Album[];
}

export const artistSchema = yup.object({
  id: yup.string().required(),
  score: yup.number().optional(),
  name: yup.string().required(),
  area: yup.string().optional(),
  begin: yup.date().optional(),
  end: yup.date().optional(),
});

export const artistWithAlbumsSchema = yup.object({
  id: yup.string().required(),
  score: yup.number().optional(),
  name: yup.string().required(),
  area: yup.string().optional(),
  begin: yup.date().optional(),
  end: yup.date().optional(),
  albums: yup.array().of(albumSchema).optional(),
});
