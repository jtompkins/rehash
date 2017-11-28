export default class HashRepository {
  constructor(managedKeys = []) {
    this.managedKeys = managedKeys
  }

  get(key) {
    const hash = this._parseFragment(global.location.hash)
    const val = hash[key]

    return val ? val : null
  }

  set(state) {
    if (typeof state !== 'object') {
      throw new Error('Only objects can be merged into the hash')
    }

    if (Object.keys(state).some(key => !this.managedKeys.includes(key))) {
      throw new Error('Non-managed keys cannot be set')
    }

    const hash = this._parseFragment(global.location.hash)

    global.location.hash = this._buildFragment(Object.assign(hash, state))
  }

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
      .filter(([key, value]) => !(value === null || value === undefined))
      .map(p => `${p[0]}=${encodeURI(p[1])}`)
      .join('&')

    return `#${hashString}`
  }
}
