import Store from 'electron-store';
import { AppSettings } from '$models/app-settings';

const store = new Store();

export function getAppSettings() {
  return new AppSettings(store);
}
