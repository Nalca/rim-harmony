import { ModProperties, ConfigProperties, ModsConfig } from "@Common/properties";

export interface AppState {
  /** Object about the list of mods, and its configuration. */
  modList: {
    /** List of loaded mods by the application. */
    list: ModProperties[];
    /** Show only the mods that include Harmony. */
    showOnlyWithIncludedHarmony: boolean;
    /** Ne montre que les mods qui ont une version différent d'harmony de celle
     *  de la configuration. Dépend de *showOnlyWithIncludedHarmony* */
    showOnlyWithDifferentHarmony: boolean;
    showOnlymodFilterByIsUsed: boolean;
    /** Le mot clé de recherche. Si vide, aucun filtrage n'est effectué. */
    searchWord: string;
    /** Le type de tri. */
    sortingType: AppState.modList.sortingType;
  };
  modsConfig: ModsConfig | null;
  config: ConfigProperties;
}

export namespace AppState {
  export namespace modList {
    /** Les différents type de tri existant. */
    export type sortingType = 'name' | 'harmonyVersion+name' | 'author'
  }
}

export default AppState;