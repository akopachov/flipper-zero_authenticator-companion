const { ipcMain } = require('electron');

module.exports.rpcHandle = function (mainWindowProvider, name, handler) {
  ipcMain.on(name, async (_, request) => {
    const result = await handler(request.arg);
    mainWindowProvider().webContents.send(`${name}:done`, { requestId: request.requestId, result });
  });
};
