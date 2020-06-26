import path from 'path';

/** Les propriétés d'une DLL  */
export abstract class ExifProperties {
  abstract readonly AssemblyComments: string; // Comments
  abstract readonly AssemblyVersion: string;
  abstract readonly CompanyName: string;
  abstract readonly Directory: string;
  abstract readonly FileDescription: string;
  abstract readonly FileName: string;
  abstract readonly InternalName: string;
  abstract readonly ProductVersion: string;
  abstract readonly SourceFile: string;
  abstract readonly IsValid: boolean = true;
}

export interface ModDependencies {
  packageId: string;
  displayName: string;
}
/** Les propriétés d'un objet de type Mod, qui contient les informations à propos d'un Mod */
export abstract class ModProperties {
  /** Le chemin vers le dossier du mod. */
  abstract readonly rootPath: string;
  /** Le nom du mod. */
  abstract readonly name: string;
  /** Le nom de l'auteur du mod. */
  abstract readonly author: string;
  abstract readonly description: string;
  abstract readonly packageId?: string;
  /** Les dépendances sur d'autres mods. */
  abstract readonly modDependencies: ModDependencies[];
  abstract readonly supportedVersions: string[] = [];
  abstract readonly url: string;
  /** Un uuid propre à l'application. Permet d'identifier de façon unique un mod dans l'application */
  abstract readonly uuid: string;
  abstract harmonyDependancy: ExifProperties[] = [];

  /* Retourne l'id du workshop steam, si le mod a été trouvé dans le workshop steam */
  static GetSteamWorkshopId(mod: ModProperties): string {
    const rootPath = path.resolve(mod.rootPath);

    // Linux only ?
    const steamId = /workshop\/content\/294100\/([0-9]+)$/.exec(rootPath);
    if (steamId) {
      return steamId[1];
    }
    return '';
  }
}

/** Les propriétés de la configuration de l'application. */
export interface ConfigProperties {
  /** La liste des chemins à exclure, pour ne pas sortir de vieille versions */
  PATH_SEQUENCE_TO_IGNORE: readonly string[];
  /** La liste des chemins à garder exclusivement, à l'exclusion de tous les autres. */
  PATH_SEQUENCE_TO_INCLUDE: readonly string[];
  /** La liste des chemins vers le dossier contenant les mods. */
  PATH_TO_CHECK: readonly string[];
  /** Le nom de la dll Harmony. */
  HARMONY_NAME: string;
  /** La version 'correcte' de Harmony.  */
  HARMONY_VERSION: string;
  /** Le chemin vers la liste des mods chargés par le jeu. */
  MODLIST_PATH: string;
  /** La langue de l'application */
  APP_LANGUAGE: string;
}

/** Le contenu du fichier **ModsConfigs.xml** */
export interface ModsConfig {
  version: string;
  activeMods: string[];
  knownExpansions: string[];
}