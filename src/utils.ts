import fs from 'node:fs'
import path from 'node:path'

export function isEmpty(dir: string): boolean {
  if (!dir || typeof dir !== 'string') {
    return true
  }
  try {
    const files = fs.readdirSync(dir)
    return files.length === 0 || (files.length === 1 && files[0] === '.git')
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return true
    }
    return false
  }
}

export function isValidPackageName(projectName: string): boolean {
  if (!projectName || projectName.length > 214) {
    return false
  }
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(projectName)
}

export function toValidPackageName(projectName: string): string {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z\d\-~]+/g, '-')
}

export function emptyDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    return
  }
  try {
    for (const file of fs.readdirSync(dir)) {
      if (file === '.git') {
        continue
      }
      fs.rmSync(path.resolve(dir, file), { recursive: true, force: true })
    }
  } catch (error) {
    throw new Error(`Failed to empty directory "${dir}": ${error}`)
  }
}

const DANGEROUS_PATTERNS = [
  /^\.env$/i,
  /^\.env\./i,
  /\.key$/i,
  /\.pem$/i,
  /\.cert$/i,
  /id_rsa/i,
  /id_ed25519/i,
  /\.npmrc$/i,
  /\.git-credentials$/i,
  /secrets?/i,
  /credentials?/i,
]

export function isDangerousFile(filename: string): boolean {
  return DANGEROUS_PATTERNS.some(pattern => pattern.test(filename))
}

export function copy(src: string, dest: string): void {
  const srcFilename = path.basename(src)
  if (isDangerousFile(srcFilename)) {
    throw new Error(`Refusing to copy dangerous file: ${srcFilename}`)
  }
  if (!src || !dest) {
    throw new Error('Source and destination paths are required')
  }
  const srcPath = path.resolve(src)
  const destPath = path.resolve(dest)
  if (srcPath === destPath) {
    throw new Error('Source and destination cannot be the same')
  }
  try {
    const stat = fs.statSync(srcPath)
    if (stat.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  } catch (error) {
    throw new Error(`Failed to copy "${src}" to "${dest}": ${error}`)
  }
}

export function copyDir(srcDir: string, destDir: string): void {
  if (!srcDir || !destDir) {
    throw new Error('Source and destination directories are required')
  }
  const srcPath = path.resolve(srcDir)
  const destPath = path.resolve(destDir)
  try {
    fs.mkdirSync(destPath, { recursive: true })
    for (const file of fs.readdirSync(srcPath)) {
      if (isDangerousFile(file)) {
        throw new Error(`Refusing to copy dangerous file: ${file}`)
      }
      const srcFile = path.join(srcPath, file)
      const destFile = path.join(destPath, file)
      copy(srcFile, destFile)
    }
  } catch (error) {
    throw new Error(`Failed to copy directory "${srcDir}" to "${destDir}": ${error}`)
  }
}

export function editFile(file: string, callback: (content: string) => string): void {
  try {
    const content = fs.readFileSync(file, 'utf-8')
    fs.writeFileSync(file, callback(content), 'utf-8')
  } catch (error) {
    throw new Error(`Failed to edit file "${file}": ${error}`)
  }
}
