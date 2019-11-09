export const parseHintsForOneLine =
    stringOfNumbersAndSpaces =>
      stringOfNumbersAndSpaces
        .trim()
        .split(/ +/)
        .map(numberString => parseInt(numberString, 10))

export default inputLineOfHints =>
  inputLineOfHints.split(',')
    .map(parseHintsForOneLine)
