import { FallbackCloudTimezoneProvider } from './fallback-cloud-timezone-provider';
import { FromConfigTimezoneProvider } from './from-config-timezone-provider';
import { LocalTimezoneProvider } from './local-timezone-provider';

export * from './timezone-provider';

export const AvailableTimezoneProviders = [
  new LocalTimezoneProvider(),
  new FallbackCloudTimezoneProvider(),
  new FromConfigTimezoneProvider(),
];
