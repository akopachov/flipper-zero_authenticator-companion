import { getAppSettings } from '$stores/app-settings';
import type { TimezoneProvider } from './timezone-provider';

export class FromConfigTimezoneProvider implements TimezoneProvider {
  name: string = 'Manual';

  getCurrentTimezoneOffset(): Promise<number> {
    return new Promise(resolve => resolve(getAppSettings().timezone.manualOffset));
  }
}
