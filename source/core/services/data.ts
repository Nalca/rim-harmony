import store from './store';
import { Mod } from '@Core/mod-loader';

const modData = {
  list: [] as Mod[],
  lastUpdate: null as null | number,
};

/** Charge (ou retourne la dernière liste chargée) la liste des mods présents dans
 *  les répertoires à vérifier.
 *  @param force Si true, la liste des mods mise en cache sera vidée.
 */
export async function loadModData(force: boolean = false): Promise<Mod[]> {
  if (modData.list.length > 0 && !force) {
    return modData.list.slice(0);
  }

  modData.list = [];
  modData.lastUpdate = null;

  // On récupère tous les potentiels dossiers de mods.
  for (const path of store.PATH_TO_CHECK) {
    modData.list.push(...await Mod.AnalyzeFolder(path));
  }
  // Puis on récupère toutes les DLLs harmony.
  await Mod.checkHarmonyDLL(modData.list);
  modData.lastUpdate = Date.now();
  return modData.list.slice();
}

export default {
  loadModData,
};