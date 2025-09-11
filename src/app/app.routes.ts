import { Routes } from '@angular/router';
import { Artist } from './artist/artist';
import { Export } from './export/export';
import { FollowedArtists } from './followed-artists/followed-artists';
import { Search } from './search/search';
import { Import } from './import/import';
import { LatestReleases } from './latest-releases/latest-releases';

export const routes: Routes = [
  { path: 'search', component: Search },
  { path: 'followed-artists', component: FollowedArtists },
  { path: 'latest-releases', component: LatestReleases },
  { path: 'import', component: Import },
  { path: 'export', component: Export },
  { path: 'artist/:id', component: Artist },
  { path: '**', redirectTo: '/followed-artists' },
];
