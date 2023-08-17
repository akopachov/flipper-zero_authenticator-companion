import { ipcRenderer, type IpcRendererEvent } from 'electron';
import { v1 as uuidv4 } from 'uuid';

export async function rpcToMain<T>(name: string, arg?: any): Promise<T> {
  const requestId = uuidv4();
  return new Promise<any>(resolve => {
    function resultHandler(_: IpcRendererEvent, result: { result: any; requestId: string }) {
      if (result.requestId == requestId) {
        resolve(result.result);
      }
    }

    ipcRenderer.on(`${name}:done`, resultHandler);
    ipcRenderer.send(name, { requestId, arg });
  });
}
