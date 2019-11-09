import parse1LineOfHints from './parse-1-line-of-hints'

export default linesOfHints => {
  if (linesOfHints.length !== 2) {
    throw new Error('linesOfHints must be an array of 2 strings.')
  }

  return linesOfHints.map(parse1LineOfHints)
}
