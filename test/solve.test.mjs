/* eslint-env mocha */

import assert from 'assert'
import { placeHint } from '../src/solve-line-for-overlap'
import { FILLED } from '../src/cell'

const split = string => string.split('')
const line = () => split('abcdefghij')

describe('solve-line-for-overlap', () => {
  describe('place-hint', () => {
    it('should throw if hint is 0', () => {
      assert.throws(
        () => {
          placeHint(line(), 0, 0)
        },
        Error
      )
    })
    it('should throw if hint is > line', () => {
      assert.throws(
        () => {
          const inputLine = line()
          placeHint(inputLine, 0, inputLine.length + 1)
        },
        Error
      )
    })
    it('should fill 3 correctly from left', () => {
      const actual = placeHint(line(), 0, 3)
      const expected = [FILLED, FILLED, FILLED, ...split('defghij')]
      assert.deepStrictEqual(actual, expected)
    })
    it('should fill 3 correctly at right', () => {
      const actual = placeHint(line(), 7, 3)
      const expected = [...split('abcdefg'), FILLED, FILLED, FILLED]
      assert.deepStrictEqual(actual, expected)
    })
    it('should fill full line correctly', () => {
      const inputLine = line()
      const actual = placeHint(inputLine, 0, inputLine.length)
      const expected = [FILLED, FILLED, FILLED, FILLED, FILLED, FILLED, FILLED, FILLED, FILLED, FILLED]
      assert.deepStrictEqual(actual, expected)
    })
  })
})
