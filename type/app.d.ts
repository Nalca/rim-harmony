declare namespace NodeJS {
  interface Global {
    /** La fenêtre principale de l'application.
     *  Accessible uniquement depuis le processus principal *'Core'*.
     */
    mainWindow: Electron.BrowserWindow;
  }
}
