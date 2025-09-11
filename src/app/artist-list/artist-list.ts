import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { TableModule, TablePageEvent } from 'primeng/table';
import { Artist } from '../music-brainz/artist';
import { FollowedArtistsStore } from '../stores/followed-artists-store';
import { Artist as ArtistComponent } from '../artist/artist';

@Component({
  selector: 'app-artist-list',
  imports: [RouterLink, TableModule, ButtonModule, CommonModule, DrawerModule, ArtistComponent],
  templateUrl: './artist-list.html',
  styleUrl: './artist-list.scss',
})
export class ArtistList {
  value = input<Artist[]>([]);
  noHightlight = input<boolean>(false);
  noAction = input<boolean>(false);
  userStore = inject(FollowedArtistsStore);
  userStoreReady = this.userStore.ready;
  cd = inject(ChangeDetectorRef);

  selectedArtist = signal<Artist | undefined>(undefined);
  showDialog(id: Artist) {
    this.selectedArtist.set(id);
  }
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
