import parse2LinesOfHints from './parse-2-lines-of-hints'

export default input => {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string.')
  }

  const lines = input.trim().split('\n')
    .map(line => line.replace(/#.*/g, ''))
    .map(line => line.trim())
    .filter(line => line.length)
  if (lines.length === 2) {
    return parse2LinesOfHints(lines)
  }

  throw new Error('Input must be 2 lines of hints.')
}
