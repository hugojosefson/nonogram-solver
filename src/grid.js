import { heightOfHints, widthOfHints } from './fn'

const grid = (width, height = width) =>
  Array.from(
    { length: height },
    () => Array.from({ length: width })
  )
export default grid

export const fromHints = hints => grid(widthOfHints(hints), heightOfHints(hints))

export const column = (grid, index) => grid.map(row => row[index])
