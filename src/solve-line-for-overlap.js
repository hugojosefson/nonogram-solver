import { repeat } from './fn'
import { FILLED } from './cell'

const fill = repeat(FILLED)

const canPlaceHint = () => true

export const placeHint = (line, cellOffset, hint) => {
  if (hint < 1 || cellOffset + hint > line.length) {
    throw new Error('hint out of bounds')
  }
  return [
    ...line.slice(0, cellOffset),
    ...fill(hint),
    ...line.slice(cellOffset + hint)
  ]
}
const placeHintsFromLeft = (line, hints) => {
  let cellOffset = 0
  return hints.map(hint => {
    if (canPlaceHint(line, cellOffset, hint)) {
      const modifiedLine = placeHint(line, cellOffset, hint)
      cellOffset += hint
      cellOffset++
      return modifiedLine
    } else {
      return line
    }
  })
}

export default (line, hints) => {
  const placedFromLeft = placeHintsFromLeft(line, hints)
  const placedFromRight = placeHintsFromRight(line, hints)
  return overlaps(placedFromLeft, placedFromRight)
}
