import { promises as fs } from 'fs';
import store from './store';
import xml2js from 'xml2js';
import { ModsConfig } from '@/common/properties';

interface ModsConfigXMLFormat {
  ModsConfigData: {
    version: string[];
    activeMods: Array<{
      li: string[];
    }>;
    knownExpansions: Array<{
      li: string[];
    }>;
  };
}

export async function openFile(): Promise<ModsConfigXMLFormat | null> {
  try {
    const data = await fs.readFile(store.MODLIST_PATH);
    const parsedXML = await xml2js.parseStringPromise(data) as ModsConfigXMLFormat;
    return parsedXML;
  }
  catch (err) {
    console.error(err);
    return null;
  }
}

export async function getModsConfig(): Promise<ModsConfig | null> {
  const file = await openFile();
  if (!file) {
    return null;
  }
  const result: ModsConfig = {
    version: file.ModsConfigData.version.join(' | '),
    activeMods: file.ModsConfigData.activeMods[0].li.slice(),
    knownExpansions: file.ModsConfigData.knownExpansions[0].li.slice(),
  };
  return result;
}

export default {
  openFile,
  getModsConfig,
};
