import { ModProperties, ConfigProperties, ModsConfig } from '@Common/properties';
import { AppState } from './state';

type ModListCriteria = Partial<Omit<AppState['modList'], 'list'>>;

export type Mutations = {
  /** IPC uniquement.
   *  Met à jour la liste des mods.
   */
  Update_ModList(newList: ModProperties[]): void;
  /** Change les paramètres de filtrage / triage de la liste de mods. */
  Change_ModListParameters(payload: ModListCriteria): void;
  /** IPC uniquement.
   *  Met à jour la configuration de la page web.
   */
  Update_AppConfiguration(newConfig: ConfigProperties): void;
  /** IPC Uniquement.
   *  Met à jour la partie *modsConfig* du store.
   */
  Update_ModsConfig(payload: ModsConfig | null): void;
}

export type MutationsMethods<S> = {
  [P in keyof Mutations]: (state: S, payload: Parameters<Mutations[P]>[0]) => void;
};

/** Une sorcellerie typescript permettant d'avoir la méthode commit avec les bons paramètres/types.
 *  Pose problème (Mais marche) dans un fichier .ts
 */
export type CommitType = {
  commit<T extends MutationsMethods<unknown>, K extends keyof T>(type: K, value: Parameters<T[K]>[1]): void;
}
