import { parse } from 'papaparse';

export function parseFromString(input: string) {
  const csvLike = input.replace(/^\+[-+]+\+\r?\n?$/gm, '').replace(/(^\|\s*)|(\s*\|$)/gm, '');
  return parse(csvLike, {
    delimiter: '|',
    dynamicTyping: true,
    header: true,
    skipEmptyLines: true,
    quoteChar: '',
    escapeChar: '',
    transformHeader: header => header.trim(),
    transform: value => value.trim(),
  }).data;
}
