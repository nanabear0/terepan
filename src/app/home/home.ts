import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { FloatLabel } from 'primeng/floatlabel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { ArtistList } from '../artist-list/artist-list';
import { Artist } from '../music-brainz/artist';
import { MusicBrainz } from '../music-brainz/music-brainz';
@Component({
  selector: 'app-home',
  imports: [
    FormsModule,
    ArtistList,
    ReactiveFormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    FloatLabel,
    ButtonModule,
    FieldsetModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  musicBrainzService = inject(MusicBrainz);
  artistForm = new FormGroup({ name: new FormControl('') });

  result = signal<Artist[]>([]);

  public async search() {
    this.musicBrainzService
      .searchArtist(this.artistForm.value.name ?? '')
      .forEach((result: Artist[]) => {
        this.result.set(result);
      });
  }
}
