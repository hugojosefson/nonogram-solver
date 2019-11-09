import { UNKNOWN } from './cell'

export const id = a => a
export const first = array => array[0]

export const widthOfGrid = grid => first(grid).length
export const heightOfGrid = grid => grid.length

export const widthOfHints = ([horizontalHints, verticalHints]) => horizontalHints.length
export const heightOfHints = ([horizontalHints, verticalHints]) => verticalHints.length

export const repeat = (repetitions, what = UNKNOWN) => Array(repetitions).fill(what)
export const s = o => JSON.stringify(o)
