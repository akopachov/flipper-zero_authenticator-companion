export interface TimezoneProvider {
  name: string;
  getCurrentTimezoneOffset(signal?: AbortSignal): Promise<number>;
}
