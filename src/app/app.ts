import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { ScrollPanelModule } from 'primeng/scrollpanel';
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
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
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
  ];
}
