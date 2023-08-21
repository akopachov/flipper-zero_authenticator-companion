import type { TokenAutomationFeature } from './token-automation-feature';
import { TokenHashingAlgo } from './token-hashing-algo';
import { TokenLength } from './token-length';
import { TokenSecretEncoding } from './token-secret-encoding';

export class TokenInfoBase {
  constructor(initial?: Partial<TokenInfoBase>) {
    Object.assign(this, initial);
  }

  id: number = 0;
  name: string = '';
  hashingAlgo: TokenHashingAlgo = TokenHashingAlgo.Sha1;
  length: TokenLength = TokenLength.SixDigits;
  duration: number = 30;
}

export class TokenInfo extends TokenInfoBase {
  constructor(initial?: Partial<TokenInfo>) {
    super(initial);
    Object.assign(this, initial);
  }

  secret: string = '';
  secretEncoding: TokenSecretEncoding = TokenSecretEncoding.Base32;
  automationFeatures: TokenAutomationFeature[] = [];
}
