import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { Toolbar } from 'primeng/toolbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ScrollPanelModule, Toolbar, ButtonModule, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('terepan');
  router = inject(Router);
  menuItems: MenuItem[] = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      routerLink: '/',
    },
  ];
}
