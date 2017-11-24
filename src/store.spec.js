import Store from './store'
import HashRepository from './hashRepository'
import FakeHashRepository from './fakes/fakeHashRepository'

describe(Store, () => {
  describe('constructor', () => {
    describe('when a hash repository is not provided', () => {
      it('uses the default implementation', () => {
        const store = new Store({})

        expect(store.repo instanceof HashRepository).toBeTruthy()
      })
    })

    describe('when a hash repository is provided', () => {
      it('uses the provided repository', () => {
        const store = new Store({}, new FakeHashRepository())

        expect(store.repo instanceof FakeHashRepository).toBeTruthy()
      })
    })
  })

  describe('subscribe', () => {
    it('returns an ID', () => {
      const store = new Store({})

      const id = store.subscribe(() => true)

      expect(typeof id).toBe('number')
    })

    it('returns different IDs for each subscriber', () => {
      const store = new Store({})

      const firstId = store.subscribe(() => true)
      const secondId = store.subscribe(() => false)

      expect(firstId).not.toEqual(secondId)
    })
  })

  describe('unsubscribe', () => {
    describe('when the ID is registered', () => {
      it('removes the ID and returns true', () => {
        const store = new Store({})
        const id = store.subscribe(() => true)

        expect(store.unsubscribe(id)).toBeTruthy()
        // if the ID is gone, #unsubscribe should now return false
        expect(store.unsubscribe(id)).toBeFalsy()
      })
    })

    describe('when the ID is not registered', () => {
      it('returns false', () => {
        const store = new Store({})

        expect(store.subscribe(1)).toBeFalsy()
      })
    })
  })

  describe('_get', () => {
    describe('when the key is not part of the shape of the store', () => {
      it('throws an error', () => {
        const store = new Store({}, new FakeHashRepository())

        expect(() => store._get('badKey')).toThrow()
      })
    })

    describe('when the key is part of the shape of the store', () => {
      let store
      let mockSerializer
      let mockRepository

      const TEST_KEY = 'testKey'
      const TEST_VALUE = 'test value'

      beforeEach(() => {
        mockSerializer = {
          serialize: jest.fn(),
          deserialize: jest.fn(),
        }

        mockRepository = new FakeHashRepository({
          [TEST_KEY]: TEST_VALUE,
        })

        store = new Store({ [TEST_KEY]: mockSerializer }, mockRepository)
      })

      describe('when the key returns null', () => {
        it('returns null', () => {
          mockSerializer.deserialize.mockReturnValue(null)

          const val = store._get(TEST_KEY)
          expect(val).toBeNull()
        })
      })

      describe('when the key returns undefined', () => {
        it('returns null', () => {
          mockSerializer.deserialize.mockReturnValue(undefined)

          const val = store._get(TEST_KEY)
          expect(val).toBeNull()
        })
      })

      describe('when the key has a value', () => {
        beforeEach(() => {
          mockSerializer.deserialize.mockReturnValue(TEST_VALUE)
        })

        it('calls the registered deserializer', () => {
          const val = store._get(TEST_KEY)

          expect(mockSerializer.deserialize.mock.calls.length).toBe(1)
        })

        it('returns the deserialized value', () => {
          expect(store._get(TEST_KEY)).toEqual(TEST_VALUE)
        })
      })
    })
  })

  describe('_set', () => {
    let store
    let mockSerializer
    let mockRepository

    const TEST_KEY = 'testKey'
    const TEST_VALUE = 'test value'

    beforeEach(() => {
      mockSerializer = {
        serialize: jest.fn(),
        deserialize: jest.fn(),
      }

      mockRepository = {
        set: jest.fn(),
      }

      store = new Store({ [TEST_KEY]: mockSerializer }, mockRepository)
    })

    describe('when the input value is null', () => {
      it('does not call the serializer', () => {
        store._set(TEST_KEY, null)

        expect(mockSerializer.serialize.mock.calls.length).toBe(0)
      })
    })

    describe('when the input value is undefined', () => {
      it('does not call the serializer', () => {
        store._set(TEST_KEY, undefined)

        expect(mockSerializer.serialize.mock.calls.length).toBe(0)
      })
    })

    describe('when the input has a value', () => {
      it('calls the serializer', () => {
        store._set(TEST_KEY, TEST_VALUE)

        expect(mockSerializer.serialize.mock.calls.length).toBe(1)
      })

      it('sets the value in the repository', () => {
        store._set(TEST_KEY, TEST_VALUE)

        expect(mockRepository.set.mock.calls.length).toBe(1)
      })
    })
  })

  describe('_notify', () => {
    it('calls the listeners', () => {
      const store = new Store({}, new FakeHashRepository())
      const listener = jest.fn()

      store.subscribe(listener)
      store._notify()

      expect(listener.mock.calls.length).toBe(1)
    })
  })

  describe('_bindAction', () => {
    let store
    let mockRepository
    const TEST_KEY = 'testKey'
    const TEST_PAYLOAD = 'test payload'

    beforeEach(() => {
      mockRepository = {
        set: jest.fn(),
      }

      const mockSerializer = {
        serialize: jest.fn(val => val),
      }

      store = new Store({ [TEST_KEY]: mockSerializer }, mockRepository)
    })

    it('creates a function', () => {
      const func = store._bindAction(TEST_KEY, jest.fn())

      expect(typeof func).toBe('function')
    })

    describe('the created function', () => {
      let mockReducer
      let func
      const TEST_REDUCER_RETURN_VALUE = 'return value'

      beforeEach(() => {
        mockReducer = jest.fn(payload => TEST_REDUCER_RETURN_VALUE)
        func = store._bindAction(TEST_KEY, mockReducer)
      })

      it('calls the reducer', () => {
        func()

        expect(mockReducer.mock.calls.length).toBe(1)
      })

      it('passes the state and payload to the reducer', () => {
        func(TEST_PAYLOAD)

        // the first arg to the reducer is the store
        expect(mockReducer.mock.calls[0][0]).toBe(store)

        // the second arg to the reducer is the payload
        expect(mockReducer.mock.calls[0][1]).toBe(TEST_PAYLOAD)
      })

      it('sets the key to the return value of the reducer', () => {
        func(TEST_PAYLOAD)

        const setMock = mockRepository.set.mock

        expect(setMock.calls.length).toBe(1)
        expect(setMock.calls[0][0]).toBe(TEST_KEY)
        expect(setMock.calls[0][1]).toBe(TEST_REDUCER_RETURN_VALUE)
      })

      it('notifies the listeners', () => {
        const mockListener = jest.fn()
        store.subscribe(mockListener)
        func()

        expect(mockListener.mock.calls.length).toBe(1)
      })
    })
  })
})
