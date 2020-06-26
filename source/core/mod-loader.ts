import { AppExifError, ExifData, readDLL } from '@Core/exif-loader';
import fileFinder from '@Core/file-finder';
import store from '@/core/services/store';
import { promises as fs } from 'fs';
import xml2js from 'xml2js';
import { v1 as uuid } from 'uuid';
import { ModProperties, ModDependencies } from '@/common/properties';
import path from 'path';

interface AboutXMLFormat {
  ModMetaData: {
    author: string[];
    description: string[];
    name: string[];
    packageId?: string[];
    supportedVersions?: Array<{
      li: string[];
    }>;
    modDependencies?: Array<{
      li: Array<Partial<ModDependencies>>;
    }>;
    url?: string[];
  };
}

/** Retourne la valeur trouvée sur un objet en suivant le chemin passé en paramètre
 *  @example get(ModMetaData, 'modDependencies[0].li')
 *  @param target L'objet à parcourir
 *  @param path Le chemin vers l'objet. Accepte les '.' et '[5]'.
 */
function get(target: Record<string, unknown>, path: string): any {
  const decryptedPath = path.replace(/\[([0-9]+)\]/g, ' $1 ').replace(/\./g, ' . ').split(' ').filter(s => !!s);
  let result: any = target[decryptedPath[0]];
  for (let i = 1; i < decryptedPath.length; i++) {
    const currentPath = decryptedPath[i];
    if (!result || typeof result !== 'object') {
      return undefined;
    }

    if (currentPath === '.') {
      result = result[decryptedPath[i + 1]];
      i++;
    } else {
      result = result[currentPath];
    }
  }
  return result;
}

export class Mod implements ModProperties {
  rootPath: string;
  name: string;
  author: string;
  description: string;
  packageId?: string | undefined;
  supportedVersions: string[] = [];
  url: string;
  uuid: string;
  harmonyDependancy: ExifData[] = [];
  modDependencies: ModDependencies[] = [];

  constructor(modPath: string, { ModMetaData }: AboutXMLFormat) {
    this.uuid = uuid();
    this.rootPath = path.resolve(modPath);
    this.name = ModMetaData.name[0];
    this.author = ModMetaData.author[0];
    this.description = ModMetaData.description[0];
    this.packageId = (ModMetaData.packageId || [])[0];
    if (ModMetaData.supportedVersions) {
      this.supportedVersions = ModMetaData.supportedVersions[0].li.slice();
    }
    this.url = (ModMetaData.url || [])[0] || "";
    const modDependencies = get(ModMetaData, 'modDependencies[0].li') as any[];
    if (Array.isArray(modDependencies) && modDependencies.length > 0) {
      for (const modDep of modDependencies) {
        this.modDependencies.push({
          displayName: modDep.packageId || '',
          packageId: modDep.displayName || '',
        });
      }
    }
  }


  /** Est-ce que le mod est valide ? Il doit avoir un nom et un répertoire racine valide. */
  public get isValid(): boolean {
    return !!this.name && !!this.rootPath;
  }

  public static async checkHarmonyDLL(mod: Mod[]): Promise<void> {
    const result: Promise<void>[] = [];
    for (const m of mod) {
      result.push(m.checkHarmonyDLL());
    }
    await Promise.all(result);
  }
  private async checkHarmonyDLL(): Promise<void> {
    const pathsToDLL = await fileFinder.findDLL(this.rootPath, {
      filter: (p) => p.endsWith(store.HARMONY_NAME)
        && (!store.PATH_SEQUENCE_TO_IGNORE.some(str => p.includes(str)))
        && store.PATH_SEQUENCE_TO_INCLUDE.some(str => p.includes(str))
    });

    if (!pathsToDLL.length) {
      return;
    }
    const deps = await readDLL(pathsToDLL);
    for (const dep of deps) {
      if (dep instanceof AppExifError || dep instanceof Error) {
        console.error(dep);
        continue;
      }

      this.harmonyDependancy.push(dep);
    }
  }

  /** Analyze un dossier pour retourner tous les mods présents dans le dossier.
   *  Ne cherche que le dossier en question, pas les sous dossiers.
   */
  public static async AnalyzeFolder(rootPath: string): Promise<Mod[]> {
    /** La liste des noms de sous-dossiers. */
    let dirinfos = await fs.readdir(rootPath, { encoding: 'utf8', withFileTypes: true });

    dirinfos = dirinfos.filter(dirent => dirent.isDirectory());

    /** La liste des chemins, convertit en mods si il s'agissait effectivement de mods Rimworld.
     *  Null sinon.
     */
    const result = await Promise.all(dirinfos.map(async (dirent) => {
      /** Le chemin absolu vers le dossier du mod. */
      const modPath = `${rootPath}/${dirent.name}/`;
      try {
        const aboutXML = await fs.readFile(`${modPath}/About/About.xml`);
        const parsedXML = await xml2js.parseStringPromise(aboutXML);
        return new Mod(modPath, parsedXML);
      }
      catch(err) {
        console.error(err);
        return null;
      }
    })).catch(err => { console.error(err); throw err; });

    return result.filter(v => !!v && v.isValid) as Mod[];
  }
}

