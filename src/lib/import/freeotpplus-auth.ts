import { TokenHashingAlgo } from '$models/token-hashing-algo';
import { TokenInfo } from '$models/token-info';
import { TokenLength } from '$models/token-length';
import { TokenSecretEncoding } from '$models/token-secret-encoding';

function tokenLengthFromFreeOtpPlus(num: number) {
  if (num == 5) return TokenLength.FiveDigits;
  if (num == 8) return TokenLength.EightDigits;
  return TokenLength.SixDigits;
}

function nameFromFreeOtpPlus(issuer: string, account: string): string {
  if (issuer && account) {
    return `${issuer} (${account})`;
  }

  return account || issuer;
}

function tokenHashingAlgoFromFreeOtpPlus(str?: string) {
  const strNorm = str?.toLowerCase()?.trim();
  if (strNorm == TokenHashingAlgo.Sha256) return TokenHashingAlgo.Sha256;
  if (strNorm == TokenHashingAlgo.Sha512) return TokenHashingAlgo.Sha512;
  return TokenHashingAlgo.Sha1;
}

function tokenSecretFromFreeOtpPlus(secretArray: number[]) {
  return Buffer.from(secretArray.map(n => n & 0xff)).toString('base64');
}

export function importFromFreeOtpPlusAuth(data: any) {
  const entries = data?.tokens;
  if (entries === null || !Array.isArray(entries)) {
    throw Error('Invalid import data file');
  }

  return entries
    .filter(f => f.type === 'TOTP')
    .map(
      m =>
        new TokenInfo({
          name: nameFromFreeOtpPlus(m.issuerExt, m.label),
          secret: tokenSecretFromFreeOtpPlus(m.secret),
          secretEncoding: TokenSecretEncoding.Base64,
          duration: m.period,
          length: tokenLengthFromFreeOtpPlus(m.digits),
          hashingAlgo: tokenHashingAlgoFromFreeOtpPlus(m.algo),
        }),
    );
}
