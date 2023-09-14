import protobuf from 'protobufjs';
import googleAuthProto from './google-auth.proto.json';
import { TokenInfo } from '$models/token-info';
import { TokenSecretEncoding } from '$models/token-secret-encoding';
import { TokenHashingAlgo } from '$models/token-hashing-algo';
import { TokenLength } from '$models/token-length';

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

function nameFromGoogle(googleName: string): string {
  const [issuer, account] = googleName.split(':', 2);
  if (issuer && account) {
    return `${issuer} (${account})`;
  }

  return googleName;
}

export function importFromGoogleAuthenticator(url: string | URL): TokenInfo[] {
  const uri = url instanceof URL ? url : new URL(url);
  if (uri.protocol !== 'otpauth-migration:' || uri.pathname !== '//offline') {
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
  return parsedData.otpParameters
    .filter(p => p.type === 'OTP_TOTP')
    .map(
      p =>
        new TokenInfo({
          name: nameFromGoogle(p.name),
          secret: p.secret,
          secretEncoding: TokenSecretEncoding.Base64,
          hashingAlgo: hashingAlgoFromGoogle(p.algorithm),
          length: lengthFromGoogle(p.digits),
        }),
    );
}
