import { s } from './fn'

export const FILLED = Symbol('▮')
export const CLEAR = Symbol('.')
export const CLEAR_BEFORE_REQUESTED = Symbol('[')
export const CLEAR_AFTER_REQUESTED = Symbol(']')
export const UNKNOWN = Symbol(' ')

export const displayCell = cell => typeof cell === 'symbol' ? cell.description : cell
export const displayLine = line => s(line.map(displayCell).join(''))
