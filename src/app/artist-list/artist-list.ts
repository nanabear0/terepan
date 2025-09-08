import { ChangeDetectorRef, Component, inject, input } from '@angular/core';

import { Artist } from '../music-brainz/artist';
import { RouterLink } from '@angular/router';
import { TableModule, TablePageEvent } from 'primeng/table';
import { UserStore } from '../user-store/user-store';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-artist-list',
  imports: [RouterLink, TableModule, ButtonModule, CommonModule],
  templateUrl: './artist-list.html',
  styleUrl: './artist-list.scss',
})
export class ArtistList {
  value = input<Artist[]>([]);
  userStore = inject(UserStore);
  userStoreReady = this.userStore.ready;
  cd = inject(ChangeDetectorRef);

  displayedColumns = ['name', 'sortName', 'gender', 'area', 'begin', 'beginArea', 'end', 'endArea'];

  public async addArtist(artist: Artist) {
    if (this.userStore.contains(artist.id)) {
      await this.userStore.remove(artist.id);
    } else {
      await this.userStore.add(artist);
    }
    this.cd.detectChanges();
  }

  public rowSelectionIcon(artist: Artist) {
    if (!this.userStore.contains(artist.id)) {
      return 'pi-plus';
    }

    return 'pi-minus';
  }
  public rowClass(artist: Artist) {
    if (this.userStore.contains(artist.id)) {
      return 'selectedArtist';
    }
    return null;
  }

  first = 0;
  rows = 10;
  pageChange(event: TablePageEvent) {
    this.first = event.first;
    this.rows = event.rows;
  }
}
