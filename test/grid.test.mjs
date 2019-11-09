/* eslint-env mocha */

import assert from 'assert'
import { gridFromHints } from '../src/api'
import { EXPECTED_HINTS } from './hint-fixtures'
import { first } from '../src/fn'

describe('grid', () => {
  describe('from-hints', () => {
    it('should throw an Error when called without argument', () => {
      assert.throws(() => {
        gridFromHints()
      }, Error)
    })
    it('should create a 10x10 grid from 10x10 hints', () => {
      const [...actualGridRows] = gridFromHints(EXPECTED_HINTS)
      const actualWidth = first(actualGridRows).length
      const actualHeight = actualGridRows.length
      assert.strictEqual(actualWidth, 10)
      assert.strictEqual(actualHeight, 10)
    })
  })
})
