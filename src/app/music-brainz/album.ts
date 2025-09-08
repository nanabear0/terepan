export interface Album {
  id: string;
  firstReleaseDate: Date;
  artist?: string;
  title: string;
  primaryType: string;
  secondaryTypes: string[];
}
