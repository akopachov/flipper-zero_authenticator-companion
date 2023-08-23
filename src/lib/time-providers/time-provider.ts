export interface TimeProvider {
  name: string;
  getCurrentTime(signal?: AbortSignal): Promise<Date>;
}
