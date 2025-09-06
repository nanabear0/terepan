import { Component, input } from '@angular/core';
import { Album } from '../music-brainz/album';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-album-list',
  imports: [MatTableModule],
  templateUrl: './album-list.html',
  styleUrl: './album-list.scss',
})
export class AlbumList {
  value = input<Album[]>([]);
  displayedColumns = ['firstReleaseDate', 'title'];
}
