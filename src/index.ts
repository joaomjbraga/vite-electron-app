import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import prompts from 'prompts'
import {
  isEmpty,
  emptyDir,
  copy,
  editFile,
  isValidPackageName,
  toValidPackageName,
  pkgFromUserAgent,
} from './utils.js'

const TEMPLATE_NAME = 'template-react-ts'

const COLOURS = {
  $: (c: number) => (str: string) => `\x1b[${c}m` + str + '\x1b[0m',
  gary: (str: string) => COLOURS.$(90)(str),
  cyan: (str: string) => COLOURS.$(36)(str),
  yellow: (str: string) => COLOURS.$(33)(str),
  green: (str: string) => COLOURS.$(32)(str),
  red: (str: string) => COLOURS.$(31)(str),
}

const cwd = process.cwd()
const requireMod = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const argTargetDir = process.argv.slice(2).join(' ')
const defaultTargetDir = 'electron-vite-project'
const renameFiles: Record<string, string | undefined> = {
  _gitignore: '.gitignore',
}

async function init() {
  let template: prompts.Answers<'projectName' | 'overwrite' | 'packageName'>

  let targetDir = argTargetDir ?? defaultTargetDir

  const getProjectName = () => (targetDir === '.' ? path.basename(path.resolve()) : targetDir)

  try {
    template = await prompts(
      [
        {
          type: () => (argTargetDir ? null : 'text'),
          name: 'projectName',
          message: 'Project name:',
          initial: defaultTargetDir,
          onState: (state) => {
            targetDir = state?.value.trim().replace(/\/+$/g, '') ?? defaultTargetDir
          },
        },
        {
          type: () =>
            !fs.existsSync(targetDir) || isEmpty(targetDir) ? null : 'confirm',
          name: 'overwrite',
          message: () =>
            (targetDir === '.'
              ? 'Current directory'
              : `Target directory "${targetDir}"`) +
            ` is not empty. Remove existing files and continue?`,
        },
        {
          type: (_, { overwrite }: { overwrite?: boolean }) => {
            if (overwrite === false) {
              throw new Error(COLOURS.red('✖') + ' Operation cancelled')
            }
            return null
          },
          name: 'overwriteChecker',
        },
        {
          type: () => (isValidPackageName(getProjectName()) ? null : 'text'),
          name: 'packageName',
          message: 'Package name:',
          initial: () => toValidPackageName(getProjectName()),
          validate: (dir) => isValidPackageName(dir) || 'Invalid package.json name',
        }
      ],
      {
        onCancel: () => {
          throw new Error(`${COLOURS.red('✖')} Operation cancelled`)
        },
      },
    )
  } catch (cancelled: any) {
    console.log(cancelled.message)
    return
  }

  const { overwrite, packageName } = template

  const root = path.join(cwd, targetDir)

  if (overwrite) {
    emptyDir(root)
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true })
  }

  console.log(`\nScaffolding project in ${root}...`)

  const templateDir = path.resolve(__dirname, '..', TEMPLATE_NAME)
  if (!fs.existsSync(templateDir)) {
    throw new Error(`Template "${TEMPLATE_NAME}" not found`)
  }

  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent)
  const pkgManager = pkgInfo ? pkgInfo.name : 'npm'

  const write = (file: string, content?: string) => {
    const targetPath = path.join(root, renameFiles[file] ?? file)
    if (content) {
      fs.writeFileSync(targetPath, content)
    } else {
      copy(path.join(templateDir, file), targetPath)
    }
  }

  const files = fs.readdirSync(templateDir)
  for (const file of files.filter((f) => f !== 'package.json')) {
    write(file)
  }

  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, 'package.json'), 'utf-8'),
  )

  pkg.name = packageName || getProjectName()

  write('package.json', JSON.stringify(pkg, null, 2) + '\n')

  setupElectron(root)

  console.log(`\nDone. Now run:\n`)
  const cdProjectName = path.relative(cwd, root)
  if (root !== cwd) {
    console.log(`  cd ${cdProjectName.includes(' ') ? `"${cdProjectName}"` : cdProjectName}`)
  }
  switch (pkgManager) {
    case 'yarn':
      console.log('  yarn')
      console.log('  yarn dev')
      break
    default:
      console.log(`  ${pkgManager} install`)
      console.log(`  ${pkgManager} run dev`)
      break
  }
  console.log()
}

function setupElectron(root: string) {
  const sourceDir = path.resolve(__dirname, '..', 'electron')
  const electronDir = path.join(root, 'electron')
  const publicDir = path.join(root, 'public')
  const pkg = requireMod('../electron/package.json')

  fs.mkdirSync(electronDir, { recursive: true })

  for (const name of [
    'electron-env.d.ts',
    'main.ts',
    'preload.ts',
  ]) {
    fs.copyFileSync(path.join(sourceDir, name), path.join(electronDir, name))
  }

  for (const name of [
    'electron-vite.animate.svg',
    'electron-vite.svg',
  ]) {
    fs.copyFileSync(path.join(sourceDir, name), path.join(publicDir, name))
  }

  for (const name of [
    'electron-builder.json5',
  ]) {
    fs.copyFileSync(path.join(sourceDir, name), path.join(root, name))
  }

  editFile(path.join(root, 'package.json'), content => {
    const json = JSON.parse(content)
    json.main = 'dist-electron/main.js'
    json.scripts.build = `${json.scripts.build} && electron-builder`
    json.devDependencies.electron = pkg.devDependencies.electron
    json.devDependencies['electron-builder'] = pkg.devDependencies['electron-builder']
    json.devDependencies['vite-plugin-electron'] = pkg.devDependencies['vite-plugin-electron']
    json.devDependencies['vite-plugin-electron-renderer'] = pkg.devDependencies['vite-plugin-electron-renderer']
    return JSON.stringify(json, null, 2) + '\n'
  })

  const snippets = (indent = 0) => `
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})
`.trim()
    .split('\n')
    .map(line => line ? ' '.repeat(indent) + line : line)
    .join('\n')

  editFile(path.join(root, 'src/main.tsx'), content => `${content}\n${snippets()}\n`)

  const electronPlugin = `electron({
      main: {
        entry: 'electron/main.ts',
      },
      preload: {
        input: path.join(process.cwd(), 'electron/preload.ts'),
      },
      renderer: {},
    })`

  editFile(path.join(root, 'vite.config.ts'), content =>
    content
      .split('\n')
      .map(line => line.includes("import { defineConfig } from 'vite'")
        ? `${line}
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'`
        : line)
      .map(line => line.trimStart().startsWith('plugins')
        ? `  plugins: [
    react(),
    ${electronPlugin},
  ],`
        : line)
      .join('\n')
  )

  editFile(path.join(root, 'tsconfig.json'), content =>
    content
      .split('\n')
      .map(line => line.trimStart().startsWith('"include"') ? line.replace(']', ', "electron"]') : line)
      .join('\n')
  )

  editFile(path.join(root, '.gitignore'), content =>
    content
      .split('\n')
      .map(line => line === 'dist-ssr' ? `${line}\ndist-electron\nrelease` : line)
      .join('\n')
  )

  editFile(path.join(root, 'src/App.tsx'), content => content)
}

init().catch((e) => {
  console.error(e)
})
