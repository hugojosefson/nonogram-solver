/* eslint-env mocha */

import assert from 'assert'
import { gridFromHints, parseHints } from '../src/api'
import { EXPECTED_HINTS } from './hint-fixtures'
import { height, width } from '../src/fn'

describe('grid', () => {
  describe('from-hints', () => {
    it('should throw an Error when called without argument', () => {
      assert.throws(() => {
        gridFromHints()
      }, Error)
    })
    it('should create a 10x10 grid from 10x10 hints', () => {
      const grid = gridFromHints(EXPECTED_HINTS)
      assert.strictEqual(width(grid), 10)
      assert.strictEqual(height(grid), 10)
    })
    it('should create a 2x3 grid from 2x3 hints', () => {
      const grid = gridFromHints(parseHints(`1,1
      1,1,1`))
      assert.strictEqual(width(grid), 2)
      assert.strictEqual(height(grid), 3)
    })
  })
})
