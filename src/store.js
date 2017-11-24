import HashRepository from './hashRepository'

export default class Store {
  constructor(shape, hashRepository) {
    this.listeners = []
    this.shape = shape
    this.repo = hashRepository || new HashRepository()
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

  defineActions(actions) {
    if (!actions) {
      throw new Error('not yet implemented')
    }

    const boundActions = {}

    Object.entries(actions).foreach(([key, reducer]) => {
      boundActions[key] = this._bindAction(key, reducer)
    })

    return boundActions
  }

  _bindAction(key, reducer) {
    return payload => {
      this._set(key, reducer(this, payload))
      this._notify()
    }
  }

  _notify() {
    const state = this.repo.getAll

    this.listeners.forEach(f => f(state))
  }

  _get(key) {
    const serializer = this.shape[key]

    if (!serializer) {
      throw new Error(`No serializer registered for key ${key}`)
    }

    const value = this.repo.get(key)

    if (value === undefined || value === null) {
      return null
    }

    const deserializedValue = serializer.deserialize(value)

    return deserializedValue === undefined || deserializedValue === null
      ? null
      : deserializedValue
  }

  _set(key, value) {
    if (value === undefined || value === null) {
      return
    }

    const serializer = this.shape[key]

    if (!serializer) {
      throw new Error(`No serializer registered for key ${key}`)
    }

    this.repo.set(key, serializer.serialize(value))
  }
}
