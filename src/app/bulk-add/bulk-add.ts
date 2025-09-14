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
import { SplitterModule } from 'primeng/splitter';
import { DrawerModule } from 'primeng/drawer';
import { TableModule } from 'primeng/table';
import { FollowedArtistsStore } from '../stores/followed-artists-store';
import { MessageService } from 'primeng/api';

const midRegex = /(?:[a-f0-9]){8}-(?:[a-f0-9]){4}-(?:[a-f0-9]){4}-(?:[a-f0-9]){4}-(?:[a-f0-9]){12}/;
const screwThisGuyInParticular = 'a0dedd56-290c-4d11-9cbc-85890c1128fb';

interface Match {
  query: string;
  match?: Artist;
  list?: Artist[];
}
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
    SplitterModule,
    DrawerModule,
    TableModule,
  ],
  templateUrl: './bulk-add.html',
  styleUrl: './bulk-add.scss',
  providers: [MessageService],
})
export class BulkAdd {
  bulkAddForm = new FormGroup(
    {
      input: new FormControl<string>(''),
    },
    (o) => (!o.value.input ? { input: 'required' } : null)
  );
  totalSearchQueued = signal(0);
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
    this.totalSearchQueued.set(lines.length);
    await Promise.allSettled(lines.map((line) => this.searchItem(line, this.useResult.bind(this))));
    this.bulkAddForm.controls.input.setValue('');
  }

  exactMatches = signal<Artist[]>([]);
  partialMatches = signal<Match[]>([]);
  useResult(result: Match) {
    if (result.match) {
      this.exactMatches.update((oa) => [...oa, result.match!]);
    } else {
      this.partialMatches.update((oa) => [...oa, result]);
    }
    this.itemsInProgress.update((ov) => ov - 1);
  }

  artistInReview = signal<Match | undefined>(undefined);

  musicBrainz = inject(MusicBrainz);
  async searchItem(query: string, emitResult: (result: Match) => void) {
    let artistResult = null;
    const match: Match = { query };
    if (query.match(midRegex)) {
      artistResult = await lastValueFrom(this.musicBrainz.getArtist(query));
      if (artistResult) {
        match.match = artistResult;
        emitResult(match);
        return;
      }
    }
    const searchResults = await lastValueFrom(this.musicBrainz.searchArtistByName(query));
    const exactMatch = searchResults.findIndex(
      (artist) =>
        artist.score === 100 &&
        artist.id !== screwThisGuyInParticular &&
        artist.name.toLowerCase() === query.toLowerCase()
    );
    match.list = searchResults;
    if (exactMatch >= 0) {
      match.match = searchResults[exactMatch];
    }
    emitResult(match);
  }

  removeExactMatch(artist: Artist) {
    this.exactMatches.update((ov) => ov.filter((m) => m !== artist));
  }

  removePartialMatch(match: Match) {
    this.partialMatches.update((ov) => ov.filter((m) => m !== match));
  }

  selectMatch(artist: Artist) {
    this.exactMatches.update((ov) => [...ov, artist]);
    this.removePartialMatch(this.artistInReview()!);
    this.artistInReview.set(undefined);
  }

  followedArtistStore = inject(FollowedArtistsStore);
  messageService = inject(MessageService);
  importAll() {
    const exactMatches = this.exactMatches();
    const totalCount = exactMatches.length;
    const newExactMatches = exactMatches.filter((em) => !this.followedArtistStore.contains(em.id));
    const skippedCount = totalCount - newExactMatches.length;
    if (skippedCount) {
      this.messageService.add({
        severity: 'warning',
        summary: 'Some items skipped',
        detail: `${totalCount - newExactMatches.length} of the artists are already followed`,
      });
    }
    if (newExactMatches.length) {
      this.followedArtistStore.addAll(newExactMatches);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: `${newExactMatches.length} new artists are now being followed`,
      });
    }

    this.exactMatches.set([]);
    this.partialMatches.set([]);
    this.bulkAddForm.controls.input.setValue('');
  }
}
