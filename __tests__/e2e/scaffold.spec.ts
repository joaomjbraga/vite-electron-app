import { test, expect } from '@playwright/test'
import path from 'node:path'
import fs from 'node:fs'
import { execSync } from 'node:child_process'

test.describe('Scaffold E2E', () => {
  const rootDir = path.join(process.cwd())
  const distPath = path.join(rootDir, 'dist/index.mjs')
  const testDir = path.join(__dirname, '../tmp/e2e')
  const projectName = 'test-e2e-electron-app'
  const projectDir = path.join(testDir, projectName)

  test.beforeEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true })
    }
    fs.mkdirSync(testDir, { recursive: true })
  })

  test.afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true })
    }
  })

  test('should generate Electron app structure', () => {
    execSync(`node ${distPath} ${projectName}`, {
      cwd: testDir,
      input: '\n\n\n\n',
      encoding: 'utf-8',
    })

    expect(fs.existsSync(projectDir)).toBe(true)
    expect(fs.existsSync(path.join(projectDir, 'electron'))).toBe(true)
    expect(fs.existsSync(path.join(projectDir, 'src'))).toBe(true)
  })

  test('should create electron directory with main files', () => {
    execSync(`node ${distPath} ${projectName}`, {
      cwd: testDir,
      input: '\n\n\n\n',
      encoding: 'utf-8',
    })

    expect(fs.existsSync(path.join(projectDir, 'electron/main.ts'))).toBe(true)
    expect(fs.existsSync(path.join(projectDir, 'electron/preload.ts'))).toBe(true)
    expect(fs.existsSync(path.join(projectDir, 'electron/electron-env.d.ts'))).toBe(true)
  })

  test('should have correct package.json with electron deps', () => {
    execSync(`node ${distPath} ${projectName}`, {
      cwd: testDir,
      input: '\n\n\n\n',
      encoding: 'utf-8',
    })

    const pkgPath = path.join(projectDir, 'package.json')
    expect(fs.existsSync(pkgPath)).toBe(true)

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    expect(pkg.main).toBe('dist-electron/main.js')
    expect(pkg.devDependencies.electron).toBeDefined()
    expect(pkg.devDependencies['electron-builder']).toBeDefined()
    expect(pkg.devDependencies['vite-plugin-electron']).toBeDefined()
  })

  test('should update vite.config.ts with electron plugin', () => {
    execSync(`node ${distPath} ${projectName}`, {
      cwd: testDir,
      input: '\n\n\n\n',
      encoding: 'utf-8',
    })

    const viteConfig = fs.readFileSync(path.join(projectDir, 'vite.config.ts'), 'utf-8')
    expect(viteConfig).toContain('vite-plugin-electron/simple')
    expect(viteConfig).toContain('electron/main.ts')
    expect(viteConfig).toContain('electron/preload.ts')
  })

  test('should update tsconfig.json to include electron', () => {
    execSync(`node ${distPath} ${projectName}`, {
      cwd: testDir,
      input: '\n\n\n\n',
      encoding: 'utf-8',
    })

    const tsconfig = fs.readFileSync(path.join(projectDir, 'tsconfig.json'), 'utf-8')
    expect(tsconfig).toContain('electron')
  })

  test('should update .gitignore with electron paths', () => {
    execSync(`node ${distPath} ${projectName}`, {
      cwd: testDir,
      input: '\n\n\n\n',
      encoding: 'utf-8',
    })

    const gitignore = fs.readFileSync(path.join(projectDir, '.gitignore'), 'utf-8')
    expect(gitignore).toContain('dist-electron')
    expect(gitignore).toContain('release')
  })

  test('should create electron-builder.json5', () => {
    execSync(`node ${distPath} ${projectName}`, {
      cwd: testDir,
      input: '\n\n\n\n',
      encoding: 'utf-8',
    })

    expect(fs.existsSync(path.join(projectDir, 'electron-builder.json5'))).toBe(true)
  })
})
