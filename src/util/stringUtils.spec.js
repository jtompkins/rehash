import { isNullOrEmpty } from './stringUtils'

describe('stringUtils', () => {
  describe('isNullOrEmpty', () => {
    describe('when the string is null', () => {
      it('returns true', () => {
        expect(isNullOrEmpty(null)).toBe(true)
      })
    })

    describe('when the string is undefined', () => {
      it('returns true', () => {
        expect(isNullOrEmpty(undefined)).toBe(true)
      })
    })

    describe('when the string is empty', () => {
      it('returns true', () => {
        expect(isNullOrEmpty('')).toBe(true)
      })
    })

    describe('when the string has a value', () => {
      it('returns false', () => {
        expect(isNullOrEmpty('a string')).toBe(false)
      })
    })
  })
})
