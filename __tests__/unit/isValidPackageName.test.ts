import { describe, it, expect } from 'vitest'
import { isValidPackageName } from '../../src/utils.js'

describe('isValidPackageName', () => {
  it('should accept valid package names', () => {
    expect(isValidPackageName('my-app')).toBe(true)
    expect(isValidPackageName('my-app-123')).toBe(true)
    expect(isValidPackageName('a')).toBe(true)
    expect(isValidPackageName('package')).toBe(true)
  })

  it('should accept scoped package names', () => {
    expect(isValidPackageName('@scope/package')).toBe(true)
    expect(isValidPackageName('@my-org/my-package')).toBe(true)
    expect(isValidPackageName('@a/b')).toBe(true)
  })

  it('should accept names with numbers', () => {
    expect(isValidPackageName('123package')).toBe(true)
    expect(isValidPackageName('package123')).toBe(true)
    expect(isValidPackageName('a1')).toBe(true)
  })

  it('should reject empty or invalid names', () => {
    expect(isValidPackageName('')).toBe(false)
    expect(isValidPackageName('@')).toBe(false)
    expect(isValidPackageName('@/')).toBe(false)
  })

  it('should reject names starting with dots or underscores', () => {
    expect(isValidPackageName('_package')).toBe(false)
    expect(isValidPackageName('.package')).toBe(false)
  })
})
