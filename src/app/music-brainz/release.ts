import * as yup from 'yup';

export interface Release {
  id: string;
  status: string;
  country?: string;
  date?: Date;
  format?: string;
  tracks?: string;
  media?: Medium[];
  displayTracks?: DisplayTrack[];
}

export interface DisplayTrack extends Track {
  medium: Omit<Medium, 'tracks'>;
}

export interface Medium {
  id: string;
  title: string;
  format: string;
  position: number;
  trackCount: number;
  tracks: Track[];
}

export interface Track {
  id: string;
  position: number;
  length: number;
  title: string;
}
