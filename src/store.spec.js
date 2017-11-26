import Store from './store'
import HashRepository from './hashRepository'
import FakeHashRepository from './fakes/fakeHashRepository'

const makeMockSerializer = () => {
  return {
    serialize: jest.fn(v => v),
    deserialize: jest.fn(v => v),
  }
}

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

    describe('when a shape is not provided', () => {
      it('throws an error', () => {
        expect(() => new Store(null)).toThrow()
      })
    })

    describe('when a shape is provided', () => {
      const TEST_KEY = 'testKey'
      const TEST_VALUE = 'test value'

      let store

      beforeEach(() => {
        store = new Store(
          {
            [TEST_KEY]: makeMockSerializer(),
          },
          new FakeHashRepository({ [TEST_KEY]: TEST_VALUE }),
        )
      })

      it('defines a getter for each key in the shape', () => {
        const propertyDescriptor = Object.getOwnPropertyDescriptor(
          store,
          TEST_KEY,
        )

        expect(propertyDescriptor).not.toBeUndefined()
        expect(propertyDescriptor.get).not.toBeUndefined()
      })

      describe('the generated getter', () => {
        it('returns a value from the store', () => {
          const val = store[TEST_KEY]

          expect(val).toBe(TEST_VALUE)
        })
      })

      it('defines a setter for each key in the shape', () => {
        const propertyDescriptor = Object.getOwnPropertyDescriptor(
          store,
          TEST_KEY,
        )

        expect(propertyDescriptor).not.toBeUndefined()
        expect(propertyDescriptor.set).not.toBeUndefined()
      })

      describe('the generated setter', () => {
        it('sets a value on the store', () => {
          store[TEST_KEY] = 'another value'

          expect(store[TEST_KEY]).toBe('another value')
        })
      })
    })
  })

  describe('subscribe', () => {
    it('returns an ID', () => {
      const store = new Store({}, new FakeHashRepository())

      const id = store.subscribe(() => true)

      expect(typeof id).toBe('number')
    })

    it('returns different IDs for each subscriber', () => {
      const store = new Store({}, new FakeHashRepository())

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
        const store = new Store({}, new FakeHashRepository())

        expect(store.subscribe(1)).toBeFalsy()
      })
    })
  })

  describe('defineActions', () => {
    describe('when no actions are provide', () => {
      it('throws an error', () => {
        const store = new Store({}, new FakeHashRepository())

        expect(() => store.defineActions()).toThrow()
      })
    })

    describe('when actions are provided', () => {
      let mockSerializer

      beforeEach(() => {
        mockSerializer = makeMockSerializer()
      })

      it('returns a hash of bound action creators', () => {
        const store = new Store(
          { key: mockSerializer },
          new FakeHashRepository(),
        )

        const actions = store.defineActions({
          testAction: (store, payload) => (store.key = payload),
        })

        expect(actions).toHaveProperty('testAction')
        expect(typeof actions['testAction']).toBe('function')
      })
    })
  })

  describe('getState', () => {
    const TEST_KEY = 'testKey'
    const TEST_VALUE = 'test value'

    let store

    beforeEach(() => {
      store = new Store(
        { [TEST_KEY]: makeMockSerializer() },
        new FakeHashRepository(),
      )

      store[TEST_KEY] = TEST_VALUE
    })

    describe('when a key is provided', () => {
      it('returns the state associated with the key', () => {
        expect(store.getState(TEST_KEY)).toEqual(TEST_VALUE)
      })

      describe('when the key is not part of the store shape', () => {
        it('returns null', () => {
          expect(store.getState('aKeyNotInTheShape')).toBeNull()
        })
      })
    })

    describe('when a key is not provided', () => {
      it('returns a hash containing all store state', () => {
        expect(store.getState()).toEqual({ [TEST_KEY]: TEST_VALUE })
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
        mockSerializer = makeMockSerializer()

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
      mockSerializer = makeMockSerializer()

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
    let store
    let listener

    beforeEach(() => {
      store = new Store({}, new FakeHashRepository())
      listener = jest.fn()
      store.subscribe(listener)
    })

    it('calls the listeners', () => {
      store._notify()

      expect(listener.mock.calls.length).toBe(1)
    })

    it('passes the store to the listener', () => {
      store._notify()

      expect(listener.mock.calls[0][0]).toBe(store)
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
        commit: jest.fn(),
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

      it('calls commit on the repo after the reducer has run', () => {
        func(TEST_PAYLOAD)

        expect(mockRepository.commit.mock.calls.length).toBe(1)
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
