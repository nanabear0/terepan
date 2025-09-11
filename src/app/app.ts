import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { Toolbar } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ScrollPanelModule,
    Toolbar,
    ButtonModule,
    RouterModule,
    BreadcrumbModule,
    AvatarModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('terepan');
  router = inject(Router);
}
