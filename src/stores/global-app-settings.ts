import Store from 'electron-store';
import { AppSettings } from '$models/app-settings';

export const GlobalAppSettings = new AppSettings(new Store());
