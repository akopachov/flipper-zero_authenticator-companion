import { getAppSettings } from '$stores/global-app-settings';
import type { TimezoneProvider } from './timezone-provider';

export class FromConfigTimezoneProvider implements TimezoneProvider {
  name: string = 'Manual';

  getCurrentTimezoneOffset(): Promise<number> {
    return new Promise(resolve => resolve(getAppSettings().timezone.manualOffset));
  }
}
