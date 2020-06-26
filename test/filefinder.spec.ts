import { findDLL } from '../source/file-finder'
import { expect } from 'chai';
import 'mocha';

/** Le chemin vers le dossier de test. */
const pathToTestFolder = `${__dirname}/filefinder.test/`;
/** La liste des fausses dll présentes dans le dossier de test. */
const existingFiles = ['test.dll', 'test-sub.dll'];

describe('Find finder', () => {
  it('should find DLL files', async function () {
    const val = await findDLL(pathToTestFolder);
    expect(val)
      .to.be.an('array', 'Not an array')
      .that.is.lengthOf(2, 'Not all .dll founded');
  });

  it(`should find the ${existingFiles.length} named examples by name`, async function () {
    const paths = await findDLL(pathToTestFolder);

    expect(paths).is.lengthOf(existingFiles.length, 'Different numbers of files found');
    paths.forEach(path => {
      const filename = (/[a-zA-Z-]+\.dll$/.exec(path) || [])[0];
      expect(filename).to.be.an('string', 'Could not find a correct filename');
      expect(existingFiles).to.contain(filename, `File '${filename}' is not present in the list of fake dlls.`);
    })
  });

  it('should filter the list of path', async function () {
    const regexp = new RegExp(`[\\/]{1}${existingFiles[0]}$`);
    const paths = await findDLL(pathToTestFolder, {
      // Le premier élément est viré de la liste
      filter: (p) => !(regexp.test(p)),
    });

    expect(paths).not.contain(existingFiles[0], 'Find a file that should have been removed');
  });
});
