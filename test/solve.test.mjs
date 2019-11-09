/* eslint-env mocha */

import assert from 'assert'
import solveLineForOverlap, { placeHint } from '../src/solve-line-for-overlap'
import { repeat, s } from '../src/fn'
import { displayLine, FILLED, UNKNOWN } from '../src/cell'

const split = string => string.split('')
const line = () => split('abcdefghij')

describe('solve-line-for-overlap', () => {
  [
    {
      hints: [8],
      line: repeat(15),
      expected: [
        ...repeat(7), FILLED, ...repeat(7)
      ]
    },
    {
      hints: [5, 5],
      line: repeat(15),
      expected: [
        ...repeat(4), FILLED, ...repeat(5), FILLED, ...repeat(4)
      ]
    },
    {
      hints: [15],
      line: repeat(15),
      expected: repeat(15, FILLED)
    },
    {
      hints: [7],
      line: repeat(15),
      expected: repeat(15, UNKNOWN)
    },
    {
      hints: [14],
      line: repeat(15),
      expected: [
        UNKNOWN, ...repeat(13, FILLED), UNKNOWN
      ]
    }/*,
    {
      hints: [6, 8],
      line: repeat(15),
      expected: [
        ...repeat(6, FILLED), CLEAR, ...repeat(8, FILLED)
      ]
    },
    {
      hints: [7, 7],
      line: repeat(15),
      expected: [
        ...repeat(7, FILLED), CLEAR, ...repeat(7, FILLED)
      ]
    } */
  ].forEach(({ hints, line, expected }) => {
    it(`overlapping ${s(hints)} in ${displayLine(line)} => ${displayLine(expected)}`, () => {
      const actual = solveLineForOverlap(hints, line)
      assert.deepStrictEqual(displayLine(actual), displayLine(expected))
    })
  })
})

describe('place-hint', () => {
  it('should throw if hint is 0', () => {
    assert.throws(
      () => {
        placeHint(line(), 0, 0, 0)
      },
      Error
    )
  })
  it('should throw if hint is > line', () => {
    assert.throws(
      () => {
        const inputLine = line()
        placeHint(inputLine, 0, inputLine.length + 1, 0)
      },
      Error
    )
  })
  it('should fill 3 correctly from left', () => {
    const actual = placeHint(line(), 0, 3, 0)
    const expected = [0, 0, 0, ...split('defghij')]
    assert.deepStrictEqual(actual, expected)
  })
  it('should fill 3 correctly at right', () => {
    const actual = placeHint(line(), 7, 3, 0)
    const expected = [...split('abcdefg'), 0, 0, 0]
    assert.deepStrictEqual(actual, expected)
  })
  it('should fill full line correctly', () => {
    const inputLine = line()
    const actual = placeHint(inputLine, 0, inputLine.length, 0)
    const expected = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    assert.deepStrictEqual(actual, expected)
  })
})
