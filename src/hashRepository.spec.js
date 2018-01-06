import HashRepository from './hashRepository'
import { parseFragment } from './util/hashParseUtils'
import { randomBytes } from 'crypto'

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
  const URL_WITH_QUERYSTRING = 'http://example.com/details?a=b'
  const ENCODED_URL_WITH_QUERYSTRING =
    'http%3A%2F%2Fexample.com%2%2Fdetails%3Fa%3Db'

  const HASH_STRING = `#?${TEST_KEY}=${ENCODED_TEST_VALUE}&${OTHER_KEY}=${
    ENCODED_OTHER_VALUE
  }&${UNMANAGED_KEY}=${UNMANAGED_VALUE}`

  let repo

  beforeEach(() => {
    global.location.hash = HASH_STRING
    repo = new HashRepository([TEST_KEY, OTHER_KEY])
  })

  describe('_buildFragment', () => {
    it('returns a well-formatted hash string', () => {
      const { path, query } = parseFragment(global.location.hash)

      expect(repo._buildFragment(path, query)).toBe(HASH_STRING)
    })

    describe('when a null or undefined value is in the input', () => {
      it('is not included in the output string', () => {
        const hash = {
          TEST_KEY: null,
          OTHER_KEY: undefined,
        }

        const fragment = repo._buildFragment('', hash)

        expect(fragment).not.toContain(TEST_KEY)
        expect(fragment).not.toContain(OTHER_KEY)
      })
    })

    describe('when there is a path in the hash', () => {
      it('includes the path in the output', () => {
        const path = '/a/path/to/somewhere'
        const { query } = parseFragment(global.location.hash)

        const fragment = repo._buildFragment(path, query)

        expect(fragment).toContain(path)
      })
    })

    describe('when there are keys in the query that are not managed', () => {
      it('includes the non-managed keys', () => {
        const { query } = parseFragment(global.location.hash)
        const fragment = repo._buildFragment('', query)

        expect(fragment).toContain(UNMANAGED_KEY)
        expect(fragment).toContain(encodeURI(UNMANAGED_VALUE))
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

    describe('when a URL with a query string is in the state', () => {
      it('reserializes properly into the original URL', () => {
        const repo = new HashRepository([TEST_KEY])
        repo.set({ [TEST_KEY]: URL_WITH_QUERYSTRING })

        const state = repo.get()

        expect(state).toHaveProperty(TEST_KEY)
        expect(state[TEST_KEY]).toEqual(URL_WITH_QUERYSTRING)
      })
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

    describe('when a URL with a querystring is added to state', () => {
      it('properly URI encodes the URL', () => {
        repo.set({ [TEST_KEY]: URL_WITH_QUERYSTRING })

        expect(global.location.hash.includes(ENCODED_URL_WITH_QUERYSTRING))
      })
    })
  })
})
