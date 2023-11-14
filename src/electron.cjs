const windowStateManager = require('electron-window-state');
const { app, BrowserWindow, desktopCapturer, nativeTheme, shell } = require('electron');
const serve = require('electron-serve');
const path = require('path');
const Store = require('electron-store');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
const { MainMessageHub } = require('simple-electron-ipc');

const ExternalLinkSchemaSuffix = 'external-';

try {
  require('electron-reloader')(module);
} catch (e) {
  /* empty */
}

const mainMessageHub = new MainMessageHub();
const store = new Store();

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
nativeTheme.themeSource = store.get('theme.colorScheme', 'system');

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

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(ExternalLinkSchemaSuffix)) {
      shell.openExternal(url.substring(ExternalLinkSchemaSuffix.length));
      return { action: 'deny' };
    }

    return { action: 'allow' };
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

mainMessageHub.on('*', {
  getScreenSources: async thumbnailSize => {
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: { width: thumbnailSize, height: thumbnailSize },
    });
    return sources
      .filter(f => !f.thumbnail.isEmpty())
      .map(m => ({ id: m.id, name: m.name, thumbnail: m.thumbnail.toDataURL() }));
  },
  setNativeTheme: async theme => {
    nativeTheme.themeSource = theme;
  },
});
