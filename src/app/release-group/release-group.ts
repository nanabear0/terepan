import { Component, computed, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Fieldset } from 'primeng/fieldset';
import { PanelModule } from 'primeng/panel';
import { AlbumCover } from '../album-list/album-cover/album-cover';
import { MusicBrainz } from '../music-brainz/music-brainz';
import { Release } from '../music-brainz/release';
import { ArtistList } from '../release-list/release-list';
import { ArtistMetadataStore } from '../stores/artist-metadata-store';
import { FollowedArtistsStore } from '../stores/followed-artists-store';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-release-group',
  imports: [ButtonModule, Fieldset, PanelModule, AlbumCover, ArtistList, RouterModule, Tag],
  templateUrl: './release-group.html',
  styleUrl: './release-group.scss',
})
export class ReleaseGroup {
  private route = inject(ActivatedRoute);
  musicBrainzService = inject(MusicBrainz);
  artistMetadataStore = inject(ArtistMetadataStore);
  title = inject(Title);
  artistId = computed(() => this.route.snapshot.paramMap.get('artistId'));
  albumId = computed(() => this.route.snapshot.paramMap.get('albumId'));
  artist = computed(() => {
    const artistId = this.artistId();
    if (!artistId) {
      return undefined;
    }

    return this.artistMetadataStore.get(artistId);
  });

  album = computed(() => {
    const artist = this.artist();
    if (!artist) {
      return undefined;
    }

    return artist.albums?.find((album) => album.id === this.albumId());
  });

  releases = signal<Release[]>([]);

  constructor() {
    effect(() => {
      const artistId = this.artistId();
      if (artistId) this.artistMetadataStore.queueArtistUpdate([artistId]);
    });

    effect(() => {
      const album = this.album();
      if (album) {
        this.musicBrainzService.getReleasesOfAlbum(album).subscribe((releases) => {
          this.releases.set(
            releases.sort(
              (a1: Release, a2: Release) => (a2.date?.getTime() ?? 0) - (a1.date?.getTime() ?? 0)
            )
          );
        });
      }
    });

    effect(() => {
      const artist = this.artist();
      const album = this.album();
      if (artist && album) {
        this.title.setTitle(`Terepan - ${artist.name} - ${album.title}`);
      }
    });
  }

  updateEffect = effect(() => {
    const artist = this.artist();
    if (artist) {
      this.artistMetadataStore.queueArtistUpdate([artist.id], true);
      this.artistMetadataStore.queueAlbumUpdate([artist.id], true);
      this.updateEffect.destroy();
    }
  });

  userStore = inject(FollowedArtistsStore);
}
