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

  if (!fragmentString.includes('?')) {
    return { path: fragmentString, query: {} }
  }

  const parts = fragmentString.split('?')

  return {
    path: parts[0] || '',
    query: parseQueryString(parts[1]),
  }
}
