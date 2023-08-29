import type Store from 'electron-store';

class BaseSettings {
  #pendingChanges: { [key: string]: any };
  #store: Store;
  #scopeKey?: string;
  #isDirty: boolean = false;

  constructor(store: Store, scopeKey?: string) {
    this.#store = store;
    this.#pendingChanges = {};
    this.#scopeKey = scopeKey;
  }

  #getAbsoluteKey(key: string): string {
    if (this.#scopeKey) {
      return `${this.#scopeKey}.${key}`;
    }

    return key;
  }

  get hasPendingChanges(): boolean {
    return this.#isDirty;
  }

  protected set<TValue>(key: string, value: TValue) {
    this.#pendingChanges[this.#getAbsoluteKey(key)] = value;
    this.#isDirty = true;
  }

  protected get<TValue>(key: string, cast: (arg: unknown) => TValue, defaultValue?: TValue): TValue {
    const absoluteKey = this.#getAbsoluteKey(key);
    if (Object.hasOwn(this.#pendingChanges, absoluteKey)) {
      return cast(this.#pendingChanges[absoluteKey]);
    }

    return cast(this.#store.get(absoluteKey, defaultValue));
  }

  commit() {
    if (this.#isDirty) {
      this.#store.set(this.#pendingChanges);
      this.#pendingChanges = {};
      this.#isDirty = false;
    }
  }

  revert() {
    if (this.#isDirty) {
      this.#pendingChanges = {};
      this.#isDirty = false;
    }
  }
}

class DatetimeSettings extends BaseSettings {
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

class TimezoneSettings extends BaseSettings {
  constructor(store: Store) {
    super(store, 'timeZone');
  }

  get #PROVIDER_STORE_KEY() {
    return 'provider';
  }

  get #SYNC_AT_STARTUP_STORE_KEY() {
    return 'syncAtStartup';
  }

  get #MANUAL_TIMEZONE_OFFSET_KEY() {
    return 'manualOffset';
  }

  get provider() {
    return this.get(this.#PROVIDER_STORE_KEY, Number, 0);
  }

  set provider(value: number) {
    if (value < 0 || value > 2) {
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

  get manualOffset() {
    return this.get(this.#MANUAL_TIMEZONE_OFFSET_KEY, Number, 0);
  }

  set manualOffset(value: number) {
    this.set(this.#MANUAL_TIMEZONE_OFFSET_KEY, value);
  }
}

export enum ThemeColorSchemePreference {
  Light = 'light',
  Dark = 'dark',
  System = 'os',
}

class ThemeSettings extends BaseSettings {
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
      super.hasPendingChanges || this.#dateTimeSettings.hasPendingChanges || this.#timezoneSettings.hasPendingChanges
    );
  }
}
