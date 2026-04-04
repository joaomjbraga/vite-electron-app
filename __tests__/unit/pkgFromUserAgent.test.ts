import { describe, it, expect } from 'vitest'
import { pkgFromUserAgent } from '../../src/utils.js'

describe('pkgFromUserAgent', () => {
  it('should parse npm user agent', () => {
    const result = pkgFromUserAgent('npm/9.6.0 node/v20.10.0 linux x64')
    expect(result).toEqual({ name: 'npm', version: '9.6.0' })
  })

  it('should parse pnpm user agent', () => {
    const result = pkgFromUserAgent('pnpm/9.7.0 node/v20.10.0 linux x64')
    expect(result).toEqual({ name: 'pnpm', version: '9.7.0' })
  })

  it('should parse yarn user agent', () => {
    const result = pkgFromUserAgent('yarn/1.22.19 npm/? node/v20.10.0 linux x64')
    expect(result).toEqual({ name: 'yarn', version: '1.22.19' })
  })

  it('should parse bun user agent', () => {
    const result = pkgFromUserAgent('bun/1.0.0 darwin arm64')
    expect(result).toEqual({ name: 'bun', version: '1.0.0' })
  })

  it('should return undefined for undefined input', () => {
    expect(pkgFromUserAgent(undefined)).toBeUndefined()
  })

  it('should return undefined for invalid user agent', () => {
    expect(pkgFromUserAgent('')).toBeUndefined()
    expect(pkgFromUserAgent('invalid')).toBeUndefined()
    expect(pkgFromUserAgent('onlyname')).toBeUndefined()
  })
})
