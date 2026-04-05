import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import prompts from 'prompts'
import {
  copy,
  editFile,
  emptyDir,
  isEmpty,
  isValidPackageName,
  toValidPackageName,
} from './utils.js'

const TEMPLATE_NAME = 'template-react-ts'

const COLOURS = {
  $: (c: number) => (str: string) => `\x1b[${c}m` + str + '\x1b[0m',
  red: (str: string) => COLOURS.$(31)(str),
  green: (str: string) => COLOURS.$(32)(str),
  yellow: (str: string) => COLOURS.$(33)(str),
  cyan: (str: string) => COLOURS.$(36)(str),
}

const log = {
  info: (msg: string) => console.log(msg),
  success: (msg: string) => console.log(COLOURS.green('✓ ') + msg),
  error: (msg: string) => console.log(COLOURS.red('✖ ') + msg),
  warn: (msg: string) => console.log(COLOURS.yellow('⚠ ') + msg),
  step: (msg: string) => console.log(COLOURS.cyan('→ ') + msg),
}

const cwd = process.cwd()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const argTargetDir = process.argv.slice(2).join(' ')
const defaultTargetDir = 'project name'
const renameFiles: Record<string, string | undefined> = {
  _gitignore: '.gitignore',
}

async function init() {
  let template: prompts.Answers<'projectName' | 'overwrite' | 'packageName'>

  let targetDir = (argTargetDir ?? defaultTargetDir).trim()

  if (!targetDir) {
    targetDir = defaultTargetDir
  }

  const normalizedTargetDir = path.normalize(targetDir)
  const resolvedTargetDir = path.resolve(cwd, normalizedTargetDir)
  const resolvedCwd = path.resolve(cwd)
  if (!resolvedTargetDir.startsWith(resolvedCwd) || path.isAbsolute(normalizedTargetDir)) {
    throw new Error('Invalid target directory: path traversal not allowed')
  }

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
          type: () => (argTargetDir || isValidPackageName(getProjectName()) ? null : 'text'),
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
  } catch (cancelled: unknown) {
    if (cancelled instanceof Error) {
      log.error(cancelled.message)
    } else {
      log.error('Operation cancelled')
    }
    return
  }

  if (!template) {
    log.error('Operation cancelled')
    return
  }

  const { overwrite, packageName } = template

  const root = path.join(cwd, targetDir)

  const templateDir = path.resolve(__dirname, '..', TEMPLATE_NAME)
  if (!fs.existsSync(templateDir)) {
    throw new Error(`Template "${TEMPLATE_NAME}" not found`)
  }

  log.step('Creating project structure...')

  if (!fs.existsSync(path.dirname(root))) {
    try {
      fs.mkdirSync(path.dirname(root), { recursive: true })
    } catch (error) {
      throw new Error(`Failed to create parent directory: ${error}`)
    }
  }

  if (overwrite) {
    try {
      emptyDir(root)
    } catch (error) {
      throw new Error(`Failed to empty directory: ${error}`)
    }
  } else if (!fs.existsSync(root)) {
    try {
      fs.mkdirSync(root, { recursive: true })
    } catch (error) {
      throw new Error(`Failed to create project directory: ${error}`)
    }
  }

  log.info(`Scaffolding project in ${root}...`)

  let pkgManager = 'npm'

  if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) {
    pkgManager = 'pnpm'
  } else if (fs.existsSync(path.join(cwd, 'yarn.lock'))) {
    pkgManager = 'yarn'
  } else if (process.env.npm_config_user_agent) {
    const match = process.env.npm_config_user_agent.match(/^([^/]+)/)
    if (match && ['yarn', 'pnpm', 'npm'].includes(match[1])) {
      pkgManager = match[1]
    }
  }

  const write = (file: string, content?: string) => {
    const targetPath = path.join(root, renameFiles[file] ?? file)
    if (content) {
      try {
        fs.writeFileSync(targetPath, content)
      } catch (error) {
        throw new Error(`Failed to write file "${targetPath}": ${error}`)
      }
    } else {
      copy(path.join(templateDir, file), targetPath)
    }
  }

  let files: string[]
  try {
    files = fs.readdirSync(templateDir)
  } catch (error) {
    throw new Error(`Failed to read template directory: ${error}`)
  }
  for (const file of files.filter((f) => f !== 'package.json')) {
    write(file)
  }

  let pkgJson: string
  try {
    pkgJson = fs.readFileSync(path.join(templateDir, 'package.json'), 'utf-8')
  } catch (error) {
    throw new Error(`Failed to read template package.json: ${error}`)
  }
  const pkg = JSON.parse(pkgJson)

  pkg.name = packageName || getProjectName()

  write('package.json', JSON.stringify(pkg, null, 2) + '\n')

  try {
    setupElectron(root)
  } catch (error) {
    try {
      fs.rmSync(root, { recursive: true, force: true })
    } catch {
      // Ignore cleanup failure
    }
    throw error
  }

  log.success('Project created successfully!')
  log.info('Done. Now run:')
  const cdProjectName = path.relative(cwd, root)
  if (root !== cwd) {
    log.info(`  cd ${cdProjectName.includes(' ') ? `"${cdProjectName}"` : cdProjectName}`)
  }
  switch (pkgManager) {
    case 'yarn':
      log.info('  yarn')
      log.info('  yarn dev')
      break
    case 'pnpm':
      log.info('  pnpm install')
      log.info('  pnpm dev')
      break
    default:
      log.info(`  ${pkgManager} install`)
      log.info(`  ${pkgManager} run dev`)
      break
  }
  log.info('')
}

function setupElectron(root: string) {
  const sourceDir = path.resolve(__dirname, '..', 'electron')
  const electronDir = path.join(root, 'electron')
  const electronPkgPath = path.resolve(__dirname, '..', 'electron/package.json')

  if (!fs.existsSync(electronPkgPath)) {
    throw new Error('electron/package.json not found')
  }

  let electronPkgContent: string
  try {
    electronPkgContent = fs.readFileSync(electronPkgPath, 'utf-8')
  } catch (error) {
    throw new Error(`Failed to read electron package.json: ${error}`)
  }
  const pkg = JSON.parse(electronPkgContent)

  try {
    fs.mkdirSync(electronDir, { recursive: true })

    for (const name of [
      'electron-env.d.ts',
      'main.ts',
      'preload.ts',
    ]) {
      fs.copyFileSync(path.join(sourceDir, name), path.join(electronDir, name))
    }

    const electronBuilderSrc = path.join(sourceDir, 'electron-builder.json5')
    if (fs.existsSync(electronBuilderSrc)) {
      fs.copyFileSync(electronBuilderSrc, path.join(root, 'electron-builder.json5'))
    } else {
      log.warn('electron-builder.json5 not found in electron directory')
    }
  } catch (error) {
    throw new Error(`Failed to setup Electron files: ${error}`)
  }

  editFile(path.join(root, 'package.json'), content => {
    const json = JSON.parse(content)
    json.main = 'dist-electron/main.js'
    if (!json.scripts.build?.includes('electron-builder')) {
      json.scripts.build = `${json.scripts.build || ''} && electron-builder`.trim()
    }
    json.devDependencies.electron = pkg.devDependencies.electron
    json.devDependencies['electron-builder'] = pkg.devDependencies['electron-builder']
    json.devDependencies['vite-plugin-electron'] = pkg.devDependencies['vite-plugin-electron']
    return JSON.stringify(json, null, 2) + '\n'
  })

  const electronPlugin = `electron({
      main: {
        entry: 'electron/main.ts',
      },
      preload: {
        input: path.join('${root.replace(/\\/g, '\\\\')}', 'electron/preload.ts'),
      },
    })`

  editFile(path.join(root, 'vite.config.ts'), content => {
    if (content.includes('vite-plugin-electron/simple')) {
      return content
    }
    const hasPathImport = /import\s+path\s+from\s+['"]node:path['"]/.test(content)
    const hasElectronImport = /import\s+electron\s+from\s+['"]vite-plugin-electron\/simple['"]/.test(content)

    const pluginMatch = content.match(/plugins:\s*\[([\s\S]*)\]/)
    if (pluginMatch && !pluginMatch[1].includes('vite-plugin-electron')) {
      const pluginsContent = pluginMatch[1].trim()
      const newPluginsContent = pluginsContent
        ? `${pluginsContent}, ${electronPlugin}`
        : electronPlugin
      content = content.replace(pluginMatch[0], `plugins: [${newPluginsContent}]`)

      const lines = content.split('\n')
      const importInsertIndex = lines.findIndex((line, i) =>
        i > 0 && line.trim() === '' && lines[i - 1].trim().startsWith('import ') &&
        !lines[i + 1]?.trim().startsWith('import ')
      )

      if (importInsertIndex !== -1) {
        const newImports: string[] = []
        if (!hasPathImport) {
          newImports.push(`import path from 'node:path'`)
        }
        if (!hasElectronImport) {
          newImports.push(`import electron from 'vite-plugin-electron/simple'`)
        }
        if (newImports.length > 0) {
          lines.splice(importInsertIndex + 1, 0, ...newImports)
          content = lines.join('\n')
        }
      } else {
        let lastImportIndex = -1
        for (let i = lines.length - 1; i >= 0; i--) {
          if (lines[i].trim().startsWith('import ')) {
            lastImportIndex = i
            break
          }
        }
        if (lastImportIndex !== -1) {
          const newImports: string[] = []
          if (!hasPathImport) {
            newImports.push(`import path from 'node:path'`)
          }
          if (!hasElectronImport) {
            newImports.push(`import electron from 'vite-plugin-electron/simple'`)
          }
          if (newImports.length > 0) {
            lines.splice(lastImportIndex + 1, 0, '', ...newImports)
            content = lines.join('\n')
          }
        }
      }
    }
    return content
  })

  editFile(path.join(root, 'tsconfig.json'), content => {
    try {
      const json = JSON.parse(content)
      if (json.include) {
        const includeValue = json.include
        if (Array.isArray(includeValue)) {
          if (!includeValue.includes('electron')) {
            json.include = [...includeValue, 'electron']
          }
        } else if (typeof includeValue === 'string') {
          if (!includeValue.includes('electron')) {
            json.include = [includeValue, 'electron']
          }
        }
      } else {
        json.include = ['src', 'electron']
      }
      return JSON.stringify(json, null, 2) + '\n'
    } catch {
      return content
        .split('\n')
        .map(line => line.trimStart().startsWith('"include"') ? line.replace(']', ', "electron"]') : line)
        .join('\n')
    }
  })

  editFile(path.join(root, '.gitignore'), content => {
    if (/dist-electron/.test(content) && /release/.test(content)) {
      return content.endsWith('\n') ? content : content + '\n'
    }
    let newContent = content
    if (!newContent.endsWith('\n')) {
      newContent += '\n'
    }
    if (!/dist-electron/.test(newContent)) {
      newContent += 'dist-electron\n'
    }
    if (!/release/.test(newContent)) {
      newContent += 'release\n'
    }
    return newContent
  })
}

init().catch((e) => {
  if (e instanceof Error) {
    log.error(e.message)
  } else {
    log.error('An unexpected error occurred')
  }
})
