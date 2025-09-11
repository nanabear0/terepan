import { Component, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { FollowedArtistsStore } from '../stores/followed-artists-store';

@Component({
  selector: 'app-export',
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
  ],
  templateUrl: './export.html',
  styleUrl: './export.scss',
})
export class Export {
  exportedValue = signal('');
  followedArtistsStore = inject(FollowedArtistsStore);

  export() {
    this.exportedValue.set(this.followedArtistsStore.stringifyArtistMap(true));
  }

  saveToFile() {
    const fileName = `export-${new Date().toISOString()}.json`;
    const blob = new Blob([this.exportedValue()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
}
