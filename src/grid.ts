import { heightOfHints, repeat, widthOfHints } from './fn'
import { UNKNOWN } from './cell'

// noinspection JSSuspiciousNameCombination
const grid = (width, height = width) =>
  Array.from(
    { length: height },
    () => repeat(width, UNKNOWN)
  )
export default grid

export const fromHints = hints => grid(widthOfHints(hints), heightOfHints(hints))

export const column = (grid, index) => grid.map(row => row[index])
