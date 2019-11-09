export const FILLED = Symbol('▮')
export const EMPTY = Symbol(' ')

export const isFilled = cell => cell === FILLED
export const isEmpty = cell => cell === EMPTY
export const isUndefined = cell => typeof cell === 'undefined'
