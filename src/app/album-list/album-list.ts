import { Component, input } from '@angular/core';
import { Album } from '../music-brainz/album';
import { TableModule } from 'primeng/table';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-album-list',
  imports: [TableModule, RouterLink],
  templateUrl: './album-list.html',
  styleUrl: './album-list.scss',
})
export class AlbumList {
  value = input<Album[]>([]);
  showArtist = input<boolean>(false);
}
