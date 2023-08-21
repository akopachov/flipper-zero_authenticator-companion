export enum TokenLength {
  SixDigits = '6',
  EightDigits = '8',
}

export function tokenLengthFromNumber(num: number) {
  if (num == 8) return TokenLength.EightDigits;
  return TokenLength.SixDigits;
}
