/* eslint-env mocha */

import assert from 'assert'
import { parseHints } from '../src/api'

const INPUT_LINE_ONE = '1 2 3, 1 2 2, 2 4, 3 5, 2 4, 8, 5 2, 3 1 2, 1 1 2, 1 2'
const INPUT_LINE_TWO = '2 2, 6, 9, 2 1 3 1, 1 2, 5, 4 1, 1 7, 8, 4'

const EXPECTED = [
  [[1, 2, 3], [1, 2, 2], [2, 4], [3, 5], [2, 4], [8], [5, 2], [3, 1, 2], [1, 1, 2], [1, 2]],
  [[2, 2], [6], [9], [2, 1, 3, 1], [1, 2], [5], [4, 1], [1, 7], [8], [4]]
]

describe('parse-hints', () => {
  it('should throw an Error when called without argument', () => {
    assert.throws(() => {
      parseHints()
    }, Error)
  })
  it('should throw an Error when called with single line', () => {
    assert.throws(() => {
      parseHints(INPUT_LINE_ONE)
    }, Error)
  })

  it('should handle two lines', () => {
    const twoLineString = `${INPUT_LINE_ONE}
${INPUT_LINE_TWO}`
    assert.deepStrictEqual(parseHints(twoLineString), EXPECTED)
  })

  it('should handle two lines, plus extra empty line', () => {
    const withExtraEmptyLine = `${INPUT_LINE_ONE}
${INPUT_LINE_TWO}
`
    assert.deepStrictEqual(parseHints(withExtraEmptyLine), EXPECTED)
  })

  it('should handle two lines, plus extra empty lines in between', () => {
    const withExtraEmptyLinesInBetween = `${INPUT_LINE_ONE}


${INPUT_LINE_TWO}
`
    assert.deepStrictEqual(parseHints(withExtraEmptyLinesInBetween), EXPECTED)
  })

  it('should handle two lines, plus extra comment lines', () => {
    const withExtraComments = `
    # comment here
    ${INPUT_LINE_ONE}

# another comment
${INPUT_LINE_TWO}

# last comment
`
    assert.deepStrictEqual(parseHints(withExtraComments), EXPECTED)
  })

  it('should throw an Error when called with different amount of cells', () => {
    assert.throws(() => {
      parseHints(`
      ${INPUT_LINE_ONE}
      ${INPUT_LINE_TWO}, 4 4
      `)
    }, Error)
  })
})
