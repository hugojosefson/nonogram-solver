/* eslint-env mocha */

import assert from 'assert'
import { parseHints } from '../src/api'
import { INPUT_HINTS_HORIZONTAL, INPUT_HINTS_VERTICAL, EXPECTED_HINTS } from './hint-fixtures'

describe('parse-hints', () => {
  it('should throw an Error when called without argument', () => {
    assert.throws(() => {
      parseHints()
    }, Error)
  })
  it('should throw an Error when called with single line', () => {
    assert.throws(() => {
      parseHints(INPUT_HINTS_HORIZONTAL)
    }, Error)
  })

  it('should handle two lines', () => {
    const twoLineString = `${INPUT_HINTS_HORIZONTAL}
${INPUT_HINTS_VERTICAL}`
    assert.deepStrictEqual(parseHints(twoLineString), EXPECTED_HINTS)
  })

  it('should handle two lines, plus extra empty line', () => {
    const withExtraEmptyLine = `${INPUT_HINTS_HORIZONTAL}
${INPUT_HINTS_VERTICAL}
`
    assert.deepStrictEqual(parseHints(withExtraEmptyLine), EXPECTED_HINTS)
  })

  it('should handle two lines, plus extra empty lines in between', () => {
    const withExtraEmptyLinesInBetween = `${INPUT_HINTS_HORIZONTAL}


${INPUT_HINTS_VERTICAL}
`
    assert.deepStrictEqual(parseHints(withExtraEmptyLinesInBetween), EXPECTED_HINTS)
  })

  it('should handle two lines, plus extra comment lines', () => {
    const withExtraComments = `
    # comment here
    ${INPUT_HINTS_HORIZONTAL}

# another comment
${INPUT_HINTS_VERTICAL}

# last comment
`
    assert.deepStrictEqual(parseHints(withExtraComments), EXPECTED_HINTS)
  })

  it('should throw an Error when called with different amount of cells', () => {
    assert.throws(() => {
      parseHints(`
      ${INPUT_HINTS_HORIZONTAL}
      ${INPUT_HINTS_VERTICAL}, 4 4
      `)
    }, Error)
  })

  it('should throw an Error when called with no hints', () => {
    assert.throws(() => {
      parseHints(`
      # no hints here!
      `)
    }, Error)
  })
})
