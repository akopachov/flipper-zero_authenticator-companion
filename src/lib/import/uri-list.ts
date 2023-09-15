import log from 'electron-log';
import { parse } from '$lib/url-otpauth-ts/parse';
import { tokenHashingAlgoFromString } from '$models/token-hashing-algo';
import { DefaultTokenDuration, TokenInfo } from '$models/token-info';
import { tokenLengthFromNumber } from '$models/token-length';

function formatAccountName(issuer: string | null | undefined, account: string | null | undefined) {
  if (issuer && account) return `${issuer} (${account})`;
  return account || issuer || '';
}

export function importFromUriList(content: string) {
  const lines = content.split(/\r?\n/g);
  const results: TokenInfo[] = [];
  let lineNumber = 0;
  for (const line of lines) {
    lineNumber++;
    const normalizedLine = line.trim();
    try {
      const parsedTotpUri = parse(normalizedLine);
      results.push(
        new TokenInfo({
          name: formatAccountName(parsedTotpUri.issuer, parsedTotpUri.account),
          length: tokenLengthFromNumber(parsedTotpUri.digits),
          secret: parsedTotpUri.key,
          duration: parsedTotpUri.period || DefaultTokenDuration,
          hashingAlgo: tokenHashingAlgoFromString(parsedTotpUri.algorithm),
        }),
      );
    } catch (e) {
      log.warn(`An error occurred during parsing line #${lineNumber}`);
    }
  }

  return results;
}
