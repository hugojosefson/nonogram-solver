/* eslint-env mocha */

import assert from 'assert'
import solveLineForOverlap, { attemptPlaceHint } from '../src/solve-line-for-overlap'
import { isNothing, just, repeat, s } from '../src/fn'
import { CLEAR, CLEAR_AFTER_REQUESTED, displayLine, FILLED, UNKNOWN } from '../src/cell'

const line = () => repeat(10)

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
      hints: [6, 6],
      line: repeat(15),
      expected: [
        ...repeat(2),
        ...repeat(4, FILLED),
        ...repeat(3),
        ...repeat(4, FILLED),
        ...repeat(2)
      ]
    },
    {
      hints: [6, 5],
      line: repeat(15),
      expected: [
        ...repeat(3),
        ...repeat(3, FILLED),
        ...repeat(4),
        ...repeat(2, FILLED),
        ...repeat(3)
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
    },
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
    }
  ].forEach(({ hints, line, expected }) => {
    it(`overlapping ${s(hints)} in ${displayLine(line)} => ${displayLine(expected)}`, () => {
      const actual = solveLineForOverlap(hints, line)
      assert.deepStrictEqual(displayLine(actual), displayLine(expected))
    })
  })
})

describe('attempt-place-hint', () => {
  it('should return nothing if hint is 0', () => {
    assert.ok(isNothing(attemptPlaceHint(line(), 0, 0, 0)))
  })

  it('should return nothing if hint is > line', () => {
    const inputLine = line()
    assert.ok(isNothing(attemptPlaceHint(inputLine, 0, inputLine.length + 1, 0)))
  })

  it('should fill 3 correctly from left', () => {
    const actual = attemptPlaceHint(line(), 0, 3, 0)
    const expected = just([0, 0, 0, CLEAR_AFTER_REQUESTED, ...repeat(6)])
    assert.deepStrictEqual(actual, expected)
  })

  it('should fill 3 correctly at right', () => {
    const actual = attemptPlaceHint(line(), 7, 3, 0)
    const expected = just([...repeat(6), CLEAR, 0, 0, 0])
    assert.deepStrictEqual(actual, expected)
  })

  it('should fill full line correctly', () => {
    const inputLine = line()
    const actual = attemptPlaceHint(inputLine, 0, inputLine.length, 0)
    const expected = just(repeat(10, 0))
    assert.deepStrictEqual(actual, expected)
  })
})
