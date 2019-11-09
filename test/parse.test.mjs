/* eslint-env mocha */

import assert from 'assert'
import { parse } from '../src/api'

describe('parse', () => {
  it('should throw an Error when called without argument', () => {
    assert.throws(() => {
      parse()
    }, Error)
  })
})
