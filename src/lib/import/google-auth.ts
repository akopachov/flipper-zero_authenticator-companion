import protobuf from 'protobufjs';
import googleAuthProto from './google-auth.proto.json';
import { DefaultTokenCounter, TokenInfo } from '$models/token-info';
import { TokenSecretEncoding } from '$models/token-secret-encoding';
import { TokenHashingAlgo } from '$models/token-hashing-algo';
import { TokenLength } from '$models/token-length';
import { TokenType } from '$models/token-type';

function hashingAlgoFromGoogle(googleHashingAlgo: string): TokenHashingAlgo {
  switch (googleHashingAlgo.toUpperCase()) {
    case 'ALGO_SHA256':
      return TokenHashingAlgo.Sha256;
    case 'ALGO_SHA512':
      return TokenHashingAlgo.Sha512;
    default:
      return TokenHashingAlgo.Sha1;
  }
}

function lengthFromGoogle(googleDigitsCount: number): TokenLength {
  if (googleDigitsCount === 2) return TokenLength.EightDigits;
  return TokenLength.SixDigits;
}

function nameFromGoogle(issuer: string, name: string): string {
  if (!issuer && name) {
    ([issuer, name] = name.split(':', 2));
  }
  if (issuer && name) {
    return `${issuer} (${name})`;
  }

  return issuer || name;
}

function tokenTypeFromGoogle(str?: string) {
  const strNorm = str?.trim();
  if (strNorm == 'OTP_HOTP') return TokenType.HOTP;
  return TokenType.TOTP;
}

export function importFromGoogleAuthenticator(url: string | URL): TokenInfo[] {
  const uri = url instanceof URL ? url : new URL(url);
  if (uri.protocol !== 'otpauth-migration:' || uri.host !== 'offline') {
    throw Error('Invalid import data URL');
  }
  const encodedData = uri.searchParams.get('data') || '';
  const encodedDataBuffer = Buffer.from(decodeURIComponent(encodedData), 'base64');
  const root = protobuf.Root.fromJSON(googleAuthProto);

  const MigrationPayload = root.lookupType('googleauth.MigrationPayload');

  const message = MigrationPayload.decode(encodedDataBuffer);

  const parsedData = MigrationPayload.toObject(message, {
    longs: String,
    enums: String,
    bytes: String,
  });
  return parsedData.otpParameters.map(
    p =>
      new TokenInfo({
        type: tokenTypeFromGoogle(p.type),
        name: nameFromGoogle(p.issuer, p.name),
        secret: p.secret,
        secretEncoding: TokenSecretEncoding.Base64,
        hashingAlgo: hashingAlgoFromGoogle(p.algorithm),
        length: lengthFromGoogle(p.digits),
        counter: p.counter || DefaultTokenCounter,
      }),
  );
}
