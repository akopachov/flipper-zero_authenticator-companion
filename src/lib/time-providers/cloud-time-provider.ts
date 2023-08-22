import type { TimeProvider } from './time-provider';

export class CloudTimeProvider implements TimeProvider {
  name: string = 'Cloud time';

  getCurrentTime(): Date {
    return new Date();
  }
}
