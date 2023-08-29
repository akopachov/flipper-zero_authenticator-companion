import type Store from 'electron-store';
import { BaseSettings } from './base-settings';

export class DatetimeSettings extends BaseSettings {
  constructor(store: Store) {
    super(store, 'time');
  }

  get #PROVIDER_STORE_KEY() {
    return 'provider';
  }

  get #SYNC_AT_STARTUP_STORE_KEY() {
    return 'syncAtStartup';
  }

  get provider() {
    return this.get(this.#PROVIDER_STORE_KEY, Number, 0);
  }

  set provider(value: number) {
    if (value < 0 || value > 1) {
      throw new Error(`Value "${value}" is invalid and can't be set to property "${this.#PROVIDER_STORE_KEY}"`);
    }
    this.set(this.#PROVIDER_STORE_KEY, value);
  }

  get syncAtStartup() {
    return this.get(this.#SYNC_AT_STARTUP_STORE_KEY, Boolean, false);
  }

  set syncAtStartup(value: boolean) {
    this.set(this.#SYNC_AT_STARTUP_STORE_KEY, value);
  }
}
