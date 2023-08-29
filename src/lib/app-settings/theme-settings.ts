import type Store from 'electron-store';
import { BaseSettings } from './base-settings';

export enum ThemeColorSchemePreference {
  Light = 'light',
  Dark = 'dark',
  System = 'os',
}

export class ThemeSettings extends BaseSettings {
  get #COLOR_SCHEME_STORE_KEY() {
    return 'colorScheme';
  }

  constructor(store: Store) {
    super(store, 'theme');
  }

  get colorScheme() {
    return this.get<ThemeColorSchemePreference>(
      this.#COLOR_SCHEME_STORE_KEY,
      v => {
        if (v == ThemeColorSchemePreference.Light) return ThemeColorSchemePreference.Light;
        if (v == ThemeColorSchemePreference.Dark) return ThemeColorSchemePreference.Dark;
        return ThemeColorSchemePreference.System;
      },
      ThemeColorSchemePreference.System,
    );
  }

  set colorScheme(value: ThemeColorSchemePreference) {
    this.set(this.#COLOR_SCHEME_STORE_KEY, value);
  }
}
