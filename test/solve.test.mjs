/* eslint-env mocha */

import t from 'tap'
import solveLineForOverlap, { attemptPlaceHint } from '../src/solve-line-for-overlap'
import { isNothing, just, leftPad, repeat, s } from '../src/fn'
import { CLEAR, CLEAR_AFTER_REQUESTED, displayLine, FILLED, UNKNOWN } from '../src/cell'

t.mochaGlobals()

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
    },
    {
      hints: [5, 5],
      line: [
        ...repeat(5),
        ...repeat(5, CLEAR),
        ...repeat(5)
      ],
      expected: [
        ...repeat(5, FILLED),
        ...repeat(5, CLEAR),
        ...repeat(5, FILLED)
      ]
    },
    {
      hints: [1, 8],
      line: [
        ...repeat(1, FILLED),
        ...repeat(13),
        ...repeat(1, FILLED)
      ],
      expected: [
        ...repeat(1, FILLED),
        ...repeat(1, CLEAR),
        ...repeat(4),
        ...repeat(1, CLEAR),
        ...repeat(8, FILLED)
      ]
    }
  ].forEach(({ hints, line, expected }) => {
    it(`overlapping ${leftPad(10, s(hints))} in ${displayLine(line)} => ${displayLine(expected)}`, () => {
      const actual = solveLineForOverlap(hints, line)
      t.strictSame(displayLine(actual), displayLine(expected))
    })
  })
})

describe('attempt-place-hint', () => {
  it('should return nothing if hint is 0', () => {
    t.ok(isNothing(attemptPlaceHint(line(), 0, 0, 0)))
  })

  it('should return nothing if hint is > line', () => {
    const inputLine = line()
    t.ok(isNothing(attemptPlaceHint(inputLine, 0, inputLine.length + 1, 0)))
  })

  it('should fill 3 correctly from left', () => {
    const actual = attemptPlaceHint(line(), 0, 3, 0)
    const expected = just([0, 0, 0, CLEAR_AFTER_REQUESTED, ...repeat(6)])
    t.strictSame(actual, expected)
  })

  it('should fill 3 correctly at right', () => {
    const actual = attemptPlaceHint(line(), 7, 3, 0)
    const expected = just([...repeat(6), CLEAR, 0, 0, 0])
    t.strictSame(actual, expected)
  })

  it('should fill full line correctly', () => {
    const inputLine = line()
    const actual = attemptPlaceHint(inputLine, 0, inputLine.length, 0)
    const expected = just(repeat(10, 0))
    t.strictSame(actual, expected)
  })
})
