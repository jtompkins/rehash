export default class FakeHashRepository {
  constructor(initialValue) {
    this.cache = initialValue || {}
  }

  get(key) {
    return this.cache[key]
  }

  set(state) {
    if (typeof state !== 'object') {
      throw new Error('Only objects can be merged into the hash')
    }

    this.cache = Object.assign(this.cache, state)
  }

  reset() {
    this.cache = {}
  }
}
