import { effect, inject, Injectable, signal } from '@angular/core';
import { Album, albumSchema } from '../music-brainz/album';
import { MusicBrainz } from '../music-brainz/music-brainz';
import { FollowedArtistsStore } from './followed-artists-store';
import { ThumbnailStore } from './thumbnail-store';
import * as yup from 'yup';

export interface ReleaeTypes {
  primaryTypes: Set<string>;
  secondaryTypes: Set<string>;
  activeTypes: Set<string>;
}

const releaseTypesSchema = yup.object({
  primaryTypes: yup.array().of(yup.string().required()).required(),
  secondaryTypes: yup.array().of(yup.string().required()).required(),
  activeTypes: yup.array().of(yup.string().required()).required(),
});

@Injectable({ providedIn: 'root' })
export class ReleaseTypesStore {
  private localStorageKey = 'releaseTypes';
  public releaseTypes = signal<ReleaeTypes>({
    primaryTypes: new Set(),
    secondaryTypes: new Set(),
    activeTypes: new Set(),
  });
  public ready = signal(false);

  public async parseReleaseTypes(str: string): Promise<ReleaeTypes | null> {
    const albums: Album[] = [];
    try {
      const parsedJSON = JSON.parse(str ?? '');
      const releaseTypes = await releaseTypesSchema.cast(parsedJSON);
      return {
        primaryTypes: new Set(releaseTypes.primaryTypes),
        secondaryTypes: new Set(releaseTypes.secondaryTypes),
        activeTypes: new Set(releaseTypes.activeTypes),
      };
    } catch (e: unknown) {
      console.error(e);
      return null;
    }
  }

  public stringifyReleaseTypes(beautiful = false): string {
    const stringifiableReleaseTypes: Record<keyof ReleaeTypes, string[]> = {
      primaryTypes: [...this.releaseTypes().primaryTypes],
      secondaryTypes: [...this.releaseTypes().secondaryTypes],
      activeTypes: [...this.releaseTypes().activeTypes],
    };
    if (beautiful) {
      return JSON.stringify(stringifiableReleaseTypes, null, 2);
    } else {
      return JSON.stringify(stringifiableReleaseTypes);
    }
  }

  private async loadCache() {
    const newCache = await this.parseReleaseTypes(localStorage.getItem(this.localStorageKey) ?? '');
    this.releaseTypes.set(
      newCache ?? {
        primaryTypes: new Set(),
        secondaryTypes: new Set(),
        activeTypes: new Set(),
      }
    );
  }

  constructor() {
    this.loadCache().then(() => this.ready.set(true));

    effect(() => {
      if (this.ready()) {
        localStorage.setItem(this.localStorageKey, this.stringifyReleaseTypes());
      }
    });
  }

  addReleaseTypes(npt: string | null, nsts?: string[]) {
    const { primaryTypes, secondaryTypes, activeTypes } = this.releaseTypes();
    let update = false;
    if (npt && !primaryTypes.has(npt)) {
      primaryTypes.add(npt);
      activeTypes.add(npt);
      update = true;
    }
    if (nsts?.some((nst) => !secondaryTypes.has(nst))) {
      nsts.forEach((nst) => {
        secondaryTypes.add(nst);
        activeTypes.add(nst);
      });
      update = true;
    }
    if (update) {
      this.releaseTypes.set({
        primaryTypes,
        secondaryTypes,
        activeTypes,
      });
    }
  }
}
