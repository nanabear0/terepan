import { Component, input } from '@angular/core';

import { Artist } from '../music-brainz/artist';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
@Component({
  selector: 'app-artist-list',
  imports: [RouterLink, TableModule],
  templateUrl: './artist-list.html',
  styleUrl: './artist-list.scss',
})
export class ArtistList {
  value = input<Artist[]>([]);
  displayedColumns = ['name', 'sortName', 'gender', 'area', 'begin', 'beginArea', 'end', 'endArea'];
}
