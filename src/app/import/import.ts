import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { Artist } from '../music-brainz/artist';
import { ArtistMetadataStore } from '../stores/artist-metadata-store';
import { FollowedArtistsStore } from '../stores/followed-artists-store';
import { ArtistList } from '../artist-list/artist-list';

@Component({
  selector: 'app-import',
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
    FileUploadModule,
    ArtistList,
  ],
  templateUrl: './import.html',
  styleUrl: './import.scss',
  providers: [MessageService],
})
export class Import {
  importForm = new FormGroup({ input: new FormControl<string>('') }, (o) =>
    !o.value.input ? { input: 'required' } : null
  );
  followedArtistsStore = inject(FollowedArtistsStore);
  artistMetadataStore = inject(ArtistMetadataStore);
  parsedArtistIds = signal<Set<string>>(new Set());
  _ = effect(() => {
    this.artistMetadataStore.queueArtistUpdate([...this.parsedArtistIds()]);
  });
  parsedArtistsToBeAdded = computed(() => {
    const result: string[] = [];
    const parsedArtists = this.parsedArtistIds();

    for (const artistId of parsedArtists) {
      if (!this.followedArtistsStore.contains(artistId)) {
        result.push(artistId);
      }
    }
    return result;
  });

  parsedArtistsWithMetadata = computed(() => {
    const result: Artist[] = [];
    const parsedArtists = this.parsedArtistsToBeAdded();

    for (const artistId of parsedArtists) {
      const artist = this.artistMetadataStore.readonlyCache()[artistId];
      if (artist) {
        result.push(artist);
      }
    }
    return result;
  });
  messageService = inject(MessageService);

  allArtistsAlreadyAdded = computed(
    () => !!this.parsedArtistIds()?.size && !this.parsedArtistsToBeAdded().length
  );

  async validate() {
    const json = this.importForm.value.input ?? '';
    const newArtists = await this.followedArtistsStore.parseArtistMap(json);
    if (!newArtists) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation error!',
        detail: 'Invalid JSON',
      });
      return;
    }
    this.parsedArtistIds.set(newArtists);
  }

  import() {
    const parsedArtists = this.parsedArtistsWithMetadata();
    if (parsedArtists?.length) {
      this.followedArtistsStore.importArtists(parsedArtists.map((x) => x.id));
      this.parsedArtistIds.set(new Set());
      this.importForm.controls.input.setValue('');
      this.messageService.add({
        severity: 'success',
        summary: 'Import successful!',
        detail: `${parsedArtists.length} artists added/updated`,
      });
    }
  }

  onUpload({ files }: FileSelectEvent) {
    const file = files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        this.importForm.controls.input.setValue(reader.result.toString());
      }
    };
    reader.readAsText(file);
  }
}
