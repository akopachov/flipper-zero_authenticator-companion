export enum TokenLength {
  FiveDigits = '5',
  SixDigits = '6',
  EightDigits = '8',
}

export function tokenLengthFromNumber(num: number) {
  if (num == 5) return TokenLength.FiveDigits;
  if (num == 8) return TokenLength.EightDigits;
  return TokenLength.SixDigits;
}
