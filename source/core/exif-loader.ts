import { get } from 'lodash';
import { exec } from 'exiftool2';
import config from '@/core/services/store';
import { ExifProperties } from '@Common/properties';

export class AppExifError extends Error {
  constructor(msg: string) { super(msg); }
}

export class ExifData implements ExifProperties {
  constructor(data: unknown) {

    this.AssemblyComments = get(data, 'Comments', ''); // Special case
    this.AssemblyVersion = get(data, 'AssemblyVersion', '');
    this.CompanyName = get(data, 'CompanyName', '');
    this.Directory = get(data, 'Directory', '');
    this.FileDescription = get(data, 'FileDescription', '');
    this.FileName = get(data, 'FileName', '');
    this.InternalName = get(data, 'InternalName', '');
    this.ProductVersion = get(data, 'ProductVersion', '');
    this.SourceFile = get(data, 'SourceFile', '');
  }

  public isHarmonyDLL(): boolean {
    return [this.FileName, this.InternalName].every(name => name === config.HARMONY_NAME);
  }

  readonly AssemblyComments: string; // Comments
  readonly AssemblyVersion: string;
  readonly CompanyName: string;
  readonly Directory: string;
  readonly FileDescription: string;
  readonly FileName: string;
  readonly InternalName: string;
  readonly ProductVersion: string;
  readonly SourceFile: string;
  readonly IsValid: boolean = true;
}

type TypeReadDLLReturn = ExifData | AppExifError | Error;

export async function readDLL(pathToDLL: string): Promise<TypeReadDLLReturn[]>;
export async function readDLL(pathToDLL: string[]): Promise<TypeReadDLLReturn[]>;

export async function readDLL(pathToDLL: string | string[]): Promise<TypeReadDLLReturn[]> {
  return new Promise((resolve) => {
    if (!Array.isArray(pathToDLL)) {
      pathToDLL = [pathToDLL];
    }

    const exif = exec('-fast', ...pathToDLL);

    exif.on("exif", data => {
      if (!Array.isArray(data)) {
        console.error(data);
        return resolve([new AppExifError('Get an unexpected value type from exif')]);
      }

      resolve(data.map(d => new ExifData(d)));
      exif.close();
    });
    exif.on("error", err => {
      console.error(err);
      resolve([err]) ;
    });
  });
}

export default {
  AppExifError,
  ExifData,
  readDLL,
};