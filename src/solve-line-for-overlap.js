import { id, just, match, nothing, repeat } from './fn'
import { FILLED, displayLine } from './cell'

export const attemptPlaceHint = (line, cellOffset, hint, hintIndex) => {
  if (hint < 1 || cellOffset + hint > line.length) {
    return nothing
  }
  // TODO: place CLEAR around the hint
  return just([
    ...line.slice(0, cellOffset),
    ...repeat(hint, hintIndex),
    ...line.slice(cellOffset + hint)
  ])
}

const placeHintsFromLeft = (hints, line, hintIndexModifier = id) => {
  let cellOffset = 0
  return hints.reduce((acc, hint, hintIndex) => {
    const maybeModifiedLine = attemptPlaceHint(acc, cellOffset, hint, hintIndexModifier(hintIndex))
    return match(
      maybeModifiedLine,
      () => acc,
      modifiedLine => {
        cellOffset += hint
        cellOffset++
        return modifiedLine
      }
    )
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
