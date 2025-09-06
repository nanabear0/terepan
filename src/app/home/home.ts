import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MusicBrainz } from '../music-brainz/music-brainz';
import { ArtistList } from '../artist-list/artist-list';
import { Artist } from '../music-brainz/artist';
@Component({
  selector: 'app-home',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, ArtistList],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  musicBrainzService = inject(MusicBrainz);
  artistSearchValue = signal('');
  result = signal<Artist[]>([]);
  public async searchArtist() {
    this.musicBrainzService.searchArtist(this.artistSearchValue()).forEach((result: Artist[]) => {
      this.result.set(result);
    });
  }
}
