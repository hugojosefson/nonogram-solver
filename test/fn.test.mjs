/* eslint-env mocha */

import assert from 'assert'
import { and } from '../src/fn'

describe('fn', () => {
  describe('and', () => {
    describe('should return a function', () => {
      it('without arguments', () => assert.strictEqual(typeof and(), 'function'))
      it('() => true', () => assert.strictEqual(typeof and(() => true), 'function'))
      it('() => true, () => true', () => assert.strictEqual(typeof and(() => true, () => true), 'function'))
    })
    describe('when called', () => {
      describe('should return true', () => {
        it('without arguments', () => assert.ok(and()()))
        it('() => true', () => assert.ok(and(() => true)()))
        it('() => true, () => true', () => assert.ok(and(() => true, () => true)()))
        it('() => true, () => true, () => true', () => assert.ok(and(() => true, () => true, () => true)()))
      })
      describe('should return false', () => {
        it('() => false', () => assert.ok(!and(() => false)()))
        it('() => true, () => false', () => assert.ok(!and(() => true, () => false)()))
        it('() => false, () => true', () => assert.ok(!and(() => false, () => true)()))
        it('() => true, () => false, () => true', () => assert.ok(!and(() => true, () => false, () => true)()))
        it('() => false, () => true, () => true', () => assert.ok(!and(() => false, () => true, () => true)()))
      })
      it('should pass on all arguments to all functions', () => {
        let fn1called = false
        let fn2called = false
        const fn1 = (arg1, arg2, arg3) => {
          assert.strictEqual(arg1, 'arg1contents')
          assert.strictEqual(arg2, 'arg2contents')
          assert.strictEqual(arg3, 'arg3contents')
          fn1called = true
          return true
        }
        const fn2 = (arg1, arg2, arg3) => {
          assert.strictEqual(arg1, 'arg1contents')
          assert.strictEqual(arg2, 'arg2contents')
          assert.strictEqual(arg3, 'arg3contents')
          fn2called = true
          return true
        }
        assert.ok(and(fn1, fn2)('arg1contents', 'arg2contents', 'arg3contents'))
        assert.ok(fn1called)
        assert.ok(fn2called)
      })
    })
  })
})
