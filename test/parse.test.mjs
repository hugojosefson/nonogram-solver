/* eslint-env mocha */

import assert from 'assert'
import { parse } from '../src/api'

const EXPECTED = ['line one', 'line two']

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

  it('should handle two lines', () => {
    const twoLineString = `line one
line two`
    assert.deepStrictEqual(parse(twoLineString), EXPECTED)
  })

  it('should handle two lines, plus extra empty line', () => {
    const withExtraEmptyLine = `line one
line two
`
    assert.deepStrictEqual(parse(withExtraEmptyLine), EXPECTED)
  })

  it('should handle two lines, plus extra empty lines in between', () => {
    const withExtraEmptyLinesInBetween = `line one


line two
`
    assert.deepStrictEqual(parse(withExtraEmptyLinesInBetween), EXPECTED)
  })

  it('should handle two lines, plus extra comment lines', () => {
    const withExtraComments = `
    # comment here
    line one

# another comment
line two

# last comment
`
    assert.deepStrictEqual(parse(withExtraComments), EXPECTED)
  })
})
