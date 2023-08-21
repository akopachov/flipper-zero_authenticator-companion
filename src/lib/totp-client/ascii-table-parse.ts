import { parse } from 'papaparse';

export function parseFromString(input: string): { [key: string]: string }[] {
  const csvLike = input.replace(/^\+[-+]+\+\r?\n?$/gm, '').replace(/(^\|\s*)|(\s*\|$)/gm, '');
  return parse<{ [key: string]: string }>(csvLike, {
    dynamicTyping: false,
    header: true,
    skipEmptyLines: true,
    quoteChar: '',
    escapeChar: '',
    transformHeader: header => header.trim(),
    transform: value => value.trim(),
  }).data;
}
