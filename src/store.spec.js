import Store from './store'
import HashRepository from './hashRepository'
import FakeHashRepository from './fakes/fakeHashRepository'
import { F_OK } from 'constants'

const makeMockSerializer = () => {
  return {
    serialize: jest.fn(v => v),
    deserialize: jest.fn(v => v),
  }
}

describe('Store', () => {
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
          { [TEST_KEY]: makeMockSerializer() },
          new FakeHashRepository({ [TEST_KEY]: TEST_VALUE }),
        )
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

  describe('createActionsFromShape', () => {
    it('creates actions that match the shape of the store', () => {
      const store = new Store({ key: makeMockSerializer() })

      const actions = store.createActionsFromShape()

      expect(actions).toHaveProperty('key')
      expect(typeof actions['key']).toBe('function')
    })
  })

  describe('defineActions', () => {
    let store
    let mockSerializer

    beforeEach(() => {
      mockSerializer = makeMockSerializer()
      store = new Store({ key: mockSerializer }, new FakeHashRepository())
    })

    it('returns a hash of bound action creators', () => {
      const actions = store.defineActions({
        testAction: (store, payload) => (store.key = payload),
      })

      expect(actions).toHaveProperty('testAction')
      expect(typeof actions['testAction']).toBe('function')
    })

    describe('when no actions are provided', () => {
      it('returns an empty object', () => {
        expect(store.defineActions()).toEqual({})
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

      store.setState({ [TEST_KEY]: TEST_VALUE })
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

  describe('setState', () => {
    const TEST_KEY = 'testKey'
    const TEST_VALUE = 'test value'
    const NEW_VALUE = 'new value'
    const NOT_IN_SHAPE_KEY = 'aKeyNotInStateShape'

    let mockRepository
    let store

    beforeEach(() => {
      const backingRepository = new FakeHashRepository()

      mockRepository = {
        get: k => backingRepository.get(k),
        set: jest.fn((k, v) => backingRepository.set(k, v)),
        commit: jest.fn(),
      }

      store = new Store({ [TEST_KEY]: makeMockSerializer() }, mockRepository)
    })

    it('merges the new state with the existing state', () => {
      store.setState({ [TEST_KEY]: TEST_VALUE })

      expect(store.getState(TEST_KEY)).toEqual(TEST_VALUE)

      store.setState({ [TEST_KEY]: NEW_VALUE })

      expect(store.getState(TEST_KEY)).toEqual(NEW_VALUE)
    })

    it('notifies the listeners', () => {
      const mockListener = jest.fn()
      store.subscribe(mockListener)

      store.setState({ [TEST_KEY]: TEST_VALUE })

      expect(mockListener.mock.calls.length).toBe(1)
    })

    describe('when given key is not in the state shape', () => {
      it('throws an error', () => {
        expect(() =>
          store.setState({ [NOT_IN_SHAPE_KEY]: NEW_VALUE }),
        ).toThrow()
      })
    })
  })

  describe('_deserialize', () => {
    describe('when the key is not part of the shape of the store', () => {
      it('throws an error', () => {
        const store = new Store({}, new FakeHashRepository())

        expect(() => store._deserialize('badKey', 'asdf')).toThrow()
      })
    })

    describe('when the key is part of the shape of the store', () => {
      let store
      let mockSerializer

      const TEST_KEY = 'testKey'
      const TEST_VALUE = 'test value'

      beforeEach(() => {
        mockSerializer = makeMockSerializer()

        store = new Store(
          { [TEST_KEY]: mockSerializer },
          new FakeHashRepository(),
        )
      })

      describe('when the key returns null', () => {
        it('returns null', () => {
          mockSerializer.deserialize.mockReturnValue(null)

          const val = store._deserialize(TEST_KEY, TEST_VALUE)
          expect(val).toBeNull()
        })
      })

      describe('when the key returns undefined', () => {
        it('returns null', () => {
          mockSerializer.deserialize.mockReturnValue(undefined)

          const val = store._deserialize(TEST_KEY, TEST_VALUE)
          expect(val).toBeNull()
        })
      })

      describe('when the key has a value', () => {
        beforeEach(() => {
          mockSerializer.deserialize.mockReturnValue(TEST_VALUE)
        })

        it('calls the registered deserializer', () => {
          const val = store._deserialize(TEST_KEY, TEST_VALUE)

          expect(mockSerializer.deserialize.mock.calls.length).toBe(1)
        })

        it('returns the deserialized value', () => {
          expect(store._deserialize(TEST_KEY, TEST_VALUE)).toEqual(TEST_VALUE)
        })
      })

      describe('when the serializer throws an error', () => {
        beforeEach(() => {
          mockSerializer.deserialize.mockImplementation(() => {
            throw new Error('YOU DID A BAD THING')
          })
        })

        it('returns null', () => {
          expect(store._deserialize(TEST_KEY, TEST_VALUE)).toBeNull()
        })
      })
    })
  })

  describe('_serialize', () => {
    let store
    let mockSerializer

    const TEST_KEY = 'testKey'
    const TEST_VALUE = 'test value'

    beforeEach(() => {
      mockSerializer = makeMockSerializer()

      store = new Store(
        { [TEST_KEY]: mockSerializer },
        new FakeHashRepository(),
      )
    })

    describe('when the input value is null', () => {
      it('does not call the serializer', () => {
        store._serialize(TEST_KEY, null)

        expect(mockSerializer.serialize.mock.calls.length).toBe(0)
      })
    })

    describe('when the input value is undefined', () => {
      it('does not call the serializer', () => {
        store._serialize(TEST_KEY, undefined)

        expect(mockSerializer.serialize.mock.calls.length).toBe(0)
      })
    })

    describe('when the input has a value', () => {
      it('calls the serializer', () => {
        store._serialize(TEST_KEY, TEST_VALUE)

        expect(mockSerializer.serialize.mock.calls.length).toBe(1)
      })
    })

    describe('when the serializer throws an error', () => {
      beforeEach(() => {
        mockSerializer.serialize.mockImplementation(() => {
          throw new Error('YOU DID A BAD THING')
        })
      })

      it('returns null', () => {
        expect(store._serialize(TEST_KEY, TEST_VALUE)).toBeNull()
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

    it('passes the state to the listener', () => {
      store._notify()

      expect(listener.mock.calls[0][0]).toEqual(store.getState())
    })
  })

  describe('_bindAction', () => {
    let store
    let mockRepository
    const TEST_KEY = 'testKey'
    const TEST_PAYLOAD = 'test payload'

    beforeEach(() => {
      const backingRepository = new FakeHashRepository()

      mockRepository = {
        get: k => backingRepository.get(k),
        set: jest.fn((k, v) => backingRepository.set(k, v)),
        commit: jest.fn(),
      }

      store = new Store({ [TEST_KEY]: makeMockSerializer() }, mockRepository)
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
        mockReducer = jest.fn(payload => ({
          [TEST_KEY]: TEST_REDUCER_RETURN_VALUE,
        }))
        func = store._bindAction(TEST_KEY, mockReducer)
      })

      it('calls the reducer', () => {
        func()

        expect(mockReducer.mock.calls.length).toBe(1)
      })

      it('passes the state and payload to the reducer', () => {
        const previousState = store.getState()

        func(TEST_PAYLOAD)

        // the first arg to the reducer is the store
        expect(mockReducer.mock.calls[0][0]).toEqual(previousState)

        // the second arg to the reducer is the payload
        expect(mockReducer.mock.calls[0][1]).toBe(TEST_PAYLOAD)
      })

      it('merges the return value of the reducer with the store state', () => {
        func(TEST_PAYLOAD)

        expect(store.getState(TEST_KEY)).toEqual(TEST_REDUCER_RETURN_VALUE)
      })
    })
  })
})
