import * as yup from 'yup';

export interface Artist {
  id: string;
  score?: number;
  name: string;
  area?: string;
  begin?: Date;
  end?: Date;
}

export const artistSchema = yup.object({
  id: yup.string().required(),
  score: yup.number().optional(),
  name: yup.string().required(),
  area: yup.string().optional(),
  begin: yup.date().optional(),
  end: yup.date().optional(),
});
