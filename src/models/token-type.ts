export enum TokenType {
  TOTP = 'totp',
  HOTP = 'hotp',
}

export function tokenTypeFromString(str?: string) {
  const strNorm = str?.toLowerCase()?.trim();
  if (strNorm == TokenType.HOTP) return TokenType.HOTP;
  return TokenType.TOTP;
}
