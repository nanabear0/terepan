import { Component, input } from '@angular/core';
import { Album } from '../music-brainz/album';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-album-list',
  imports: [TableModule],
  templateUrl: './album-list.html',
  styleUrl: './album-list.scss',
})
export class AlbumList {
  value = input<Album[]>([]);
  showArtist = input<boolean>(false);
}
