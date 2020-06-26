import ElectronStore from 'electron-store';
import { schema } from './schema';
import { ConfigProperties } from '@Common/properties';
import defaultConfig from './default';

/** Le store de la partie Core. Gère le stockage lui même. */
const store: ElectronStore = new ElectronStore({
  name: 'harmony-looker',
  schema,
});

/** Le chemin des différentes variables stockées dans ce store.*/
export enum ConfigKeys {
  ALL = 'config',
  /** Les chemins à exclure du resultat, lors de la recherche des DLLs */
  PATH_SEQUENCE_TO_IGNORE = 'config.PATH_SEQUENCE_TO_IGNORE',
  /** Les chemins devant être inclus dans le résultat, lors de la recherche des DLLs */
  PATH_SEQUENCE_TO_INCLUDE = 'config.PATH_SEQUENCE_TO_INCLUDE',
  /** Les dossiers contenant des mods Rimworlds. */
  PATH_TO_CHECK = 'config.PATH_TO_CHECK',
  /** Le nom de la dll Harmony. */
  HARMONY_NAME = 'config.HARMONY_NAME',
  /** La version de la dll Harmony. */
  HARMONY_VERSION = 'config.HARMONY_VERSION',
  /** Le chemin vers le fichier ModsList.xml */
  MODLIST_PATH = "config.MODLIST_PATH",
  /** Le langage de l'application. */
  APP_LANGUAGE = "config.APP_LANGUAGE"
}

/** Initialise le store si il était vide. */
export function init(): void {
  for (const prop of (Object.keys(defaultConfig) as Array<keyof typeof defaultConfig>)) {
    const key = `${ConfigKeys.ALL}.${prop}`;
    if (!store.has(key)) {
      store.set(key, defaultConfig[prop]());
    }
  }
}

export function get(key: ConfigKeys.ALL): ConfigProperties;
export function get(key: ConfigKeys.HARMONY_NAME | ConfigKeys.HARMONY_VERSION | ConfigKeys.APP_LANGUAGE): string;
export function get(key: ConfigKeys.PATH_SEQUENCE_TO_IGNORE | ConfigKeys.PATH_SEQUENCE_TO_INCLUDE | ConfigKeys.PATH_TO_CHECK): string[];

/** Retourne une valeur du store.
 *  @param key La clé / Le chemin vers la variable.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function get(key: ConfigKeys) {
  return store.get(key);
}

/** Modifie une valeur du store **config**.
 *  @param payload Les nouvelles valeurs de la configuration.
 */
export function setConfig(payload: Partial<ConfigProperties>): void {
  type KeyofPayload = keyof typeof payload;

  let prop: KeyofPayload;
  for (prop of (Object.keys(payload) as KeyofPayload[])) {
    store.set(`config.${prop}`, payload[prop]);
  }
}

/** Permet l'accès / la modification aux valeurs du store directement, sans passer par les fonctions du store. */
const exportation = (function () {
  type DefinedConfigProperties = {
    [K in keyof ConfigProperties]: {
      enumerable: true;
      get: () => ConfigProperties[K];
      set: (newValue: ConfigProperties[K]) => void;
    };
  }

  // TODO: Simplifier cette chose
  const props: DefinedConfigProperties = {
    PATH_SEQUENCE_TO_IGNORE: {
      enumerable: true,
      get: () => store.get(ConfigKeys.PATH_SEQUENCE_TO_IGNORE),
      set: (newValue) => store.set(ConfigKeys.PATH_SEQUENCE_TO_IGNORE, newValue),
    },
    PATH_SEQUENCE_TO_INCLUDE: {
      enumerable: true,
      get: () => store.get(ConfigKeys.PATH_SEQUENCE_TO_INCLUDE),
      set: (newValue) => store.set(ConfigKeys.PATH_SEQUENCE_TO_INCLUDE, newValue),
    },
    PATH_TO_CHECK: {
      enumerable: true,
      get: () => store.get(ConfigKeys.PATH_TO_CHECK),
      set: (newValue) => store.set(ConfigKeys.PATH_TO_CHECK, newValue),
    },
    HARMONY_NAME: {
      enumerable: true,
      get: () => store.get(ConfigKeys.HARMONY_NAME),
      set: (newValue) => store.set(ConfigKeys.HARMONY_NAME, newValue),
    },
    HARMONY_VERSION: {
      enumerable: true,
      get: () => store.get(ConfigKeys.HARMONY_VERSION),
      set: (newValue) => store.set(ConfigKeys.HARMONY_VERSION, newValue),
    },
    MODLIST_PATH: {
      enumerable: true,
      get: () => store.get(ConfigKeys.MODLIST_PATH),
      set: (newValue) => store.set(ConfigKeys.MODLIST_PATH, newValue),
    },
    APP_LANGUAGE: {
      enumerable: true,
      get: () => store.get(ConfigKeys.APP_LANGUAGE),
      set: (newValue) => store.set(ConfigKeys.APP_LANGUAGE, newValue),
    },
  };
  return Object.defineProperties({
  }, props) as ConfigProperties;
})();

export default exportation;
