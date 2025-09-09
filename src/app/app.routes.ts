import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Artist } from './artist/artist';
import { FollowedArtists } from './followed-artists/followed-artists';
import { LatestReleases } from './latest-releases/latest-releases';
import { Import } from './import/import';
import { Export } from './export/export';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'artist/:id', component: Artist },
  { path: 'followed-artists', component: FollowedArtists },
  { path: 'latest-releases', component: LatestReleases },
  { path: 'import', component: Import },
  { path: 'export', component: Export },
  { path: '**', redirectTo: '/' },
];
