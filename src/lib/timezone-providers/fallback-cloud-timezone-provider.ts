import log from 'electron-log';
import promiseRetry from 'promise-retry';
import { CloudTimezoneProvider } from './cloud-timezone-provider';
import { LocalTimezoneProvider } from './local-timezone-provider';

const RetrySettings = {
  retries: 3,
  minTimeout: 1000,
  maxTimeout: 2000,
  randomize: true,
};

export class FallbackCloudTimezoneProvider extends CloudTimezoneProvider {
  #fallbackProvider = new LocalTimezoneProvider();

  async getCurrentTimezoneOffset(signal?: AbortSignal): Promise<number> {
    let timezone;
    try {
      timezone = await promiseRetry(retry => super.getCurrentTimezoneOffset(signal).catch(retry), RetrySettings);
    } catch (e) {
      log.warn(e);
      timezone = await this.#fallbackProvider.getCurrentTimezoneOffset();
    }

    return timezone;
  }
}
