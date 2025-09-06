import { Component, input } from '@angular/core';

import { MatTableModule } from '@angular/material/table';
import { Artist } from '../music-brainz/artist';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-artist-list',
  imports: [MatTableModule, RouterLink],
  templateUrl: './artist-list.html',
  styleUrl: './artist-list.scss',
})
export class ArtistList {
  value = input<Artist[]>([]);
  displayedColumns = ['name', 'sortName', 'gender', 'area', 'begin', 'beginArea', 'end', 'endArea'];
}
