import delay, { type Options } from 'delay';

export async function tryDelay<T>(milliseconds: number, options?: Options<T>) {
  try {
    return await delay<T>(milliseconds, options);
  } catch {
    return null;
  }
}
