import { and, displayLine, displayMaybeLine, id, just, match, nothing, repeat, s } from './fn'
import { CLEAR, CLEAR_AFTER_REQUESTED, CLEAR_BEFORE_REQUESTED, CLEAR_PADDING_REQUESTED, FILLED, UNKNOWN } from './cell'

const isOutOfBounds = (line, cellOffset, hint) => cellOffset < 0 || cellOffset + hint > line.length

const hasBorderLeftOf = (line, cellOffset) => cellOffset === 0
const hasBorderRightOf = (line, cellOffset, hint) => cellOffset + hint === line.length

const hasClearOrUnknownLeftOf = (line, cellOffset, hint, hintName) =>
  !hasBorderLeftOf(line, cellOffset, hint, hintName) &&
  [CLEAR, UNKNOWN, CLEAR_BEFORE_REQUESTED, CLEAR_AFTER_REQUESTED, CLEAR_PADDING_REQUESTED].includes(line[cellOffset - 1])

const hasClearOrUnknownRightOf = (line, cellOffset, hint, hintName) =>
  !hasBorderRightOf(line, cellOffset, hint, hintName) &&
  [CLEAR, UNKNOWN, CLEAR_BEFORE_REQUESTED, CLEAR_AFTER_REQUESTED, CLEAR_PADDING_REQUESTED].includes(line[cellOffset + 1])

const isAvailableToPaintHint = hintName => cell => [FILLED, hintName, UNKNOWN].includes(cell)
const isAvailableToClear = cell => [CLEAR, UNKNOWN, CLEAR_AFTER_REQUESTED, CLEAR_BEFORE_REQUESTED, CLEAR_PADDING_REQUESTED].includes(cell)
const canPaint = (line, cellOffset, hint, hintName) =>
  line
    .slice(cellOffset, cellOffset + hint)
    .every(isAvailableToPaintHint(hintName))

const canClear = (line, cellOffset) =>
  line
    .slice(cellOffset, line.length)
    .every(isAvailableToClear)

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
      CLEAR_AFTER_REQUESTED,
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
      CLEAR_AFTER_REQUESTED,
      ...line.slice(cellOffset + hint + 1)
    ])
  }
  return nothing
}

export const attemptPlaceClearForTheRest = (line, cellOffset) => {
  if (isOutOfBounds(line, cellOffset, 0)) {
    return nothing
  }
  if (hasBorderRightOf(line, cellOffset, 0)) {
    return just(line)
  }
  if (canClear(line, cellOffset)) {
    return just([
      ...line.slice(0, cellOffset),
      ...repeat(line.length - cellOffset, CLEAR_PADDING_REQUESTED)
    ])
  }
  return nothing
}

const placeHintsFromLeft = ([hint, ...hints], line, cellOffset = 0, hintName = 0, hintNameModifier = id) => {
  if (isOutOfBounds(line, cellOffset, hint || 1)) {
    return nothing
  }
  if (typeof hint === 'undefined') {
    if (cellOffset === line.length + 1) {
      return just(line)
    }
    const maybeClearedTheRest = attemptPlaceClearForTheRest(line, cellOffset)
    return match(
      maybeClearedTheRest,
      () => placeHintsFromLeft([hint, ...hints], line, cellOffset + 1, hintName, hintNameModifier),
      clearedTheRest => just(clearedTheRest)
    )
  }
  const maybeModifiedLine = attemptPlaceHint(line, cellOffset, hint, hintNameModifier(hintName))
  return match(
    maybeModifiedLine,
    () => placeHintsFromLeft([hint, ...hints], line, cellOffset + 1, hintName, hintNameModifier),
    modifiedLine => {
      return placeHintsFromLeft(hints, modifiedLine, cellOffset + hint + 1, hintName + 1, hintNameModifier)
    }
  )
}

const reverseClearRequest = cell => {
  switch (cell) {
    case CLEAR_BEFORE_REQUESTED:
      return CLEAR_AFTER_REQUESTED
    case CLEAR_AFTER_REQUESTED:
      return CLEAR_BEFORE_REQUESTED
    default:
      return cell
  }
}

const placeHintsFromRight = (hints, line) => {
  const maybeModifiedLine = placeHintsFromLeft(
    hints.reverse(),
    line.reverse(),
    0,
    0,
    hintIndex => hints.length - 1 - hintIndex
  )
  const maybeReversedModifiedLine = maybeModifiedLine
    .map(modifiedLine => {
      return modifiedLine
        .reverse()
        .map(reverseClearRequest)
    })
  return maybeReversedModifiedLine
}

const overlaps = (line, hintsFromLeft, hintsFromRight) =>
  line.map(
    (cellFromLine, index) => {
      const hintFromLeft = hintsFromLeft[index]
      const hintFromRight = hintsFromRight[index]

      if (hintFromLeft === hintFromRight) {
        const hint = hintFromLeft
        if (Number.isInteger(hint)) {
          return FILLED
        }
        return hint
      }

      const bothAreIntegers = Number.isInteger(hintFromLeft) && Number.isInteger(hintFromRight)
      if (bothAreIntegers) {
        return UNKNOWN
      }

      return cellFromLine
    }
  )

const solveLineForOverlap = (hints, line) => {
  const maybePlacedFromLeft = placeHintsFromLeft(hints, line)
  const maybePlacedFromRight = placeHintsFromRight(hints, line)

  console.log(`hints:           ${s(hints)}`)
  console.log(`line:            ${s(displayLine(line))}`)
  console.log(`placedFromLeft:  ${displayMaybeLine(maybePlacedFromLeft)}`)
  console.log(`placedFromRight: ${displayMaybeLine(maybePlacedFromRight)}`)

  const result = match(
    maybePlacedFromLeft,
    () => nothing,
    left => match(
      maybePlacedFromRight,
      () => nothing,
      right => just(overlaps(line, left, right))
    )
  )
  return result
}
export default solveLineForOverlap
