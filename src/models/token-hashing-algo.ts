export enum TokenHashingAlgo {
  Sha1 = 'sha1',
  Sha256 = 'sha256',
  Sha512 = 'sha512',
  Steam = 'steam',
}

export function tokenHashingAlgoFromString(str?: string) {
  const strNorm = str?.toLowerCase()?.trim();
  if (strNorm == TokenHashingAlgo.Steam) return TokenHashingAlgo.Steam;
  if (strNorm == TokenHashingAlgo.Sha256) return TokenHashingAlgo.Sha256;
  if (strNorm == TokenHashingAlgo.Sha512) return TokenHashingAlgo.Sha512;
  return TokenHashingAlgo.Sha1;
}
