import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Captura erros síncronos não tratados (ex: exceções lançadas fora de try/catch)
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  // Se o app já inicializou, encerra pelo canal do Electron; caso contrário, pelo Node
  if (app.isReady()) app.exit(1)
  else process.exit(1)
})
// Captura rejeições de Promise sem .catch() — evita falhas silenciosas
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason)
})

const __dirname = path.dirname(fileURLToPath(import.meta.url))
process.env.APP_ROOT = path.join(__dirname, '..')
// URL do servidor de desenvolvimento Vite (definida apenas em modo dev)
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
// Pasta com os arquivos compilados do renderer
const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')


const VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

process.env.VITE_PUBLIC = VITE_PUBLIC

// ─── Janela principal ─────────────────────────────────────────────────────────

// Referência global para evitar que o garbage collector destrua a janela
let win: BrowserWindow | null

/** Retorna o caminho do ícone correto para cada sistema operacional. */
function getIconPath(): string {
  if (process.platform === 'win32') return path.join(VITE_PUBLIC, 'icon.ico') // Windows
  if (process.platform === 'linux') return path.join(VITE_PUBLIC, 'icon.png') // Linux
  return path.join(VITE_PUBLIC, 'icon.icns')                                  // macOS
}

/** Cria e configura a janela principal da aplicação. */
function createWindow() {
  win = new BrowserWindow({
    icon: getIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'), // Script executado antes do renderer
      contextIsolation: true,  // Isola os contextos JS do main e do renderer (segurança)
      nodeIntegration: false,  // Impede acesso direto às APIs do Node no renderer
      sandbox: true,           // Restringe ainda mais as permissões do renderer
    },
  })

  // Teste de push. Envia a data/hora atual ao renderer assim que a página terminar de carregar
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Em dev, carrega direto do servidor Vite (HMR); em prod, serve o HTML compilado
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL).catch(console.error)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html')).catch(console.error)
  }
}

// No macOS o app permanece ativo mesmo sem janelas abertas (comportamento padrão do sistema)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})
// No macOS, recriar a janela ao clicar no ícone do dock quando não há janelas abertas
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Aguarda o Electron inicializar completamente antes de criar a janela
app.whenReady().then(createWindow)
