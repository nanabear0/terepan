import { Component, computed, inject } from '@angular/core';
import { SelectItemGroup } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { MultiSelectChangeEvent, MultiSelectModule } from 'primeng/multiselect';
import { ReleaseTypesStore } from '../stores/release-types-store';

@Component({
  selector: 'app-release-type-filter',
  imports: [MultiSelectModule, FormsModule],
  templateUrl: './release-type-filter.html',
  styleUrl: './release-type-filter.scss',
})
export class ReleaseTypeFilter {
  updateSelectedTypes(event: MultiSelectChangeEvent) {
    this.releaseTypesStore.releaseTypes.update((rs) => ({
      ...rs,
      activeTypes: new Set(event.value as string),
    }));
  }

  releaseTypesStore = inject(ReleaseTypesStore);
  groupedTypes = computed<SelectItemGroup[]>(() => {
    const { primaryTypes, secondaryTypes } = this.releaseTypesStore.releaseTypes();
    return [
      {
        label: 'Primary Types',
        items: [...primaryTypes].map((v) => ({ value: v, label: v })),
      },
      {
        label: 'Secondary Types',
        items: [...secondaryTypes].map((v) => ({ value: v, label: v })),
      },
    ];
  });

  selectedTypes = computed(() => {
    const { activeTypes } = this.releaseTypesStore.releaseTypes();
    return [...activeTypes];
  });
}
