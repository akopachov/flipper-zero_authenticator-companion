import log from 'electron-log';
import { DefaultTokenCounter, DefaultTokenDuration, TokenInfo } from '$models/token-info';
import { parse } from '$lib/url-otpauth-ts/parse';
import { tokenLengthFromNumber } from '$models/token-length';
import { tokenTypeFromString } from '$models/token-type';
import { tokenHashingAlgoFromString } from '$models/token-hashing-algo';

function formatAccountName(
  issuer: string | null | undefined,
  account: string | null | undefined,
  entryName: string | null | undefined,
) {
  if (issuer && account) return `${issuer} (${account})`;
  return account || issuer || entryName || '';
}

export function importFromBitwarden(data: any) {
  const entries = data?.items;
  if (entries === null || !Array.isArray(entries)) {
    throw Error('Invalid import data file');
  }

  const results: TokenInfo[] = [];

  for (const entry of entries) {
    const totpUri = entry.login?.totp;
    if (!totpUri) {
      continue;
    }
    try {
      const parsedTotpUri = parse(totpUri);
      results.push(
        new TokenInfo({
          type: tokenTypeFromString(parsedTotpUri.type),
          name: formatAccountName(parsedTotpUri.issuer, parsedTotpUri.account, entry.name),
          length: tokenLengthFromNumber(parsedTotpUri.digits),
          secret: parsedTotpUri.key,
          duration: parsedTotpUri.period || DefaultTokenDuration,
          counter: parsedTotpUri.counter || DefaultTokenCounter,
          hashingAlgo: tokenHashingAlgoFromString(parsedTotpUri.algorithm),
        }),
      );
    } catch {
      log.warn(`An error occurred during parsing totp uri for item #${entry.id}`);
    }
  }

  return results;
}
