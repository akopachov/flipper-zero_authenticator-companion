import { CloudTimeProvider } from './cloud-time-provider';
import { LocalTimeProvider } from './local-time-provider';

export * from './time-provider';

export const AvailableTimeProviders = [new LocalTimeProvider(), new CloudTimeProvider()];
