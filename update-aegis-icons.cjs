const AdmZip = require('adm-zip');
const argv = require('yargs/yargs')(process.argv.slice(2)).argv;
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
  const release = argv.release || 'latest';
  const ref = argv.ref;
  let actualTag;
  let downloadUrl;

  if (ref) {
    const refState = await fetch(`https://api.github.com/repos/aegis-icons/aegis-icons/git/${ref}`).then(r => r.json());
    actualTag = refState.object.sha;
    downloadUrl = `https://api.github.com/repos/aegis-icons/aegis-icons/zipball/${ref}`;
  } else {
    const latestReleaseResponse = await fetch(
      `https://api.github.com/repos/aegis-icons/aegis-icons/releases/${release}`,
    ).then(r => r.json());
    actualTag = latestReleaseResponse.tag_name;
    downloadUrl = latestReleaseResponse.assets[0].browser_download_url;
  }

  let existingCatalogTag = 'N/A';
  try {
    const existingCatalog = require(IconsCatalogPath);
    existingCatalogTag = existingCatalog.tag;
  } catch {
    /* empty */
  }

  if (existingCatalogTag != actualTag) {
    console.info(`New version of AEGIS icons are available! Existing: ${existingCatalogTag}, New: ${actualTag}`);
    console.info('Downloading ZIP');
    const catalogZipResponse = await fetch(downloadUrl);

    const catalogZipBuffer = Buffer.from(await catalogZipResponse.arrayBuffer());
    const catalogZip = new AdmZip(catalogZipBuffer, { readEntries: true });
    await fs.rm(IconsDirectory, { recursive: true, force: true });

    console.info('Extracting icons');
    await fs.mkdir(IconsDirectory, { recursive: true });
    const includePathRegex = /^(aegis-icons-aegis-icons-\w+\/)?icons\/(1_Primary|3_Generic\/Key.svg$)/gi;
    const packEntryRegex = /^(aegis-icons-aegis-icons-\w+\/)?pack\.json$/gi;
    let packEntry;
    for (let entry of catalogZip.getEntries()) {
      if (includePathRegex.test(entry.entryName)) {
        catalogZip.extractEntryTo(entry, IconsDirectory, false, true, false);
      } else if (packEntryRegex.test(entry.entryName)) {
        packEntry = entry;
      }
    }

    console.info('Building catalog file');
    const rawCatalog = JSON.parse(packEntry.getData().toString('utf-8'));
    const filteredCatalog = mapAegisCatalog(rawCatalog, actualTag);
    await fs.writeFile(IconsCatalogPath, JSON.stringify(filteredCatalog));
    console.log('Done!');
  } else {
    console.info('No new version available');
  }
}

main();
