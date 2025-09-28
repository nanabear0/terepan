import * as yup from 'yup';

export interface Release {
  id: string;
  status: string;
  country?: string;
  date?: Date;
  format?: string;
  tracks?: string;
}

export const releaseSchema = yup.object({
  id: yup.string().required(),
});
