export default lineOfHints =>
  lineOfHints.split(',')
    .map(stringOfNumbersAndSpaces => stringOfNumbersAndSpaces.trim().split(/ +/))
    .map(arrayOfNumberStrings => arrayOfNumberStrings.map(numberString => parseInt(numberString, 10)))
