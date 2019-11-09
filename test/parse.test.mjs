/* eslint-env mocha */

import assert from 'assert'
import { parse } from '../src/api'

const EXPECTED = [
  [[1, 2, 3], [1, 2, 2], [2, 4], [3, 5], [2, 4], [8], [5, 2], [3, 1, 2], [1, 1, 2], [1, 2]],
  [[2, 2], [6], [9], [2, 1, 3, 1], [1, 2], [5], [4, 1], [1, 7], [8], [4]]
]

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
    const twoLineString = `1 2 3, 1 2 2, 2 4, 3 5, 2 4, 8, 5 2, 3 1 2, 1 1 2, 1 2
2 2, 6, 9, 2 1 3 1, 1 2, 5, 4 1, 1 7, 8, 4`
    assert.deepStrictEqual(parse(twoLineString), EXPECTED)
  })

  it('should handle two lines, plus extra empty line', () => {
    const withExtraEmptyLine = `1 2 3, 1 2 2, 2 4, 3 5, 2 4, 8, 5 2, 3 1 2, 1 1 2, 1 2
2 2, 6, 9, 2 1 3 1, 1 2, 5, 4 1, 1 7, 8, 4
`
    assert.deepStrictEqual(parse(withExtraEmptyLine), EXPECTED)
  })

  it('should handle two lines, plus extra empty lines in between', () => {
    const withExtraEmptyLinesInBetween = `1 2 3, 1 2 2, 2 4, 3 5, 2 4, 8, 5 2, 3 1 2, 1 1 2, 1 2


2 2, 6, 9, 2 1 3 1, 1 2, 5, 4 1, 1 7, 8, 4
`
    assert.deepStrictEqual(parse(withExtraEmptyLinesInBetween), EXPECTED)
  })

  it('should handle two lines, plus extra comment lines', () => {
    const withExtraComments = `
    # comment here
    1 2 3, 1 2 2, 2 4, 3 5, 2 4, 8, 5 2, 3 1 2, 1 1 2, 1 2

# another comment
2 2, 6, 9, 2 1 3 1, 1 2, 5, 4 1, 1 7, 8, 4

# last comment
`
    assert.deepStrictEqual(parse(withExtraComments), EXPECTED)
  })
})
