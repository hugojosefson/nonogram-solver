const grid = (width, height = width) =>
  Array.from(
    { length: height },
    () => Array.from({ length: width })
  )
export default grid

export const fromHints = ([horizontalHints, verticalHints]) => grid(horizontalHints.length, verticalHints.length)
