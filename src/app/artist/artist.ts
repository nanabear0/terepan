import { Component, computed, effect, inject, input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Fieldset } from 'primeng/fieldset';
import { AlbumList } from '../album-list/album-list';
import { MusicBrainz } from '../music-brainz/music-brainz';
import { ArtistMetadataStore } from '../stores/artist-metadata-store';
import { FollowedArtistsStore } from '../stores/followed-artists-store';
import { Title } from '@angular/platform-browser';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-artist',
  imports: [AlbumList, ButtonModule, Fieldset, Tag],
  templateUrl: './artist.html',
  styleUrl: './artist.scss',
})
export class Artist {
  private route = inject(ActivatedRoute);
  value = input('');
  musicBrainzService = inject(MusicBrainz);
  artistMetadataStore = inject(ArtistMetadataStore);
  artistId = computed(() => this.route.snapshot.paramMap.get('artistId') ?? this.value());
  artistWithAlbum = computed(() => {
    return this.artistMetadataStore.get(this.artistId());
  });
  title = inject(Title);

  constructor() {
    effect(() => {
      const artistId = this.artistId();
      if (artistId) this.artistMetadataStore.queueArtistUpdate([artistId]);
    });

    effect(() => {
      const artist = this.artistWithAlbum();
      if (artist && !this.value()) {
        this.title.setTitle(`Terepan - ${artist.name}`);
      }
    });
  }

  updateEffect = effect(() => {
    if (this.artistWithAlbum()) {
      this.artistMetadataStore.queueArtistUpdate([this.artistId()], true);
      this.artistMetadataStore.queueArtistUpdate([this.artistId()], true);
      this.updateEffect.destroy();
    }
  });

  userStore = inject(FollowedArtistsStore);
  public async addArtist() {
    const artist = this.artistId()!;
    if (!artist) return;

    if (this.isArtistFollowed()) {
      await this.userStore.remove(artist);
    } else {
      await this.userStore.add(artist);
    }
  }

  isArtistFollowed = computed(() => {
    const artist = this.artistId()!;
    if (!artist) return;
    return this.userStore.contains(artist);
  });
}
