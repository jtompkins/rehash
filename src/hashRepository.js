import { parseFragment } from './util/hashParseUtils'

export default class HashRepository {
  constructor(managedKeys = []) {
    this.managedKeys = managedKeys
  }

  get() {
    const { query } = parseFragment(global.location.hash)

    return this.managedKeys.reduce((acc, key) => {
      acc[key] = query[key] || null
      return acc
    }, {})
  }

  set(state) {
    if (typeof state !== 'object') {
      throw new Error('Only objects can be merged into the hash')
    }

    if (Object.keys(state).some(key => !this.managedKeys.includes(key))) {
      throw new Error('Non-managed keys cannot be set')
    }

    const { path, query } = parseFragment(global.location.hash)

    global.location.hash = this._buildFragment(
      path,
      Object.assign(query, state),
    )
  }

  _buildFragment(path, state) {
    const hashString = Object.entries(state)
      .filter(([key, value]) => !(value === null || value === undefined))
      .map(p => `${p[0]}=${encodeURI(p[1])}`)
      .join('&')

    return `#${path}?${hashString}`
  }
}
