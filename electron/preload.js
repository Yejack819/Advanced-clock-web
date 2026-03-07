import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        send: (channel, args) => {
            ipcRenderer.send(channel, args);
        },
        on: (channel, func) => {
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        },
        once: (channel, func) => {
            ipcRenderer.once(channel, (event, ...args) => func(...args));
        },
        invoke: (channel, args) => {
            return ipcRenderer.invoke(channel, args);
        },
    },
});
