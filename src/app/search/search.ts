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
import { InputNumber } from 'primeng/inputnumber';
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
    InputNumber,
  ],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {
  musicBrainzService = inject(MusicBrainz);
  artistForm = new FormGroup({ name: new FormControl(''), score: new FormControl(70) });

  result = signal<Artist[]>([]);

  public async search() {
    this.musicBrainzService
      .searchArtist(this.artistForm.value.name ?? '', this.artistForm.value.score ?? undefined)
      .subscribe((result: Artist[]) => {
        this.result.set(result);
        const virtualScroller = document.querySelector('.p-virtualscroller');
        if (virtualScroller) virtualScroller.scrollTop = 0;
      });
  }
}
