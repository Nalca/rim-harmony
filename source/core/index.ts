import { app, BrowserWindow } from 'electron';
import ipcService from '@Core/services/ipc';
import * as store from '@/core/services/store';
import dataSvc from '@/core/services/data';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import { name, version } from '@/../package.json';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

function createWindow() {
  // Create the browser window.
  global.mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: `${name} - ${version}`,
    webPreferences: {
      nodeIntegration: true,
    }
  });
  // Open the DevTools.
  global.mainWindow.webContents.openDevTools();

  ipcService.registerEvents();

  // and load the index.html of the app.
  global.mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
}

app.on('ready', async () => {
  store.init();
  dataSvc.loadModData(true); // Préchargement de la liste des mods
  installExtension(VUEJS_DEVTOOLS)
    .then((payload) => console.log('Added Vuejs Devtools', payload))
    .catch((err) => console.log('An error occurred: ', err));
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  app.quit();
});


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.