/* eslint-disable no-unused-vars */
function query (data) {
  return {
    uuid: data.uuid,
    name: data.name,
    version: data.version,
    icons: data.icons
      .filter(i => i.filename.includes('1_Primary'))
      .map(m => ({ filename: m.filename.replace('icons/1_Primary/', ''), issuer: m.issuer.map(i => i.toLowerCase()) })),
  };
}
