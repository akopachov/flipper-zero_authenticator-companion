import type { TimeProvider } from './time-provider';

export class LocalTimeProvider implements TimeProvider {
  name: string = 'Local system time';

  getCurrentTime(): Promise<Date> {
    return new Promise(resolve => resolve(new Date()));
  }
}
