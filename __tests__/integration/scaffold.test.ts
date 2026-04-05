import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

describe('Scaffold Integration', () => {
  const rootDir = path.join(process.cwd())
  const distPath = path.join(rootDir, 'dist/index.mjs')
  const testDir = path.join(__dirname, '../tmp/scaffold-test')
  const projectName = 'test-electron-app'
  const projectDir = path.join(testDir, projectName)

  function runCli() {
    execSync(`node ${distPath} ${projectName}`, {
      cwd: testDir,
      input: '\n\n\n\n',
      encoding: 'utf-8',
    })
  }

  beforeEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true })
    }
    fs.mkdirSync(testDir, { recursive: true })
  })

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true })
    }
  })

  it('should create project directory', () => {
    runCli()
    expect(fs.existsSync(projectDir)).toBe(true)
  })

  it('should create electron directory with main.ts', () => {
    runCli()
    expect(fs.existsSync(path.join(projectDir, 'electron/main.ts'))).toBe(true)
    expect(fs.existsSync(path.join(projectDir, 'electron/preload.ts'))).toBe(true)
    expect(fs.existsSync(path.join(projectDir, 'electron/electron-env.d.ts'))).toBe(true)
  })

  it('should create src directory with React files', () => {
    runCli()
    expect(fs.existsSync(path.join(projectDir, 'src/main.tsx'))).toBe(true)
    expect(fs.existsSync(path.join(projectDir, 'src/App.tsx'))).toBe(true)
  })

  it('should create public directory', () => {
    runCli()
    expect(fs.existsSync(path.join(projectDir, 'public'))).toBe(true)
  })

  it('should create package.json with electron dependencies', () => {
    runCli()
    const pkgPath = path.join(projectDir, 'package.json')
    expect(fs.existsSync(pkgPath)).toBe(true)

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    expect(pkg.main).toBe('dist-electron/main.js')
    expect(pkg.devDependencies.electron).toBeDefined()
    expect(pkg.devDependencies['electron-builder']).toBeDefined()
    expect(pkg.devDependencies['vite-plugin-electron']).toBeDefined()
  })

  it('should update vite.config.ts with electron plugin', () => {
    runCli()
    const viteConfig = fs.readFileSync(path.join(projectDir, 'vite.config.ts'), 'utf-8')
    expect(viteConfig).toContain('vite-plugin-electron/simple')
    expect(viteConfig).toContain('electron/main.ts')
    expect(viteConfig).toContain('electron/preload.ts')
  })

  it('should update tsconfig.json to include electron', () => {
    runCli()
    const tsconfig = fs.readFileSync(path.join(projectDir, 'tsconfig.json'), 'utf-8')
    expect(tsconfig).toContain('electron')
  })

  it('should update .gitignore with electron paths', () => {
    runCli()
    const gitignore = fs.readFileSync(path.join(projectDir, '.gitignore'), 'utf-8')
    expect(gitignore).toContain('dist-electron')
    expect(gitignore).toContain('release')
  })

  it('should create electron-builder.json5', () => {
    runCli()
    expect(fs.existsSync(path.join(projectDir, 'electron-builder.json5'))).toBe(true)
  })
})
