import compareVersions from 'compare-versions';
import { AppState } from "./state";
import { ModProperties } from "@/common/properties";
import _last from 'lodash/last';

export type Getters = {
  /** La liste des mods filtrées. */
  filteredModList: ModProperties[];
  /** La liste des version Harmony présentes dans la liste des mods. N'utilise pas la liste filtrée. */
  detectedHarmonyVersions: string[];
  /** La dernière version Harmony détectée dans la liste des mods. */
  newestHarmonyVersion: string;
}

/** Le type de l'objet `getter` passé au store */
export type GetterMethods = {
  [P in keyof Getters]: (state: AppState, getter: Getters) => Getters[P];
}

export const getters: GetterMethods = {
  filteredModList(state) {
    let list = state.modList.list.slice();

    // Filtrage par dépendance sur Harmony.
    if (state.modList.showOnlyWithIncludedHarmony) {
      list = list.filter(m => m.harmonyDependancy.length > 0);

      // Filtrage par différence de version Harmony.
      if (state.modList.showOnlyWithDifferentHarmony) {
        const configVersion = state.config.HARMONY_VERSION;
        list = list.filter(m => m.harmonyDependancy.length > 1 || compareVersions(m.harmonyDependancy[0].AssemblyVersion, configVersion) !== 0);
      }
    }

    // Filtrage par mot clé
    if (state.modList.searchWord) {
      // Histoire d'avoir une recherche insensible à la casse.
      const regexp = new RegExp(state.modList.searchWord.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), 'i');
      list = list.filter(m => {
        return regexp.test(m.name);
      });
    }

    // Filtrage par mods actuellement utilisés
    if (state.modList.showOnlymodFilterByIsUsed && state.modsConfig) {
      const arrayUsed = state.modsConfig.activeMods;
      list = list.filter(e => arrayUsed.includes(e.packageId || ''));
    }

    // Triage
    switch (state.modList.sortingType) {
      case 'author':
        list.sort((a, b) => a.author.localeCompare(b.author));
        break;

      case 'harmonyVersion+name':
        // Les plus vieilles version d'abord, puis par ordre alphabétique
        list.sort((a, b) => {
          const versionA = a.harmonyDependancy[0]?.ProductVersion;
          const versionB = b.harmonyDependancy[0]?.ProductVersion;

          if (versionA && versionB) {
            return compareVersions(versionA, versionB);
          } else if (versionA && !versionB) {
            return -1;
          } else if (versionB && !versionA) {
            return 1;
          } else {
            return a.name.localeCompare(b.name);
          }
        });
        break;

      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return list;
  },
  detectedHarmonyVersions(state): string[] {
    const result: string[] = [];

    for (const mod of state.modList.list) {
      for (const hDep of mod.harmonyDependancy) {
        if (result.indexOf(hDep.AssemblyVersion) === -1) {
          result.push(hDep.AssemblyVersion);
        }
      }
    }
    result.sort((a, b) => {
      return compareVersions(a, b);
    });

    return result;
  },
  newestHarmonyVersion(state, getters): string {
    return _last(getters.detectedHarmonyVersions) || '';
  }
};

export default getters;