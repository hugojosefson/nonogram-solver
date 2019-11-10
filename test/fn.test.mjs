/* eslint-env mocha */

import t from 'tap'
import { and } from '../src/fn'

t.mochaGlobals()

describe('and', () => {
  describe('should return a function', () => {
    it('without arguments', () => t.strictSame(typeof and(), 'function'))
    it('() => true', () => t.strictSame(typeof and(() => true), 'function'))
    it('() => true, () => true', () => t.strictSame(typeof and(() => true, () => true), 'function'))
  })
  describe('when called', () => {
    describe('should return true', () => {
      it('without arguments', () => t.ok(and()()))
      it('() => true', () => t.ok(and(() => true)()))
      it('() => true, () => true', () => t.ok(and(() => true, () => true)()))
      it('() => true, () => true, () => true', () => t.ok(and(() => true, () => true, () => true)()))
    })
    describe('should return false', () => {
      it('() => false', () => t.ok(!and(() => false)()))
      it('() => true, () => false', () => t.ok(!and(() => true, () => false)()))
      it('() => false, () => true', () => t.ok(!and(() => false, () => true)()))
      it('() => true, () => false, () => true', () => t.ok(!and(() => true, () => false, () => true)()))
      it('() => false, () => true, () => true', () => t.ok(!and(() => false, () => true, () => true)()))
    })
    it('should pass on all arguments to all functions', () => {
      let fn1called = false
      let fn2called = false
      const fn1 = (arg1, arg2, arg3) => {
        t.strictSame(arg1, 'arg1contents')
        t.strictSame(arg2, 'arg2contents')
        t.strictSame(arg3, 'arg3contents')
        fn1called = true
        return true
      }
      const fn2 = (arg1, arg2, arg3) => {
        t.strictSame(arg1, 'arg1contents')
        t.strictSame(arg2, 'arg2contents')
        t.strictSame(arg3, 'arg3contents')
        fn2called = true
        return true
      }
      t.ok(and(fn1, fn2)('arg1contents', 'arg2contents', 'arg3contents'))
      t.ok(fn1called)
      t.ok(fn2called)
    })
  })
})
