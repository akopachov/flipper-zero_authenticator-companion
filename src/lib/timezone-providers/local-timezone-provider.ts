import type { TimezoneProvider } from './timezone-provider';

export class LocalTimezoneProvider implements TimezoneProvider {
  name: string = 'Local system timezone';

  getCurrentTimezoneOffset(): Promise<number> {
    return new Promise(resolve => resolve(-new Date().getTimezoneOffset() / 60));
  }
}
