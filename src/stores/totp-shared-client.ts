import { Singleton } from '$lib/singleton';
import { TotpAppClient } from '$lib/totp-client';

export const SharedTotpAppClient = Singleton.instance('SharedTotpAppClient', () => new TotpAppClient());
