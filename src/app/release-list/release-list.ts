import { CommonModule } from '@angular/common';
import { Component, effect, input, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { TableModule } from 'primeng/table';
import { AlbumCover } from '../album-list/album-cover/album-cover';
import { Release } from '../music-brainz/release';

@Component({
  selector: 'app-release-list',
  imports: [TableModule, ButtonModule, CommonModule, DrawerModule, AlbumCover],
  templateUrl: './release-list.html',
  styleUrl: './release-list.scss',
})
export class ArtistList {
  value = input<Release[]>([]);
  localizer = new Intl.DisplayNames(['en'], { type: 'region' });

  expandedRows = signal<Record<string, boolean>>({});
  expandFirstEffect = effect(() => {
    const releases = this.value();
    if (releases.length) {
      this.expandedRows.set({ [releases[0].id]: true });
      this.expandFirstEffect.destroy();
    }
  });

  msToDuration(ms: number) {
    if (ms < 0) return '0:00';
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    const secs = s % 60;
    const mins = m % 60;
    const hrs = h % 24;
    const parts = [];
    if (d) parts.push(`${d}d`);
    if (h) parts.push(`${hrs}h`);
    if (m) parts.push(`${mins}m`);
    parts.push(`${secs.toString().padStart(2, '0')}s`);
    return parts.join(' ');
  }
}
