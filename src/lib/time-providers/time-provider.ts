export interface TimeProvider {
  name: string;
  getCurrentTime(): Date;
}
