import { TotpAppClient } from '$lib/totp-client';
import { readable } from 'svelte/store';

export const SharedTotpAppClient = readable(new TotpAppClient());
