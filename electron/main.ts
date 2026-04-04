import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  if (app.isReady()) app.exit(1)
  else process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason)
})

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
const VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

process.env.VITE_PUBLIC = VITE_PUBLIC

let win: BrowserWindow | null

function getIconPath(): string {
  if (process.platform === 'win32') return path.join(VITE_PUBLIC, 'icon.ico') // Windows
  if (process.platform === 'linux') return path.join(VITE_PUBLIC, 'icon.png') // Linux
  return path.join(VITE_PUBLIC, 'icon.icns') // macOS
}

function createWindow() {
  win = new BrowserWindow({
    icon: getIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL).catch(console.error)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html')).catch(console.error)
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
