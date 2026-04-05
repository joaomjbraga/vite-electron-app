import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
process.env.APP_ROOT = path.join(__dirname, '..')
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

// 📁 Em dev aponta para /public, em produção para /dist
const VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

process.env.VITE_PUBLIC = VITE_PUBLIC

let win: BrowserWindow | null = null

function getIconPath(): string {
  if (process.platform === 'win32') return path.join(VITE_PUBLIC, 'icon.ico')
  if (process.platform === 'linux') return path.join(VITE_PUBLIC, 'icon.png')
  return path.join(VITE_PUBLIC, 'icon.icns')
}

function createWindow(): void {
  win = new BrowserWindow({
    icon: getIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,  // 🔒 Isola o contexto do renderer
      nodeIntegration: false,  // 🔒 Desabilita Node.js no renderer — use o preload
      sandbox: true,           // 🔒 Sandboxing adicional recomendado pelo Electron
    },
  })

  // Libera a referência ao fechar (evita memory leak)
  win.on('closed', () => { win = null })

  // Em dev carrega o servidor Vite (HMR), em produção serve o build
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL).catch(console.error)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html')).catch(console.error)
  }
}

// No macOS o app permanece ativo mesmo sem janelas abertas
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// No macOS, recriar a janela ao clicar no ícone do dock
app.on('activate', () => {
  if (win === null) createWindow()
  else win.show()
})

app.whenReady()
  .then(createWindow)
  .catch((err) => {
    console.error('[main] Falha ao inicializar o app:', err)
    app.quit()
  })
