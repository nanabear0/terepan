import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MusicBrainz } from '../music-brainz/music-brainz';
import { lastValueFrom } from 'rxjs';
import { Artist } from '../music-brainz/artist';
import { ArtistList } from '../artist-list/artist-list';
import { TabsModule } from 'primeng/tabs';

const midRegex = /(?:[a-f0-9]){8}-(?:[a-f0-9]){4}-(?:[a-f0-9]){4}-(?:[a-f0-9]){4}-(?:[a-f0-9]){12}/;
const screwThisGuyInParticular = 'a0dedd56-290c-4d11-9cbc-85890c1128fb';

@Component({
  selector: 'app-bulk-add',
  imports: [
    FormsModule,
    TextareaModule,
    ToastModule,
    FormsModule,
    ReactiveFormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    CardModule,
    ButtonModule,
    FieldsetModule,
    MessageModule,
    ArtistList,
    TabsModule,
  ],
  templateUrl: './bulk-add.html',
  styleUrl: './bulk-add.scss',
})
export class BulkAdd {
  bulkAddForm = new FormGroup(
    {
      input: new FormControl<string>(
        `haken
godspeed you black emperor
leprous
gotum`
      ),
    },
    (o) => (!o.value.input ? { input: 'required' } : null)
  );
  lines = signal('');
  itemsInProgress = signal(0);

  async search() {
    const lines = this.bulkAddForm.value.input
      ?.split('\n')
      .map((line) => line.trim())
      .filter((line) => !!line);
    if (!lines?.length) return;
    this.exactMatches.set([]);
    this.partialMatches.set([]);
    this.itemsInProgress.set(lines.length);
    await Promise.allSettled(lines.map((line) => this.searchItem(line, this.useResult.bind(this))));
  }

  exactMatches = signal<Artist[]>([]);
  partialMatches = signal<Artist[][]>([]);

  useResult(result: Artist | Artist[]) {
    if (Array.isArray(result)) {
      this.partialMatches.update((oa) => [...oa, result]);
    } else {
      this.exactMatches.update((oa) => [...oa, result]);
    }
    this.itemsInProgress.update((ov) => ov - 1);
  }
  musicBrainz = inject(MusicBrainz);
  async searchItem(query: string, emitResult: (result: Artist | Artist[]) => void) {
    let artistResult = null;
    if (query.match(midRegex)) {
      artistResult = await lastValueFrom(this.musicBrainz.getArtist(query));
      if (artistResult) {
        emitResult(artistResult);
        return;
      }
    }
    const searchResults = await lastValueFrom(this.musicBrainz.searchArtistByName(query));
    const exactMatch = searchResults.findIndex(
      (artist) => artist.score === 100 && artist.id !== screwThisGuyInParticular
    );
    if (exactMatch >= 0) {
      emitResult(searchResults[exactMatch]);
    } else {
      emitResult(searchResults);
    }
  }
}
