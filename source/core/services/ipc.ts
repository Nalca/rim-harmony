import * as EC from '@Common/events';
import * as store  from './store';
import { ipcMain, shell, dialog } from 'electron';
import serviceData from './data';
import { promises as fs, constants } from 'fs';
import { getModsConfig } from '@/core/services/mod-config';

const ipcHandler: EC.IpcHandlerAsyncCore & EC.IpcHandlerSyncCore = {
  async GetConfig() {
    return store.get(store.ConfigKeys.ALL);
  },
  async GetModsList() {
    return await serviceData.loadModData();
  },
  async GetModsConfig() {
    return await getModsConfig();
  },
  async OpenUrl(event, payload): Promise<void> {
    if (payload.url) {
      shell.openExternal(payload.url);
    }
    if (payload.path) {
      shell.openPath(payload.path);
    }
  },
  async CheckPath(evt, payload) {
    const prom: Promise<EC.TypeParameters.CheckPathView>[] = payload.map(async e => {
      const ret: EC.TypeParameters.CheckPathView = { accessible: false, path: e.path };
      try {
        if (!e.path) {
          ret.accessible = false;
        } else {
          await fs.access(e.path, constants.R_OK);
          ret.accessible = true;
        }
      }
      catch (error) {
        // Le fichier n'existe pas.
        ret.accessible = false;
      }
      return ret;
    });
    return Promise.all(prom);
  },
  async UpdateConfig(event, payload) {
    store.setConfig(payload);
    return store.get(store.ConfigKeys.ALL);
  },
  LookForFile(event, { defaultPath, type }) {
    return dialog.showOpenDialogSync(global.mainWindow, {
      defaultPath: defaultPath,
      properties: [
        "openDirectory",
      ]
    }) || [];
  },
};



export function registerEvents(): void {
  let prop: keyof typeof EC.Events;
  for (prop of (Object.getOwnPropertyNames(EC.Events) as (keyof typeof EC.Events)[])) {

    if (prop in EC.Synchrone.Events) {
      ipcMain.on(EC.Events[prop], (e, payload) => {
        e.returnValue = ipcHandler[prop as EC.Synchrone.Events](e, payload);
      });
    }
    else if (prop in EC.Asynchrone.Events) {
      ipcMain.handle(EC.Events[prop], ipcHandler[prop as EC.Asynchrone.Events]);
    }
    else {
      // Should never happen
      throw new Error(`Unhandled event type : ${prop}`);
    }
  }
}

export default {
  registerEvents,
};