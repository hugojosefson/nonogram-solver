/* eslint-env mocha */

import assert from 'assert'
import { parse } from '../src/api'

describe('parse', () => {
  it('should throw an Error when called without argument', () => {
    assert.throws(() => {
      parse()
    }, Error)
  })
  it('should throw an Error when called with single line', () => {
    assert.throws(() => {
      parse('asdasd')
    }, Error)
  })

  it('should return PLACEHOLDER if called with two lines', () => {
    const twoLineString = `line one
line two`
    assert.strictEqual(parse(twoLineString), 'PLACEHOLDER')
  })

  it('should return PLACEHOLDER if called with two lines, plus extra empy line', () => {
    const withExtraEmptyLine = `line one
line two
`
    assert.strictEqual(parse(withExtraEmptyLine), 'PLACEHOLDER')
  })
})
