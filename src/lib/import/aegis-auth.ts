import { TokenHashingAlgo } from '$models/token-hashing-algo';
import { TokenInfo } from '$models/token-info';
import { TokenLength } from '$models/token-length';
import { TokenSecretEncoding } from '$models/token-secret-encoding';

function tokenLengthFromAegis(num: number) {
  if (num == 5) return TokenLength.FiveDigits;
  if (num == 8) return TokenLength.EightDigits;
  return TokenLength.SixDigits;
}

function nameFromAegis(issuer: string, account: string): string {
  if (issuer && account) {
    return `${issuer} (${account})`;
  }

  return account || issuer;
}

function tokenHashingAlgoFromAegis(str?: string) {
  const strNorm = str?.toLowerCase()?.trim();
  if (strNorm == TokenHashingAlgo.Sha256) return TokenHashingAlgo.Sha256;
  if (strNorm == TokenHashingAlgo.Sha512) return TokenHashingAlgo.Sha512;
  return TokenHashingAlgo.Sha1;
}

export function importFromAegisAuth(data: any) {
  const entries = data?.db?.entries;
  if (entries === null || !Array.isArray(entries)) {
    throw Error('Invalid import data file');
  }

  return entries
    .filter(f => f.type === 'totp')
    .map(
      m =>
        new TokenInfo({
          name: nameFromAegis(m.issuer, m.name),
          secret: m.info.secret,
          secretEncoding: TokenSecretEncoding.Base32,
          duration: m.info.period,
          length: tokenLengthFromAegis(m.info.digits),
          hashingAlgo: tokenHashingAlgoFromAegis(m.info.algo),
        }),
    );
}
