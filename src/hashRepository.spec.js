import HashRepository from './hashRepository'

describe(HashRepository, () => {
  const TEST_KEY = 'testKey'
  const TEST_VALUE = 'test value'
  const ENCODED_TEST_VALUE = encodeURI(TEST_VALUE)

  const OTHER_KEY = 'otherKey'
  const OTHER_VALUE = 'other value'
  const ENCODED_OTHER_VALUE = encodeURI(OTHER_VALUE)

  const UNMANAGED_KEY = 'unmanagedKey'
  const UNMANAGED_VALUE = 'unmanagedValue'

  const NEW_VALUE = 'new value'

  const HASH_STRING = `#${TEST_KEY}=${ENCODED_TEST_VALUE}&${OTHER_KEY}=${
    ENCODED_OTHER_VALUE
  }&${UNMANAGED_KEY}=${UNMANAGED_VALUE}`

  let store

  beforeEach(() => {
    global.location.hash = HASH_STRING
    store = new HashRepository([TEST_KEY, OTHER_KEY])
  })

  describe('_parseFragment', () => {
    it('returns an object', () => {
      const hash = store._parseFragment(global.location.hash)

      expect(typeof hash).toBe('object')
    })

    it('returns the expected keys', () => {
      const hash = store._parseFragment(global.location.hash)

      expect(Object.keys(hash)).toEqual([TEST_KEY, OTHER_KEY, UNMANAGED_KEY])
    })

    it('returns the expected values', () => {
      const hash = store._parseFragment(global.location.hash)

      expect(Object.values(hash)).toEqual([
        TEST_VALUE,
        OTHER_VALUE,
        UNMANAGED_VALUE,
      ])
    })
  })

  describe('_buildFragment', () => {
    it('returns a well-formatted hash string', () => {
      const hash = store._parseFragment(global.location.hash)

      expect(store._buildFragment(hash)).toBe(HASH_STRING)
    })
  })

  describe('#get', () => {
    describe('when the key is in the hash', () => {
      it('returns a value from the hash fragment', () => {
        expect(store.get(TEST_KEY)).toBe(TEST_VALUE)
      })
    })

    describe('when the key is not in the hash', () => {
      it('returns null', () => {
        expect(store.get('aKeyNotInTheHash')).toBeNull()
      })
    })
  })

  describe('#set', () => {
    describe('when the key is in the set of managed keys', () => {
      it('modifies the hash fragment', () => {
        store.set(TEST_KEY, NEW_VALUE)

        expect(global.location.hash.includes(encodeURI(NEW_VALUE))).toBeTruthy()
      })

      it('does not modify keys not managed by the repo', () => {
        store.set(TEST_KEY, NEW_VALUE)

        const hashFragment = global.location.hash

        expect(hashFragment.includes(UNMANAGED_KEY)).toBeTruthy()
        expect(hashFragment.includes(encodeURI(UNMANAGED_VALUE))).toBeTruthy()
      })

      describe('when the value is null or undefined', () => {
        it('removes the key from the hash', () => {
          store.set(TEST_KEY, null)

          expect(global.location.hash.includes(TEST_KEY)).toBeFalsy()
        })
      })
    })

    describe('when the key is not managed', () => {
      it('throws an error', () => {
        expect(() => store.set(UNMANAGED_KEY, UNMANAGED_VALUE)).toThrow()
      })
    })
  })

  describe('#commit', () => {
    it('does nothing for now', () => {})
  })
})
