import { contextBridge, ipcRenderer } from 'electron'

// ---------------------------------------------------------------------------
// 💡 EXEMPLO — sinta-se livre para apagar este bloco e criar o seu próprio
//
//    O contextBridge é a forma segura de expor APIs do Electron ao renderer.
//    Adicione aqui apenas o que o renderer realmente precisar.
//    Docs: https://www.electronjs.org/docs/latest/api/context-bridge
// ---------------------------------------------------------------------------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...params) => listener(event, ...params))
  },
  // 🧹 Remove o listener ao desmontar o componente (evita memory leak)
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, listener] = args
    return ipcRenderer.off(channel, listener)
  },
})
// ---------------------------------------------------------------------------
