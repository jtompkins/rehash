export default class FakeHashRepository {
  constructor(initialValue) {
    this.cache = initialValue || {}
  }

  getAll() {
    return this.cache
  }

  get(key) {
    return this.cache[key]
  }

  set(key) {
    throw new Error('Method not implemented.')
  }

  reset() {
    this.cache = {}
  }
}
