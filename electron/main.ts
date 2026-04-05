import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
process.env.APP_ROOT = path.join(__dirname, '..')
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

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
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  win.on('closed', () => { win = null })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL).catch(console.error)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html')).catch(console.error)
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

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
