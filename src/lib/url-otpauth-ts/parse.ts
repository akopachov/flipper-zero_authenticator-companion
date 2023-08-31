// Forked from https://github.com/huihuimoe/url-otpauth-ng
// Updated to add Steam support

import { ErrorType } from './error-type';
import { OtpAuthInvalidUrl } from './otp-auth-invalid-url';

const PossibleType = <const>['totp', 'hotp', 'yaotp'];
const PossibleDigits = <const>[5, 6, 8];
const PossibleAlgorithms = <const>['SHA1', 'SHA256', 'SHA512', 'Steam'];

const isInArray = <T, A extends T>(item: T, array: ReadonlyArray<A>): item is A => array.includes(item as A);

export type OtpUrlParseResult = {
  type: (typeof PossibleType)[number];
  account: string;
  key: string;
  issuer: string;
  digits: (typeof PossibleDigits)[number];
  algorithm: (typeof PossibleAlgorithms)[number];
  period: number;
  counter?: number;
};

const DefaultOtpValue: Pick<OtpUrlParseResult, 'digits' | 'algorithm' | 'period'> = {
  digits: 6,
  algorithm: 'SHA1',
  period: 30,
};

/**
 * Parses an OTPAuth URI.
 *
 * Parses an URL as described in Google Authenticator's "KeyUriFormat" document (see:
 * [https://github.com/google/google-authenticator/wiki/Key-Uri-Format](https://github.com/google/google-authenticator/wiki/Key-Uri-Format))
 * and returns an object that contains the following properties:
 *
 **/
export function parse(rawUrl: string | URL): OtpUrlParseResult {
  const decode = decodeURIComponent;

  const parsedOtpValues: Partial<OtpUrlParseResult> = {};

  let parsed = new URL(rawUrl);

  if (parsed.protocol !== 'otpauth:') {
    throw new OtpAuthInvalidUrl(ErrorType.InvalidProtocol);
  }

  // hack for Chrome
  parsed.protocol = 'ftp';
  parsed = new URL(parsed);

  const otpAlgo = decode(parsed.host);

  if (!isInArray(otpAlgo, PossibleType)) {
    throw new OtpAuthInvalidUrl(ErrorType.UnknownOtp);
  }

  parsedOtpValues.type = otpAlgo;

  //
  // Label (contains account name, may contain issuer)
  //

  const label = parsed.pathname.substring(1);
  // if you want to support mutli commas in label
  // const labelComponents = label.split(~label.indexOf(':') ? /:(.*)/ : /%3A(.*)/, 2)
  const labelComponents = label.split(~label.indexOf(':') ? ':' : '%3A');
  let issuer = '';
  let account = '';

  if (labelComponents.length === 1) {
    account = decode(labelComponents[0]);
  } else if (labelComponents.length === 2) {
    issuer = decode(labelComponents[0]);
    account = decode(labelComponents[1]);
  } else {
    throw new OtpAuthInvalidUrl(ErrorType.InvalidLabel);
  }

  if (account.length < 1) {
    throw new OtpAuthInvalidUrl(ErrorType.MissingAccountName);
  }

  if (labelComponents.length === 2 && issuer.length < 1) {
    throw new OtpAuthInvalidUrl(ErrorType.InvalidIssuer);
  }

  parsedOtpValues.account = account;

  const parameters = parsed.searchParams;

  // Secret key
  if (!parameters.has('secret')) {
    throw new OtpAuthInvalidUrl(ErrorType.MissingSecretKey);
  }

  parsedOtpValues.key = parameters.get('secret')!;

  // Issuer
  if (parameters.has('issuer') && issuer && parameters.get('issuer') !== issuer && issuer !== 'steamctl') {
    // If present, it must be equal to the "issuer" specified in the label.
    // Exception - steamctl
    throw new OtpAuthInvalidUrl(ErrorType.InvalidIssuer);
  }

  parsedOtpValues.issuer = parameters.get('issuer') || issuer;

  // OTP digits
  if (parameters.has('digits')) {
    const parsedDigits = parseInt(parameters.get('digits')!) || 0;
    if (isInArray(parsedDigits, PossibleDigits)) {
      parsedOtpValues.digits = parsedDigits;
    } else {
      throw new OtpAuthInvalidUrl(ErrorType.InvalidDigits);
    }
  }

  // Algorithm to create hash
  if (parameters.has('algorithm')) {
    const algo = parameters.get('algorithm')!;
    if (isInArray(algo, PossibleAlgorithms)) {
      // Optional 'algorithm' parameter.
      parsedOtpValues.algorithm = algo;
    } else {
      throw new OtpAuthInvalidUrl(ErrorType.UnknownAlgorithm);
    }
  } else if (issuer === 'steamctl') {
    parsedOtpValues.algorithm = 'Steam';
  }

  // Period (only for TOTP)
  if (otpAlgo === 'totp') {
    // Optional 'period' parameter for TOTP.
    if (parameters.has('period')) {
      parsedOtpValues.period = parseInt(parameters.get('period')!) || 0;
    }
  }

  // Counter (only for HOTP)
  if (otpAlgo === 'hotp') {
    if (parameters.has('counter')) {
      parsedOtpValues.counter = parseInt(parameters.get('counter')!) || 0;
    } else {
      // We require the 'counter' parameter for HOTP.
      throw new OtpAuthInvalidUrl(ErrorType.MissingCounter);
    }
  }

  return { ...DefaultOtpValue, ...parsedOtpValues } as OtpUrlParseResult;
}
