import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { TableModule } from 'primeng/table';
import { AlbumCover } from '../album-list/album-cover/album-cover';
import { Release } from '../music-brainz/release';

@Component({
  selector: 'app-release-list',
  imports: [RouterLink, TableModule, ButtonModule, CommonModule, DrawerModule, AlbumCover],
  templateUrl: './release-list.html',
  styleUrl: './release-list.scss',
})
export class ArtistList {
  value = input<Release[]>([]);
  localizer = new Intl.DisplayNames(['en'], { type: 'region' });
}
