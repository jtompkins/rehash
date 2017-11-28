import HashRepository from './hashRepository'

describe('HashRepository', () => {
  const TEST_KEY = 'testKey'
  const TEST_VALUE = 'test value'
  const ENCODED_TEST_VALUE = encodeURI(TEST_VALUE)

  const OTHER_KEY = 'otherKey'
  const OTHER_VALUE = 'other value'
  const ENCODED_OTHER_VALUE = encodeURI(OTHER_VALUE)

  const UNMANAGED_KEY = 'unmanagedKey'
  const UNMANAGED_VALUE = 'unmanagedValue'

  const NULL_KEY = 'nullKey'

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

    describe('when a null or undefined value is in the input', () => {
      it('is not included in the output string', () => {
        const hash = {
          TEST_KEY: null,
          OTHER_KEY: undefined,
        }

        const fragment = repo._buildFragment(hash)

        expect(fragment).not.toContain(TEST_KEY)
        expect(fragment).not.toContain(OTHER_KEY)
      })
    })
  })

  describe('#get', () => {
    it('returns the values of all of the managed keys', () => {
      const state = repo.get()

      expect(state).toHaveProperty(TEST_KEY)
      expect(state).toHaveProperty(OTHER_KEY)
    })

    it('does not return the values for unmanaged keys', () => {
      expect(repo.get()).not.toHaveProperty(UNMANAGED_KEY)
    })

    it('includes null values for keys not in the hash fragment', () => {
      const repo = new HashRepository([TEST_KEY, OTHER_KEY, NULL_KEY])
      const state = repo.get()

      expect(state).toHaveProperty(NULL_KEY)
      expect(state[NULL_KEY]).toBeNull()
    })
  })

  describe('#set', () => {
    describe('when the input is not an object', () => {
      it('throws an error', () => {
        expect(() => repo.set(TEST_VALUE)).toThrow()
      })
    })

    describe('when the keys are in the set of managed keys', () => {
      it('modifies the hash fragment', () => {
        repo.set({ [TEST_KEY]: NEW_VALUE })

        expect(global.location.hash.includes(encodeURI(NEW_VALUE))).toBeTruthy()
      })

      it('does not modify keys not managed by the repo', () => {
        repo.set({ [TEST_KEY]: NEW_VALUE })

        const hashFragment = global.location.hash

        expect(hashFragment.includes(UNMANAGED_KEY)).toBeTruthy()
        expect(hashFragment.includes(encodeURI(UNMANAGED_VALUE))).toBeTruthy()
      })

      describe('when a value is null or undefined', () => {
        it('removes the key from the hash', () => {
          repo.set({ [TEST_KEY]: null })

          expect(global.location.hash.includes(TEST_KEY)).toBeFalsy()
        })
      })
    })

    describe('when a key is not managed', () => {
      it('throws an error', () => {
        expect(() => repo.set({ [UNMANAGED_KEY]: UNMANAGED_VALUE })).toThrow()
      })
    })
  })
})
