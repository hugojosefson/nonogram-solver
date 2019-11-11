import { UNKNOWN } from './cell'

export const id = a => a
export const isUndefined = a => typeof a === 'undefined'

export const head = array => array[0]

export const and = (fn, ...fns) => {
  if (isUndefined(fn)) {
    return () => true
  }
  return (...args) => fn(...args) && and(...fns)(...args)
}

export const match = (maybe, inCaseOfNothing, inCaseOfJust) => {
  if (isJust(maybe)) {
    return inCaseOfJust(head(maybe))
  }
  if (isNothing(maybe)) {
    return inCaseOfNothing()
  }
  console.error(`Unexpected maybe: ${s(maybe)}`)
  throw new Error('Unexpected maybe.')
}
export const isJust = a => { return a.length === 1 }
export const isNothing = a => a.length === 0
export const just = a => [a]
export const nothing = []
export const displayCell = cell => typeof cell === 'symbol' ? cell.description : cell
export const displayLine = line => {
  const mapped = line.map(displayCell)
  const joined = mapped.join('')
  return joined
}
export const displayMaybeLine = maybeLine => match(maybeLine, () => 'nothing', line => `just(${displayLine(line)})`)

export const widthOfGrid = grid => head(grid).length
export const heightOfGrid = grid => grid.length

export const widthOfHints = ([horizontalHints, verticalHints]) => horizontalHints.length
export const heightOfHints = ([horizontalHints, verticalHints]) => verticalHints.length

export const repeat = (repetitions, what = UNKNOWN) => Array(repetitions).fill(what)
export const s = o => JSON.stringify(o)
export const leftPad = (totalLength, s) => `${repeat(totalLength - s.length, ' ').join('')}${s}`
