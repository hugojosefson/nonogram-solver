import { s } from './fn'

export const FILLED = Symbol('▮')
export const CLEAR = Symbol('.')
export const UNKNOWN = Symbol(' ')

export const displayCell = cell => Number.isInteger(cell) ? cell : cell.description
export const displayLine = line => s(line.map(displayCell).join(''))
