import { CloudTimezoneProvider } from './cloud-timezone-provider';
import { LocalTimezoneProvider } from './local-timezone-provider';

export * from './timezone-provider';

export const AvailableTimezoneProviders = [new LocalTimezoneProvider(), new CloudTimezoneProvider()];
