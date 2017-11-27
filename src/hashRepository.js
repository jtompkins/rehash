export default class HashRepository {
  constructor(managedKeys = []) {
    this.managedKeys = managedKeys
  }

  get(key) {
    const hash = this._parseFragment(global.location.hash)
    const val = hash[key]

    return val ? val : null
  }

  set(key, value) {
    if (!this.managedKeys.includes(key)) {
      throw new Error('Non-managed keys cannot be set')
    }

    const oldHash = this._parseFragment(global.location.hash)
    let newHash

    if (value === null || value === undefined) {
      newHash = oldHash
      delete newHash[key]
    } else {
      newHash = Object.assign(oldHash, {
        [key]: value,
      })
    }

    global.location.hash = this._buildFragment(newHash)
  }

  commit() {} // TODO: once internal caching works, implement this

  _parseFragment(fragment) {
    let hash = fragment.startsWith('#') ? fragment.slice(1) : fragment

    if (hash === '') {
      return {}
    }

    return hash
      .split('&') // extract pairs
      .reduce((acc, next) => {
        const [key, val] = next.split('=')
        acc[key] = decodeURI(val)
        return acc
      }, {})
  }

  _buildFragment(hash) {
    const hashString = Object.entries(hash)
      .map(p => `${p[0]}=${encodeURI(p[1])}`)
      .join('&')

    return `#${hashString}`
  }
}
