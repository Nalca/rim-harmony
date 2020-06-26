import Vue from 'vue';
import Vuex from 'vuex';
import { AppState } from './state';
import { getters } from './getter';
import { CommitType, MutationsMethods } from './mutation';
import { ModProperties, ConfigProperties, ModsConfig } from "@Common/properties";
import { availableLanguages } from '@/common/translation';

Vue.use(Vuex);
export const store = new Vuex.Store<AppState>({
  state: {
    modList: {
      list: [],
      showOnlyWithIncludedHarmony: false,
      showOnlyWithDifferentHarmony: false,
      showOnlymodFilterByIsUsed: false,
      sortingType: "name",
      searchWord: '',

    },
    config: {
      HARMONY_NAME: '',
      HARMONY_VERSION: '',
      PATH_SEQUENCE_TO_IGNORE: [],
      PATH_SEQUENCE_TO_INCLUDE: [],
      PATH_TO_CHECK: [],
      MODLIST_PATH: "",
      APP_LANGUAGE: 'fr',
    },
    modsConfig: null,
  },
  getters,
  mutations: (() => {
    const mutations: MutationsMethods<AppState> = {
      Update_ModList(state: AppState, newList: ModProperties[]): void {
        state.modList.list = newList;
      },
      Change_ModListParameters(state: AppState, payload) {
        let key: keyof typeof payload;
        for (key of (Object.keys(payload) as (keyof typeof payload)[])) {
          switch (key) {
            case 'showOnlyWithDifferentHarmony':
              state.modList.showOnlyWithDifferentHarmony = !!payload.showOnlyWithDifferentHarmony;
              break;
            case 'showOnlyWithIncludedHarmony':
              state.modList.showOnlyWithIncludedHarmony = !!payload.showOnlyWithIncludedHarmony;
              break;
            case 'showOnlymodFilterByIsUsed':
              state.modList.showOnlymodFilterByIsUsed = !!payload.showOnlymodFilterByIsUsed;
              break;

            case 'searchWord':
              state.modList.searchWord = (payload[key])?.substr(0, 256) || '';
              break;

            case 'sortingType':
              state.modList.sortingType = payload.sortingType || 'name';
              break;

            default:
              console.warn(`Unexpected key for setModListCriteria : ${key}`, payload);
              break;
          }
        }
      },
      Update_AppConfiguration(state: AppState, newConfig: ConfigProperties): void {
        let propName: keyof ConfigProperties;
        for (propName of (Object.getOwnPropertyNames(newConfig) as (typeof propName)[])) {
          if (propName === 'APP_LANGUAGE') {
            let value = newConfig[propName];
            if (!availableLanguages.includes(value)) {
              console.warn(`Unhandled language transmitted to the store : (${value}). Defaulting to 'en'`);
              value = 'en';
            }
            Vue.set(state.config, propName, newConfig[propName]);
          } else {
            Vue.set(state.config, propName, newConfig[propName]);
          }
        }
      },
      Update_ModsConfig(state: AppState, payload: ModsConfig | null): void {
        state.modsConfig = payload;
      }
    };
    return mutations;
  })(),
  strict: true,
});

export default store as StoreType;

/** Le type de store utilisé par l'application, avec un commit 'fixé' */
export type StoreType = Omit<typeof store, 'commit'> & CommitType;
