import { first } from './fn'
import parse1LineOfHints from './parse-1-line-of-hints'

export default input => {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string.')
  }

  const linesOfHints = input.trim().split('\n')
    .map(line => line.replace(/#.*/g, ''))
    .map(line => line.trim())
    .filter(line => line.length)

  if (linesOfHints.length === 2) {
    const hints = linesOfHints.map(parse1LineOfHints)
    const width = first(hints).length
    if (hints.find(row => row.length !== width)) {
      throw new Error('All hints lines must have the same number of cells, separated by comma (,)')
    }

    return hints
  }

  throw new Error('Input must be 2 lines of hints.')
}
