import { Routes } from '@angular/router';
import { Artist } from './artist/artist';
import { Export } from './export/export';
import { FollowedArtists } from './followed-artists/followed-artists';
import { Search } from './search/search';
import { Import } from './import/import';
import { LatestReleases } from './latest-releases/latest-releases';
import { BulkAdd } from './bulk-add/bulk-add';
import { ReleaseGroup } from './release-group/release-group';
import { Archive } from './archive/archive';

export const routes: Routes = [
  { path: 'archive', component: Archive, title: 'Terepan - Archive' },
  { path: 'search', component: Search, title: 'Terepan - Search' },
  { path: 'followed-artists', component: FollowedArtists, title: 'Terepan - Followed Artists' },
  { path: 'latest-releases', component: LatestReleases, title: 'Terepan - Latest Releases' },
  { path: 'import', component: Import, title: 'Terepan - Import' },
  { path: 'export', component: Export, title: 'Terepan - Export' },
  { path: 'bulk-add', component: BulkAdd, title: 'Terepan - Bulk Add' },
  {
    path: 'artist/:artistId/album/:albumId',
    component: ReleaseGroup,
    title: 'Terepan - Uknown Artist',
  },
  { path: 'artist/:artistId', component: Artist, title: 'Terepan - Uknown Artist' },
  { path: '**', redirectTo: '/followed-artists' },
];
