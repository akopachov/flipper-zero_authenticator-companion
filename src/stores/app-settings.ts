import Store from 'electron-store';
import { AppSettings } from '$lib/app-settings';
import { Singleton } from '$lib/singleton';

const store = Singleton.instance('AppSettingsStore', () => new Store());

export function getAppSettings() {
  return new AppSettings(store);
}
