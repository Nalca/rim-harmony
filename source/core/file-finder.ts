import klaw from 'klaw';
import config from '@/core/services/store';

/** Les options de la fonction *findDLL*. */
interface FindOptions {
  /** Une fonction de filtrage pour accepter / refuser un chemin.
   *  @param p Le chemin en entier depuis la racine.
   *  @return True si le chemin est accepté, false sinon.
   */
  filter?: (p: string) => boolean;
}

/** Retourne la liste des .dll d'un dossier
 *  @param path Le chemin du dossier à fouiller
 *  @param opt Les options du find
*/
export async function findDLL(path: string, opt?: FindOptions): Promise<string[]> {
  const option: Required<FindOptions> = Object.assign({
    filter: () => true,
  }, opt);

  return new Promise((resolve, reject) => {
    const result: string[] = [];

    klaw(path, )
      .on('error', reject)
      .on('data', item => {
        // Pas un fichier
        if (item.stats.isFile() === false) {
          return;
        }
        // Pas une dll
        if (!item.path.endsWith('.dll')) {
          return;
        }

        // Ne répond pas au filter
        if (option.filter(item.path)) {
          result.push(item.path);
        }
      })
      .on('end', () => resolve(result));
  });
}


export async function findCurrentHarmonyDLL(paths: ReadonlyArray<string>): Promise<string[]> {
  let pathToDLLs: string[] = [];

  const regexpToIgnore = config.PATH_SEQUENCE_TO_IGNORE.map(str => new RegExp(str));
  const regexpToInclude = config.PATH_SEQUENCE_TO_INCLUDE.map(str => new RegExp(str));

  for (const rootPath of paths) {
    const result = await findDLL(rootPath, {
      filter: (p) => !(regexpToIgnore.some(rg => rg.test(p)))
                    && regexpToInclude.some(rg => rg.test(p))
                    && p.endsWith('0Harmony.dll'),
    });
    pathToDLLs = [...pathToDLLs, ...result];
  }
  return pathToDLLs;
}

export default {
  findDLL,
  findCurrentHarmonyDLL,
};
