import { TokenHashingAlgo } from '$models/token-hashing-algo';
import { TokenInfo } from '$models/token-info';
import { TokenLength } from '$models/token-length';
import { TokenSecretEncoding } from '$models/token-secret-encoding';

function tokenLengthFrom2Fas(num: number) {
  if (num == 5) return TokenLength.FiveDigits;
  if (num == 8) return TokenLength.EightDigits;
  return TokenLength.SixDigits;
}

function nameFrom2Fas(issuer: string, account: string): string {
  if (issuer && account) {
    return `${issuer} (${account})`;
  }

  return account || issuer || '';
}

function tokenHashingAlgoFrom2Fas(str?: string) {
  const strNorm = str?.toLowerCase()?.trim();
  if (strNorm == TokenHashingAlgo.Sha256) return TokenHashingAlgo.Sha256;
  if (strNorm == TokenHashingAlgo.Sha512) return TokenHashingAlgo.Sha512;
  return TokenHashingAlgo.Sha1;
}

export function importFrom2FasAuth(data: any) {
  const entries = data?.services;
  if (entries === null || !Array.isArray(entries)) {
    throw Error('Invalid import data file');
  }

  return entries
    .filter(f => f.otp.tokenType === 'TOTP')
    .map(
      m =>
        new TokenInfo({
          name: nameFrom2Fas(m.otp.issuer, m.otp.account),
          secret: m.secret,
          secretEncoding: TokenSecretEncoding.Base32,
          duration: m.otp.period,
          length: tokenLengthFrom2Fas(m.otp.digits),
          hashingAlgo: tokenHashingAlgoFrom2Fas(m.otp.algorithm),
        }),
    );
}
