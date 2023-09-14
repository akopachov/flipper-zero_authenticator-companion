export function decodeDataFromQueryString(encodedData: string) {
  const tokensParsedJson = Buffer.from(decodeURIComponent(encodedData || ''), 'base64').toString();
  return JSON.parse(tokensParsedJson);
}
