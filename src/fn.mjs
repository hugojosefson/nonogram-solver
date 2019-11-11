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

export const match = (maybe, inCaseOfNothing, inCaseOfJust) => isJust(maybe) ? inCaseOfJust(head(maybe)) : inCaseOfNothing()
export const isJust = a => !!a.length
export const isNothing = a => !isJust(a)
export const just = a => [a]
export const nothing = []
export const displayCell = cell => typeof cell === 'symbol' ? cell.description : cell
export const displayLine = line => line.map(displayCell).join('')
export const displayMaybeLine = maybeLine => match(maybeLine, () => 'nothing', line => `just(${displayLine(line)})`)

export const widthOfGrid = grid => head(grid).length
export const heightOfGrid = grid => grid.length

export const widthOfHints = ([horizontalHints, verticalHints]) => horizontalHints.length
export const heightOfHints = ([horizontalHints, verticalHints]) => verticalHints.length

export const repeat = (repetitions, what = UNKNOWN) => Array(repetitions).fill(what)
export const s = o => JSON.stringify(o)
export const leftPad = (totalLength, s) => `${repeat(totalLength - s.length, ' ').join('')}${s}`
