window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const dependency of ['chrome', 'node', 'electron']) {
      replaceText(`${dependency}-version`, process.versions[dependency])
    }
  })

const { contextBridge, ipcRenderer } = require('electron');

window.electronAPI = { ipcRenderer };

contextBridge.exposeInMainWorld('electronAPI', {
    closeApp: () => ipcRenderer.invoke('close-app'),
});