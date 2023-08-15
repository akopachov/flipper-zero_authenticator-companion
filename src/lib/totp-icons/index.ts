import catalog from './catalog.json';

export function findIcon(name: string) {
  const iconMeta = catalog.icons.find(p => p.issuer.some(i => i == name || name.includes(i)));
  return iconMeta?.filename;
}
