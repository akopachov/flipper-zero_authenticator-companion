import type { TimeProvider } from './time-provider';

export class LocalTimeProvider implements TimeProvider {
  name: string = 'Local system time';

  getCurrentTime(): Date {
    return new Date();
  }
}
