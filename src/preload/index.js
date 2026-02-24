import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('appInfo', {
  electron: process.versions.electron,
  chrome: process.versions.chrome,
  node: process.versions.node,
});
