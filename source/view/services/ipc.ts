import { ipcRenderer } from 'electron';
import { Events, PayloadCore, PayloadView, Asynchrone, Synchrone } from '@Common/events';
import store from '@/view/store/store';
import { ConfigProperties } from '@/common/properties';

/** Utilise le service IPC de façon asynchrone, via les promesses. */
function AsyncCall(evt: Asynchrone.Events, payload?: any): Promise<any> {
  return ipcRenderer.invoke(evt, payload);
}
/** Utilise le service IPC de façon synchrone. L'interface est bloquée en attendant la réponse. */
function SyncCall(evt: Synchrone.Events, payload?: any): any {
  return ipcRenderer.sendSync(evt, payload);
}

/** Demande au process Node d'envoyer la liste des mods. */
export async function requestDataModDataGet(): Promise<void> {
  const modList: PayloadView<'GetModsList'> = await AsyncCall(Events.GetModsList);
  if (!Array.isArray(modList)) {
    throw new Error('Expected an array, got something else.');
  }
  modList.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
  store.commit('Update_ModList', modList);
}

/** Demande au process node d'envoyer la configuration de l'application. (Utilisée des deux cotés.) */
export async function requestConfigGet(): Promise<void> {
  const config: PayloadView<'GetConfig'> = await AsyncCall(Events.GetConfig);
  store.commit('Update_AppConfiguration', config);
}

/** Demande au process node d'ouvrir une URL. */
export function urlOpen(url: string): Promise<void> {
  return AsyncCall(Events.OpenUrl, { url });
}

/** Demande au process node d'ouvrir un chemin dans l'explorateur. */
export function pathOpen(path: string): Promise<void> {
  return AsyncCall(Events.OpenUrl, { path });
}

/** Demande au process node de chercher / retourner un ou plusieurs fichiers.
 *  @return La liste des chemins. Vide si aucun.
*/
export function lookForFile(payload: PayloadCore<'LookForFile'>): string[] {
  const result =  SyncCall(Events.LookForFile, payload);
  if (result && Array.isArray(result) && result.every(s => typeof s === 'string')) {
    return result;
  }
  return [];
}

/** Demande au process node de vérifier si un chemin est valide (Le fichier / dossier existe ET est accessible en lecture)
 *  @param payload Un array de chemin à vérifier, sous un format spécifique.
 *  @return Les liste des chemin vérifiés, sous un format spécifique.
 */
export function checkPath(payload: PayloadCore<'CheckPath'>): Promise<PayloadView<'CheckPath'>> {
  return AsyncCall(Events.CheckPath, payload);
}

/** Demande au processus node de récupérer et envoyer le fichier *ModsConfig.xml*
 *  Puis le stocke dans le store.
 */
export async function getModsConfig(): Promise<void> {
  store.commit('Update_ModsConfig', await AsyncCall(Events.GetModsConfig));
}

/** Sauvegarde, puis met à jour la configuration de l'application.
 *  @param payload La nouvelle configuration.
 */
export async function saveNewConfig(payload: PayloadCore<'UpdateConfig'>): Promise<void> {
  const result: ConfigProperties = await AsyncCall(Events.UpdateConfig, payload);
  store.commit('Update_AppConfiguration', result);
}

export default {
  checkPath,
  getModsConfig,
  lookForFile,
  pathOpen,
  requestConfigGet,
  requestDataModDataGet,
  saveNewConfig,
  urlOpen,
};
