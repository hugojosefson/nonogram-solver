export const first = array => array[0]

export const widthOfGrid = grid => first(grid).length
export const heightOfGrid = grid => grid.length

export const widthOfHints = ([horizontalHints, verticalHints]) => horizontalHints.length
export const heightOfHints = ([horizontalHints, verticalHints]) => verticalHints.length

export const repeat = what => repetitions => Array(repetitions).fill(what)
