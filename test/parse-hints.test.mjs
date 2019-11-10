/* eslint-env mocha */

import t from 'tap'
import assert from 'assert'
import { parseHints } from '../src/api'
import { INPUT_HINTS_HORIZONTAL, INPUT_HINTS_VERTICAL, EXPECTED_HINTS } from './hint-fixtures'

t.mochaGlobals()

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
  t.strictSame(parseHints(twoLineString), EXPECTED_HINTS)
})

it('should handle two lines, plus extra empty line', () => {
  const withExtraEmptyLine = `${INPUT_HINTS_HORIZONTAL}
${INPUT_HINTS_VERTICAL}
`
  t.strictSame(parseHints(withExtraEmptyLine), EXPECTED_HINTS)
})

it('should handle two lines, plus extra empty lines in between', () => {
  const withExtraEmptyLinesInBetween = `${INPUT_HINTS_HORIZONTAL}


${INPUT_HINTS_VERTICAL}
`
  t.strictSame(parseHints(withExtraEmptyLinesInBetween), EXPECTED_HINTS)
})

it('should handle two lines, plus extra comment lines', () => {
  const withExtraComments = `
    # comment here
    ${INPUT_HINTS_HORIZONTAL}

# another comment
${INPUT_HINTS_VERTICAL}

# last comment
`
  t.strictSame(parseHints(withExtraComments), EXPECTED_HINTS)
})

it('should allow non-square rectangular hints', () => {
  parseHints(`
      ${INPUT_HINTS_HORIZONTAL}
      ${INPUT_HINTS_VERTICAL}, 4 4
      `)
})

it('should throw an Error when called with no hints', () => {
  assert.throws(() => {
    parseHints(`
      # no hints here!
      `)
  }, Error)
})
