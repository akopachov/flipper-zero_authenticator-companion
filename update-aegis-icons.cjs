const AdmZip = require('adm-zip');
const fs = require('node:fs/promises');

const IconsDirectory = './static/totp-icons';
const IconsCatalogPath = './src/lib/totp-icons/catalog.json';

function mapAegisCatalog(data, tag) {
  return {
    uuid: data.uuid,
    name: data.name,
    version: data.version,
    tag: tag,
    icons: data.icons
      .filter(i => i.filename.includes('1_Primary'))
      .map(m => ({ filename: m.filename.replace('icons/1_Primary/', ''), issuer: m.issuer.map(i => i.toLowerCase()) })),
  };
}

async function main() {
  const latestReleaseResponse = await fetch('https://github.com/aegis-icons/aegis-icons/releases/latest');
  const actualReleaseTag = latestReleaseResponse.url.replace('https://github.com/aegis-icons/aegis-icons/releases/tag/', '');
  let existingCatalogTag = 'N/A';
  try {
    const existingCatalog = require(IconsCatalogPath);
    existingCatalogTag = existingCatalog.tag;
  } catch {
    /* empty */
  }
  if (existingCatalogTag != actualReleaseTag) {
    console.info(`New version of AEGIS icons are available! Existing: ${existingCatalogTag}, New: ${actualReleaseTag}`);
    console.info('Downloading ZIP');
    const catalogZipResponse = await fetch(
      'https://github.com/aegis-icons/aegis-icons/releases/latest/download/aegis-icons.zip',
    );

    const catalogZipBuffer = Buffer.from(await catalogZipResponse.arrayBuffer());
    const catalogZip = new AdmZip(catalogZipBuffer, { readEntries: true });
    await fs.rm(IconsDirectory, { recursive: true, force: true });

    console.info('Extracting icons');
    await fs.mkdir(IconsDirectory, { recursive: true });
    for (let entry of catalogZip.getEntries()) {
      if (entry.entryName.startsWith('icons/1_Primary') || entry.entryName == 'icons/3_Generic/Key.svg') {
        catalogZip.extractEntryTo(entry, IconsDirectory, false, true, false);
      }
    }

    console.info('Building catalog file');
    const rawCatalog = JSON.parse(catalogZip.getEntry('pack.json').getData().toString('utf-8'));
    const filteredCatalog = mapAegisCatalog(rawCatalog, actualReleaseTag);
    await fs.writeFile(IconsCatalogPath, JSON.stringify(filteredCatalog));
    console.log('Done!');
  } else {
    console.info('No new version available');
  }
}

main();
