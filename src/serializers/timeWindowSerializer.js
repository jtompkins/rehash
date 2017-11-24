export default {
  deserialize: windowStr => {
    const dates = windowStr
      .split('-')
      .map(dateString => new Date(Number(dateString)))

    return {
      start: dates[0],
      end: dates[1],
    }
  },
  serialize: ({ start, end }) =>
    `${start.getMilliseconds()}-${end.getMilliseconds}`,
}
