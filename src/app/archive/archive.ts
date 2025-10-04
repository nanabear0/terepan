import { Component, computed, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { AlbumList } from '../album-list/album-list';
import { Album } from '../music-brainz/album';
import { ArtistMetadataStore } from '../stores/artist-metadata-store';
import { BeetsDbStore } from '../stores/beets-db-store';
import { FollowedArtistsStore } from '../stores/followed-artists-store';

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
    AlbumList,
  ],
  templateUrl: './archive.html',
  styleUrl: './archive.scss',
})
export class Archive {
  artistMetadataStore = inject(ArtistMetadataStore);
  followedArtistsStore = inject(FollowedArtistsStore);
  beetsDbStore = inject(BeetsDbStore);
  missingReleases = computed(() => {
    return (
      this.followedArtistsStore
        .artists()
        .flatMap((artist) => this.artistMetadataStore.get(artist)?.albums)
        ?.filter((x): x is Album => !!x && !this.beetsDbStore.contains(x.id)) ?? []
    );
  });

  onUpload({ files }: FileSelectEvent) {
    const file = files[0];
    if (!file) return;

    this.beetsDbStore.importDb(file);
  }
}
