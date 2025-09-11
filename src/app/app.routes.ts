import { Routes } from '@angular/router';
import { Artist } from './artist/artist';
import { Export } from './export/export';
import { FollowedArtists } from './followed-artists/followed-artists';
import { Home } from './home/home';
import { Import } from './import/import';
import { LatestReleases } from './latest-releases/latest-releases';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'artist/:id', component: Artist },
  { path: 'followed-artists', component: FollowedArtists },
  { path: 'latest-releases', component: LatestReleases },
  { path: 'import', component: Import },
  { path: 'export', component: Export },
  { path: '**', redirectTo: '/' },
];
