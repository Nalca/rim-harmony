import { ConfigProperties } from "@/common/properties";
import path from 'path';
import { homedir } from 'os';
import { availableLanguages } from '@Common/translation';


// TODO: Trouver et gérer le chemin sur Windows

/** La configuration par défaut. Enfin des getters pour l'obtenir. */
const value: { [P in keyof ConfigProperties]: () => ConfigProperties[P] } = {
  PATH_SEQUENCE_TO_IGNORE: () => [
    '/v1.0/',
    '/1.0/',
    '/Source/',
    '/source/',
    '/Src/',
    '/src/',
  ],
  PATH_SEQUENCE_TO_INCLUDE: () => [
    '/1.1/',
    '/v1.1/',
  ],
  PATH_TO_CHECK: () => [
    path.join(homedir(), '.steam/steam/steamapps/workshop/content/294100/'),
  ],
  HARMONY_NAME: () => '0Harmony.dll',
  HARMONY_VERSION: () => "2.0.1.0",
  MODLIST_PATH: () =>
    path.join(homedir(), '.config/unity3d/Ludeon Studios/RimWorld by Ludeon Studios/Config/ModsConfig.xml'),
  APP_LANGUAGE: () => {
    let result: string = '';

    if (process.env.LANG) {
      result = process.env.LANG.split('.')[0];
    }
    if (!availableLanguages.includes(result)) {
      console.warn(`Unhandled language detected during initialization: (${value}). Defaulting to 'en'`);
    }
    return result ? result : 'en';
  }
};
export default value;