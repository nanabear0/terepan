import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Artist } from './artist/artist';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'artist/:id', component: Artist },
  { path: '**', redirectTo: '/' },
];
