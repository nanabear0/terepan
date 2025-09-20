import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { TableModule } from 'primeng/table';
import { Artist as ArtistComponent } from '../artist/artist';
import { Artist } from '../music-brainz/artist';
import { FollowedArtistsStore } from '../stores/followed-artists-store';

@Component({
  selector: 'app-artist-list',
  imports: [RouterLink, TableModule, ButtonModule, CommonModule, DrawerModule, ArtistComponent],
  templateUrl: './artist-list.html',
  styleUrl: './artist-list.scss',
})
export class ArtistList {
  value = input<Artist[]>([]);
  noScore = input<boolean>(false);
  noHightlight = input<boolean>(false);
  noAction = input<boolean>(false);
  onlyName = input<boolean>(false);
  customActionIcon = input<string>();
  customAction = output<Artist>();
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
      await this.userStore.add(artist.id);
    }
    this.cd.detectChanges();
  }

  public rowSelectionIcon(artist: Artist) {
    if (!this.userStore.contains(artist.id)) {
      return 'pi-plus';
    }

    return 'pi-minus';
  }

  public rowSelectionSeverity(artist: Artist) {
    if (!this.userStore.contains(artist.id)) {
      return 'primary';
    }

    return 'secondary';
  }

  public rowClass(artist: Artist) {
    if (this.userStore.contains(artist.id)) {
      return 'selectedArtist';
    }
    return null;
  }
}
