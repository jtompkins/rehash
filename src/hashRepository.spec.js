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

  let repo

  beforeEach(() => {
    global.location.hash = HASH_STRING
    repo = new HashRepository([TEST_KEY, OTHER_KEY])
  })

  describe('_parseFragment', () => {
    it('returns an object', () => {
      const hash = repo._parseFragment(global.location.hash)

      expect(typeof hash).toBe('object')
    })

    it('returns the expected keys', () => {
      const hash = repo._parseFragment(global.location.hash)

      expect(Object.keys(hash)).toEqual([TEST_KEY, OTHER_KEY, UNMANAGED_KEY])
    })

    it('returns the expected values', () => {
      const hash = repo._parseFragment(global.location.hash)

      expect(Object.values(hash)).toEqual([
        TEST_VALUE,
        OTHER_VALUE,
        UNMANAGED_VALUE,
      ])
    })

    describe('when the hash fragment is empty', () => {
      it('returns an empty object', () => {
        global.location.hash = ''

        expect(repo._parseFragment(global.location.hash)).toEqual({})
      })
    })
  })

  describe('_buildFragment', () => {
    it('returns a well-formatted hash string', () => {
      const hash = repo._parseFragment(global.location.hash)

      expect(repo._buildFragment(hash)).toBe(HASH_STRING)
    })
  })

  describe('#get', () => {
    describe('when the key is in the hash', () => {
      it('returns a value from the hash fragment', () => {
        expect(repo.get(TEST_KEY)).toBe(TEST_VALUE)
      })
    })

    describe('when the key is not in the hash', () => {
      it('returns null', () => {
        expect(repo.get('aKeyNotInTheHash')).toBeNull()
      })
    })
  })

  describe('#set', () => {
    describe('when the key is in the set of managed keys', () => {
      it('modifies the hash fragment', () => {
        repo.set(TEST_KEY, NEW_VALUE)

        expect(global.location.hash.includes(encodeURI(NEW_VALUE))).toBeTruthy()
      })

      it('does not modify keys not managed by the repo', () => {
        repo.set(TEST_KEY, NEW_VALUE)

        const hashFragment = global.location.hash

        expect(hashFragment.includes(UNMANAGED_KEY)).toBeTruthy()
        expect(hashFragment.includes(encodeURI(UNMANAGED_VALUE))).toBeTruthy()
      })

      describe('when the value is null or undefined', () => {
        it('removes the key from the hash', () => {
          repo.set(TEST_KEY, null)

          expect(global.location.hash.includes(TEST_KEY)).toBeFalsy()
        })
      })
    })

    describe('when the key is not managed', () => {
      it('throws an error', () => {
        expect(() => repo.set(UNMANAGED_KEY, UNMANAGED_VALUE)).toThrow()
      })
    })
  })

  describe('#commit', () => {
    it('does nothing for now', () => {})
  })
})
