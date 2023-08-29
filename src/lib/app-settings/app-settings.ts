import type Store from 'electron-store';
import { BaseSettings } from './base-settings';
import { DatetimeSettings } from './datetime-settings';
import { TimezoneSettings } from './timezone-settings';
import { ThemeSettings } from './theme-settings';

export class AppSettings extends BaseSettings {
  #dateTimeSettings: DatetimeSettings;
  #timezoneSettings: TimezoneSettings;
  #themeSettings: ThemeSettings;

  constructor(store: Store) {
    super(store);
    this.#dateTimeSettings = new DatetimeSettings(store);
    this.#timezoneSettings = new TimezoneSettings(store);
    this.#themeSettings = new ThemeSettings(store);
  }

  get dateTime() {
    return this.#dateTimeSettings;
  }

  get timezone() {
    return this.#timezoneSettings;
  }

  get theme() {
    return this.#themeSettings;
  }

  override commit() {
    this.#dateTimeSettings.commit();
    this.#timezoneSettings.commit();
    this.#themeSettings.commit();
    super.commit();
  }

  override revert() {
    this.#dateTimeSettings.revert();
    this.#timezoneSettings.revert();
    this.#themeSettings.revert();
    super.revert();
  }

  override get hasPendingChanges(): boolean {
    return (
      super.hasPendingChanges ||
      this.#dateTimeSettings.hasPendingChanges ||
      this.#timezoneSettings.hasPendingChanges ||
      this.#themeSettings.hasPendingChanges
    );
  }
}
