import { id, repeat } from './fn'
import { FILLED, displayLine } from './cell'

const canPlaceHint = () => true

export const placeHint = (line, cellOffset, hint, hintIndex) => {
  if (hint < 1 || cellOffset + hint > line.length) {
    throw new Error('hint out of bounds')
  }
  // TODO: place CLEAR around the hint
  return [
    ...line.slice(0, cellOffset),
    ...repeat(hint, hintIndex),
    ...line.slice(cellOffset + hint)
  ]
}
const placeHintsFromLeft = (hints, line, hintIndexModifier = id) => {
  let cellOffset = 0
  return hints.reduce((acc, hint, hintIndex) => {
    // TODO: replace with attemptReplaceHint, returning [modifiedLine] if possible, [] if impossible
    if (canPlaceHint(acc, cellOffset, hint)) {
      const modifiedLine = placeHint(acc, cellOffset, hint, hintIndexModifier(hintIndex))
      cellOffset += hint
      cellOffset++
      return modifiedLine
    } else {
      return acc
    }
  }, line)
}

const placeHintsFromRight = (hints, line) =>
  placeHintsFromLeft(
    hints.reverse(),
    line.reverse(),
    hintIndex => hints.length - 1 - hintIndex
  ).reverse()

const overlaps = (line, hintsFromLeft, hintsFromRight) =>
  line.map(
    (cell, index) => {
      const hintFromLeft = hintsFromLeft[index]
      const hintFromRight = hintsFromRight[index]

      if (!Number.isInteger(hintFromLeft)) {
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
