export function dataToQueryString(data: any) {
  const dataJson = JSON.stringify(data);
  return encodeURIComponent(Buffer.from(dataJson).toString('base64'));
}
