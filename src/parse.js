import parse2Lines from './parse-2-lines'

export default input => {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string.')
  }

  const lines = input.trim().split('\n')
  if (lines.length === 2) {
    return parse2Lines(lines)
  }

  throw new Error('Input must be 2 lines of text.')
}
