import log from 'electron-log';
import promiseRetry from 'promise-retry';
import { CloudTimeProvider } from './cloud-time-provider';
import { LocalTimeProvider } from './local-time-provider';

const RetrySettings = {
  retries: 3,
  minTimeout: 1000,
  maxTimeout: 2000,
  randomize: true,
};

export class FallbackCloudTimeProvider extends CloudTimeProvider {
  #fallbackProvider = new LocalTimeProvider();

  async getCurrentTime(signal?: AbortSignal): Promise<Date> {
    let date;
    try {
      date = await promiseRetry(retry => super.getCurrentTime(signal).catch(retry), RetrySettings);
    } catch (e) {
      log.warn(e);
      date = this.#fallbackProvider.getCurrentTime();
    }

    return date;
  }
}
