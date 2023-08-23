import type { TimeProvider } from './time-provider';

export class CloudTimeProvider implements TimeProvider {
  name: string = 'Cloud time';

  async getCurrentTime(signal?: AbortSignal): Promise<Date> {
    let response: { datetime: string };
    try {
      response = await fetch('http://worldtimeapi.org/api/ip', { signal: signal }).then(r => r.json());
    } catch (e: any) {
      if (e.code === 'ENOTFOUND') {
        throw new Error(`Time service is currently unavailable.`);
      } else if (e.type === 'invalid-json') {
        throw new Error(`Too many requests. Try a bit later.`);
      } else {
        throw new Error('Unknown error ocurred during querying time service');
      }
    }

    return new Date(response.datetime);
  }
}
