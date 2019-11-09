/* eslint-env mocha */

import assert from 'assert'
import { gridFromHints, parseHints } from '../src/api'
import { EXPECTED_HINTS } from './hint-fixtures'
import { heightOfGrid, widthOfGrid } from '../src/fn'
import { column } from '../src/grid'

describe('grid', () => {
  describe('from-hints', () => {
    it('should throw an Error when called without argument', () => {
      assert.throws(() => {
        gridFromHints()
      }, Error)
    })
    it('should create a 10x10 grid from 10x10 hints', () => {
      const grid = gridFromHints(EXPECTED_HINTS)
      assert.strictEqual(widthOfGrid(grid), 10)
      assert.strictEqual(heightOfGrid(grid), 10)
    })
    it('should create a 2x3 grid from 2x3 hints', () => {
      const grid = gridFromHints(parseHints(`1,1
      1,1,1`))
      assert.strictEqual(widthOfGrid(grid), 2)
      assert.strictEqual(heightOfGrid(grid), 3)
    })
  })
  describe('column', () => {
    it('should return second column correctly', () => {
      const grid = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [10, 11, 12]
      ]
      assert.deepStrictEqual(column(grid, 1), [2, 5, 8, 11])
    })
  })
})
