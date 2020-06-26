import { ModProperties, ConfigProperties, ModsConfig } from '@Common/properties';


/** Une interface intermédiaire pour documenter les méthodes. */
interface IpcHandlerType {
  /** La vue veut vérifier si un chemin existe. (Est-ce que le fichier / dossier **existe** et est **accessible en lecture**) */
  CheckPath: any;
  /** La vue demande la configuration de l'application. */
  GetConfig: any;
  /** La vue demande le fichier *ModsConfig.xml* */
  GetModsConfig: any;
  /** La vue demande les données des mods. */
  GetModsList: any;
  /** La vue demande l'ouverture d'une URL (Web, ou locale) */
  OpenUrl: any;
  /** La vue veut changer la configuration de l'application. */
  UpdateConfig: any;

  /** La vue demande à l'application d'ouvrir l'explorateur pour trouver un fichier / dossier (Manuellement, grâces aux actions de l'utilisateur) */
  LookForFile: any;
}

export namespace Asynchrone {
  type EventsType = Omit<IpcHandlerType, 'LookForFile'>;
  export const Events: Readonly<{ [P in keyof EventsType]: P }> = Object.freeze({
    CheckPath: 'CheckPath',
    GetConfig: 'GetConfig',
    GetModsConfig: 'GetModsConfig',
    GetModsList: 'GetModsList',
    OpenUrl: 'OpenUrl',
    UpdateConfig: 'UpdateConfig',
  });
  export type Events = keyof typeof Events;
}

export namespace Synchrone {
  type EventsType = Pick<IpcHandlerType, 'LookForFile'>;
  export const Events: Readonly<{ [P in keyof EventsType]: P }> = Object.freeze({
    LookForFile: 'LookForFile',
  });
  export type Events = keyof typeof Events;
}

export namespace TypeParameters {
  export type CheckPathView = { path: string; accessible: boolean };

  export type OpenUrlCore = { url?: string; path?: string };
  export type CheckPathCore = { path: string };
  export type LookForFileCore = { defaultPath?: string; type: 'file' | 'folder' };
}

export const Events = Object.assign({}, Asynchrone.Events, Synchrone.Events);

/** Le type des events coté 'View'. */
declare class IpcViewParameters implements IpcHandlerType {
  CheckPath: Array<TypeParameters.CheckPathView>;
  GetConfig: ConfigProperties;
  GetModsConfig: ModsConfig | null;
  GetModsList: ModProperties[];
  LookForFile: string[];
  OpenUrl: void;
  UpdateConfig: Partial<ConfigProperties>;
}
/** Le type des events coté 'Core'. */
declare class IpcCoreParameters implements IpcHandlerType {
  CheckPath: Array<TypeParameters.CheckPathCore>;
  GetConfig: void;
  GetModsConfig: void;
  GetModsList: void;
  LookForFile: TypeParameters.LookForFileCore;
  OpenUrl: TypeParameters.OpenUrlCore;
  UpdateConfig: Partial<ConfigProperties>;
}
/** Permet de récupérer simplement le type d'un event coté 'View' */
export type PayloadView<T extends keyof IpcViewParameters> = IpcViewParameters[T];
/** Permet de récupérer simplement le type d'un event coté 'Core' */
export type PayloadCore<T extends keyof IpcCoreParameters> = IpcCoreParameters[T];

/** L'interface des events **asynchrone** handlers coté 'Core' */
export type IpcHandlerAsyncCore = {
  [P in Asynchrone.Events]: (event: Electron.IpcMainInvokeEvent, payload: IpcCoreParameters[P]) => Promise<IpcViewParameters[P]>;
}
/** L'interface des events **synchrone** handlers coté 'Core' */
export type IpcHandlerSyncCore = {
  [P in Synchrone.Events]: (event: Electron.IpcMainEvent, payload: IpcCoreParameters[P]) => IpcViewParameters[P];
}