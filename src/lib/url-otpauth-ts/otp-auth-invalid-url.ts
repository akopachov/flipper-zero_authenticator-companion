import { ErrorType } from './error-type';

export class OtpAuthInvalidUrl extends Error {
  constructor(errorType: ErrorType) {
    super();
    this.name = 'OtpauthInvalidURL';
    this.message = `Given otpauth:// URL is invalid. (Error ${ErrorType[errorType]})`;
  }
}
