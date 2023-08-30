import { TokenAutomationFeature } from './token-automation-feature';
import { TokenHashingAlgo } from './token-hashing-algo';
import { TokenLength } from './token-length';
import { TokenSecretEncoding } from './token-secret-encoding';

export class TokenAutomationFeatureSet extends Set<TokenAutomationFeature> {
  get enter() {
    return this.has(TokenAutomationFeature.Enter);
  }
  set enter(v: boolean) {
    if (v) {
      this.add(TokenAutomationFeature.Enter);
    } else {
      this.delete(TokenAutomationFeature.Enter);
    }
  }

  get tab() {
    return this.has(TokenAutomationFeature.Tab);
  }
  set tab(v: boolean) {
    if (v) {
      this.add(TokenAutomationFeature.Tab);
    } else {
      this.delete(TokenAutomationFeature.Tab);
    }
  }

  get slower() {
    return this.has(TokenAutomationFeature.Slower);
  }
  set slower(v: boolean) {
    if (v) {
      this.add(TokenAutomationFeature.Slower);
    } else {
      this.delete(TokenAutomationFeature.Slower);
    }
  }
}

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
  automationFeatures: TokenAutomationFeatureSet = new TokenAutomationFeatureSet();
}
