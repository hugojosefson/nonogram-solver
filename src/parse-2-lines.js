export default lines => {
  if (lines.length !== 2) {
    throw new Error('lines must be an array of 2 strings.')
  }

  return lines
}
