import { describe, it, expect } from 'vitest'
import { toValidPackageName } from '../../src/utils.js'

describe('toValidPackageName', () => {
  it('should convert to lowercase', () => {
    expect(toValidPackageName('MyApp')).toBe('myapp')
    expect(toValidPackageName('MY-APP')).toBe('my-app')
  })

  it('should replace spaces with hyphens', () => {
    expect(toValidPackageName('my app')).toBe('my-app')
    expect(toValidPackageName('my  app')).toBe('my-app')
    expect(toValidPackageName('my   app')).toBe('my-app')
  })

  it('should remove leading dots and underscores', () => {
    expect(toValidPackageName('.my-app')).toBe('my-app')
    expect(toValidPackageName('_my-app')).toBe('my-app')
  })

  it('should replace invalid characters with hyphens', () => {
    expect(toValidPackageName('my@app')).toBe('my-app')
    expect(toValidPackageName('my#app')).toBe('my-app')
    expect(toValidPackageName('my$app')).toBe('my-app')
    expect(toValidPackageName('my!app')).toBe('my-app')
  })

  it('should trim whitespace', () => {
    expect(toValidPackageName('  my-app  ')).toBe('my-app')
    expect(toValidPackageName('\tmy-app\n')).toBe('my-app')
  })

  it('should handle complex inputs', () => {
    expect(toValidPackageName('My Amazing App!')).toBe('my-amazing-app-')
    expect(toValidPackageName('  _Test@App#123_  ')).toBe('test-app-123-')
  })

  it('should handle edge cases', () => {
    expect(toValidPackageName('')).toBe('')
    expect(toValidPackageName('   ')).toBe('')
  })
})
