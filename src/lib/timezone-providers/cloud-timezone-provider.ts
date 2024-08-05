import type { TimezoneProvider } from './timezone-provider';

export class CloudTimezoneProvider implements TimezoneProvider {
  name: string = 'Cloud timezone';

  async getCurrentTimezoneOffset(signal?: AbortSignal): Promise<number> {
    let response: { dst: boolean; raw_offset: number; dst_offset: number };
    try {
      response = await fetch('http://worldtimeapi.org/api/ip', { signal: signal }).then(r => r.json());
    } catch (e: any & { code?: string; type?: string }) {
      if (e.code === 'ENOTFOUND') {
        throw new Error(`Timezone service is currently unavailable.`);
      } else if (e.type === 'invalid-json') {
        throw new Error(`Too many requests. Try a bit later.`);
      } else {
        throw new Error('Unknown error occurred during querying timezone service');
      }
    }

    const offsetSec = response.raw_offset + (response.dst ? response.dst_offset : 0);
    return offsetSec / 3600;
  }
}
