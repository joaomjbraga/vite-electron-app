import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { isEmpty } from '../../src/utils.js'

describe('isEmpty', () => {
  const testDir = path.join(__dirname, '../tmp/isEmpty-test')

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

  it('should return true for empty directory', () => {
    expect(isEmpty(testDir)).toBe(true)
  })

  it('should return false for directory with files', () => {
    fs.writeFileSync(path.join(testDir, 'file.txt'), 'content')
    expect(isEmpty(testDir)).toBe(false)
  })

  it('should return true for directory with only .git', () => {
    fs.mkdirSync(path.join(testDir, '.git'))
    expect(isEmpty(testDir)).toBe(true)
  })

  it('should return false for directory with .git and other files', () => {
    fs.mkdirSync(path.join(testDir, '.git'))
    fs.writeFileSync(path.join(testDir, 'file.txt'), 'content')
    expect(isEmpty(testDir)).toBe(false)
  })

  it('should return false for directory with multiple files', () => {
    fs.writeFileSync(path.join(testDir, 'file1.txt'), 'content1')
    fs.writeFileSync(path.join(testDir, 'file2.txt'), 'content2')
    fs.writeFileSync(path.join(testDir, 'file3.txt'), 'content3')
    expect(isEmpty(testDir)).toBe(false)
  })
})
