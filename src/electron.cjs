const windowStateManager = require('electron-window-state');
const { app, BrowserWindow, desktopCapturer } = require('electron');
const serve = require('electron-serve');
const path = require('path');
const Store = require('electron-store');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
const { rpcHandle } = require('./lib/electron-rpc/electron-rpc_main.cjs');

try {
  require('electron-reloader')(module);
} catch (e) {
  /* empty */
}

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

const serveURL = serve({ directory: '.' });
const port = process.env.PORT || 5173;
const dev = !app.isPackaged;
let mainWindow;

function createWindow() {
  let windowState = windowStateManager({
    defaultWidth: 800,
    defaultHeight: 600,
  });

  const mainWindow = new BrowserWindow({
    backgroundColor: 'whitesmoke',
    titleBarStyle: 'default',
    autoHideMenuBar: true,
    webPreferences: {
      enableRemoteModule: true,
      contextIsolation: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      spellcheck: false,
      devTools: dev,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    icon: path.join(__dirname, '../static/icon.png'),
  });

  windowState.manage(mainWindow);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('close', () => {
    windowState.saveState(mainWindow);
  });

  mainWindow.webContents.on('render-process-gone', (_, detailed) => {
    if (detailed.reason === 'crashed') {
      mainWindow.webContents.reload();
    }
  });

  return mainWindow;
}

function loadVite(port) {
  mainWindow.loadURL(`http://localhost:${port}`).catch(e => {
    log.log('Error loading URL, retrying', e);
    setTimeout(() => {
      loadVite(port);
    }, 200);
  });
}

function createMainWindow() {
  mainWindow = createWindow();
  mainWindow.once('close', () => {
    mainWindow = null;
  });

  if (dev) loadVite(port);
  else serveURL(mainWindow);
}

app.once('ready', createMainWindow);
app.on('activate', () => {
  if (!mainWindow) {
    createMainWindow();
  }
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.once('ready', () => autoUpdater.checkForUpdatesAndNotify());

process.on('uncaughtException', err => {
  log.error('Unchaught exception happened', err);
});

rpcHandle(
  () => mainWindow,
  'get-screen-sources',
  async arg => {
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: { width: arg.thumbnailSize, height: arg.thumbnailSize },
    });
    return sources
      .filter(f => !f.thumbnail.isEmpty())
      .map(m => ({ id: m.id, name: m.name, thumbnail: m.thumbnail.toDataURL() }));
  },
);

Store.initRenderer();
