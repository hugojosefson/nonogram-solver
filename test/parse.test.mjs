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

  it('should return PLACEHOLDER if called with two lines, plus extra empty line', () => {
    const withExtraEmptyLine = `line one
line two
`
    assert.strictEqual(parse(withExtraEmptyLine), 'PLACEHOLDER')
  })

  it('should return PLACEHOLDER if called with two lines, plus extra empty lines in between', () => {
    const withExtraEmptyLinesInBetween = `line one


line two
`
    assert.strictEqual(parse(withExtraEmptyLinesInBetween), 'PLACEHOLDER')
  })

  it('should return PLACEHOLDER if called with two lines, plus extra comment lines', () => {
    const withExtraComments = `
    # comment here
    line one

# another comment
line two

# last comment
`
    assert.strictEqual(parse(withExtraComments), 'PLACEHOLDER')
  })
})
