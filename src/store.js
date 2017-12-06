import HashRepository from './hashRepository'

export default class Store {
  constructor(shape, hashRepository) {
    if (shape === undefined || shape === null) {
      throw new Error('A shape for the store must be provided')
    }

    this.listeners = []
    this.shape = shape
    this.repo = hashRepository || new HashRepository(Object.keys(shape))
  }

  subscribe(func) {
    this.listeners.push(func)

    return this.listeners.length - 1
  }

  unsubscribe(id) {
    if (!this.listeners[id]) {
      return false
    }

    delete this.listeners[id]
    return true
  }

  createActionsFromShape() {
    return Object.keys(this.shape).reduce((acc, key) => {
      acc[key] = (state, payload) => ({ [key]: payload })
      return acc
    }, {})
  }

  defineActions(actions) {
    if (!actions) {
      return {}
    }

    return Object.entries(actions).reduce((acc, [key, reducer]) => {
      acc[key] = this._bindAction(key, reducer)
      return acc
    }, {})
  }

  getState(key) {
    const state = this.repo.get()

    if (key) {
      return this._deserialize(key, state[key])
    }

    return Object.keys(this.shape).reduce((acc, key) => {
      acc[key] = this._deserialize(key, state[key])
      return acc
    }, {})
  }

  setState(newState) {
    if (!newState) {
      return
    }

    const serializedHash = Object.keys(newState).reduce((acc, key) => {
      acc[key] = this._serialize(key, newState[key])
      return acc
    }, {})

    this.repo.set(serializedHash)
    this._notify()
  }

  _bindAction(key, reducer) {
    return payload => {
      this.setState(reducer(this.getState(), payload))
    }
  }

  _notify() {
    const state = this.getState()
    this.listeners.forEach(f => f(state))
  }

  _deserialize(key, value) {
    if (value === undefined || value === null) {
      return null
    }

    const serializer = this.shape[key]

    if (!serializer) {
      throw new Error(`No serializer registered for key ${key}`)
    }

    const deserializedValue = serializer.deserialize(value)

    return deserializedValue === undefined || deserializedValue === null
      ? null
      : deserializedValue
  }

  _serialize(key, value) {
    if (value === undefined || value === null) {
      return
    }

    const serializer = this.shape[key]

    if (!serializer) {
      throw new Error(`No serializer registered for key ${key}`)
    }

    return serializer.serialize(value)
  }
}
