import { and, id, just, match, nothing, repeat } from './fn'
import { FILLED, displayLine, CLEAR, UNKNOWN } from './cell'

const isOutOfBounds = (line, cellOffset, hint) => hint < 1 || cellOffset + hint > line.length

const hasBorderLeftOf = (line, cellOffset) => cellOffset === 0
const hasBorderRightOf = (line, cellOffset, hint) => cellOffset + hint === line.length

const hasClearOrUnknownLeftOf = (line, cellOffset, hint, hintName) =>
  !hasBorderLeftOf(line, cellOffset, hint, hintName) &&
  [CLEAR, UNKNOWN].includes(line[cellOffset - 1])

const hasClearOrUnknownRightOf = (line, cellOffset, hint, hintName) =>
  !hasBorderRightOf(line, cellOffset, hint, hintName) &&
  [CLEAR, UNKNOWN].includes(line[cellOffset + 1])

const isAvailableFor = hintName => cell => [FILLED, hintName, UNKNOWN].includes(cell)
const canPaint = (line, cellOffset, hint, hintName) =>
  line
    .slice(cellOffset, cellOffset + hint)
    .every(isAvailableFor(hintName))

export const attemptPlaceHint = (line, cellOffset, hint, hintName) => {
  const args = [line, cellOffset, hint, hintName]
  if (isOutOfBounds(...args)) {
    return nothing
  }
  if (and(hasBorderLeftOf, hasBorderRightOf, canPaint)(...args)) {
    return just(repeat(hint, hintName))
  }
  if (and(hasBorderLeftOf, hasClearOrUnknownRightOf, canPaint)(...args)) {
    return just([
      ...repeat(hint, hintName),
      CLEAR,
      ...line.slice(cellOffset + hint + 1)
    ])
  }
  if (and(hasClearOrUnknownLeftOf, hasBorderRightOf, canPaint)(...args)) {
    return just([
      ...line.slice(0, cellOffset - 1),
      CLEAR,
      ...repeat(hint, hintName)
    ])
  }
  if (and(hasClearOrUnknownLeftOf, hasClearOrUnknownRightOf, canPaint)(...args)) {
    return just([
      ...line.slice(0, cellOffset - 1),
      CLEAR,
      ...repeat(hint, hintName),
      CLEAR,
      ...line.slice(cellOffset + hint + 1)
    ])
  }
  return nothing
}

const placeHintsFromLeft = ([hint, ...hints], line, cellOffset = 0, hintName = 0, hintNameModifier = id) => {
  if (typeof hint === 'undefined') {
    return line
  }
  if (isOutOfBounds(line, cellOffset, hint)) {
    return line
  }
  const maybeModifiedLine = attemptPlaceHint(line, cellOffset, hint, hintNameModifier(hintName))
  return match(
    maybeModifiedLine,
    () => placeHintsFromLeft([hint, ...hints], line, cellOffset + 1, hintName, hintNameModifier),
    modifiedLine => placeHintsFromLeft(hints, modifiedLine, cellOffset + hint + 1, hintName + 1, hintNameModifier)
  )
}

const placeHintsFromRight = (hints, line) =>
  placeHintsFromLeft(hints.reverse(), line.reverse(), 0, 0, hintIndex => hints.length - 1 - hintIndex).reverse()

const overlaps = (line, hintsFromLeft, hintsFromRight) =>
  line.map(
    (cell, index) => {
      const hintFromLeft = hintsFromLeft[index]
      const hintFromRight = hintsFromRight[index]
      // TODO: Only if the hint actually overlaps, should there be any CLEAR.
      // TODO: Also, left or right CLEAR are separate and should be considered separately.
      if (hintFromLeft === CLEAR && hintFromRight === CLEAR) {
        return CLEAR
      }

      if (!Number.isInteger(hintFromLeft)) {
        return cell
      }

      if (!Number.isInteger(hintFromRight)) {
        return cell
      }

      if (hintFromLeft === hintFromRight) {
        return FILLED
      } else {
        return cell
      }
    }
  )

const solveLineForOverlap = (hints, line) => {
  const placedFromLeft = placeHintsFromLeft(hints, line)
  const placedFromRight = placeHintsFromRight(hints, line)
  console.log(`placedFromLeft:  ${displayLine(placedFromLeft)}`)
  console.log(`placedFromRight: ${displayLine(placedFromRight)}`)
  return overlaps(line, placedFromLeft, placedFromRight)
}
export default solveLineForOverlap
