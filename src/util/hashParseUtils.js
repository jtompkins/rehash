import { isNullOrEmpty } from './stringUtils'

export const parseQueryString = queryString => {
  if (isNullOrEmpty(queryString)) {
    return {}
  }

  return queryString
    .split('&') // extract pairs
    .reduce((acc, next) => {
      const [key, val] = next.split('=')
      acc[key] = decodeURI(val)
      return acc
    }, {})
}

export const parseFragment = fragment => {
  if (isNullOrEmpty(fragment)) {
    return { path: '', query: {} }
  }

  const fragmentString = fragment.startsWith('#') ? fragment.slice(1) : fragment

  let path = ''
  let query = {}

  if (!fragmentString.includes('?')) {
    if (!fragmentString.includes('=')) {
      path = fragmentString
    } else {
      query = parseQueryString(fragmentString)
    }
  } else {
    const parts = fragmentString.split('?')

    path = parts[0]
    query = parseQueryString(parts[1])
  }

  return {
    path,
    query,
  }
}
