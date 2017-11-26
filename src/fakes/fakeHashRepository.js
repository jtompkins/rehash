export default class FakeHashRepository {
  constructor(initialValue) {
    this.cache = initialValue || {}
  }

  get(key) {
    return this.cache[key]
  }

  set(key, value) {
    this.cache[key] = value
  }

  commit() {}

  reset() {
    this.cache = {}
  }
}
