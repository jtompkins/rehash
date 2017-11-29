import { parseQueryString, parseFragment } from './hashParseUtils'

describe('hashParseUtils', () => {
  describe('parseQueryString', () => {
    describe('when the query string is empty', () => {
      it('returns an empty object', () => {
        expect(parseQueryString('')).toEqual({})
      })
    })

    describe('when the query string is present', () => {
      it('returns an object representing the query string', () => {
        const queryString = 'aKey=aValue&anotherKey=anotherValue'
        const expectedObject = {
          aKey: 'aValue',
          anotherKey: 'anotherValue',
        }

        expect(parseQueryString(queryString)).toMatchObject(expectedObject)
      })
    })
  })

  describe('parseFragment', () => {
    const PATH = '/path/to/stuff'
    const QUERY_STRING = 'aKey=aValue&anotherKey=anotherValue'

    const ONLY_PATH = `#${PATH}`
    const ONLY_QUERY_STRING = `#?${QUERY_STRING}`
    const PATH_AND_QUERY_STRING = `#${PATH}?${QUERY_STRING}`
    const NO_PATH_NO_QUESTION_MARK = `#${QUERY_STRING}`

    describe('when the fragment is empty', () => {
      it('returns an object with default values', () => {
        expect(parseFragment('')).toEqual({ path: '', query: {} })
      })
    })

    describe('when there is a path in the fragment', () => {
      it('returns the path as a property', () => {
        expect(parseFragment(ONLY_PATH)).toHaveProperty('path')
      })
    })

    describe('when there is no path in the fragment', () => {
      it('returns an empty string in the return value', () => {
        const hash = parseFragment(ONLY_QUERY_STRING)

        expect(hash).toHaveProperty('path')
        expect(hash['path']).toEqual('')
      })
    })

    describe('when there is a query string in the fragment', () => {
      it('returns the query string as an object', () => {
        expect(parseFragment(ONLY_QUERY_STRING)).toHaveProperty('query')
      })
    })

    describe('when there is no query string in the fragment', () => {
      it('returns an empty object in the return value', () => {
        const hash = parseFragment(ONLY_PATH)

        expect(hash).toHaveProperty('query')
        expect(hash['query']).toEqual({})
      })
    })

    describe('when there is a query string with no ?', () => {
      it('returns an empty object in the path and a query object', () => {
        const hash = parseFragment(NO_PATH_NO_QUESTION_MARK)

        expect(hash).toHaveProperty('path')
        expect(hash['path']).toEqual('')

        expect(hash).toHaveProperty('query')
        expect(hash['query']).toHaveProperty('aKey')
        expect(hash['query']).toHaveProperty('anotherKey')
      })
    })
  })
})
