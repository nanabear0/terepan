import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ToastModule } from 'primeng/toast';
import { ArtistMetadataStore } from './stores/artist-metadata-store';
import { ThumbnailStore } from './stores/thumbnail-store';
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ScrollPanelModule,
    ButtonModule,
    RouterModule,
    BreadcrumbModule,
    AvatarModule,
    MenubarModule,
    ToastModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  providers: [MessageService],
})
export class App {
  protected readonly title = signal('terepan');
  router = inject(Router);
  menubarItems: MenuItem[] = [
    {
      routerLink: '/followed-artists',
      label: 'Followed Artists',
    },
    {
      routerLink: '/latest-releases',
      label: 'Latest Releases',
    },
    {
      routerLink: '/search',
      label: 'Search',
    },
    {
      routerLink: '/import',
      label: 'Import',
    },
    {
      routerLink: '/export',
      label: 'Export',
    },
    {
      routerLink: '/bulk-add',
      label: 'Bulk Add',
    },
  ];
  artistMetadataStore = inject(ArtistMetadataStore);
  thumbnailStore = inject(ThumbnailStore);
  messageService = inject(MessageService);

  constructor() {
    effect(() => {
      if (this.artistMetadataStore.updateInProgress()) {
        this.messageService.add({
          summary: 'Metadata update in progress',
          detail: 'Content could be incomplete/outdated',
          severity: 'info',
          closable: false,
          sticky: true,
        });
      } else {
        this.messageService.clear();
      }
    });
  }
}
