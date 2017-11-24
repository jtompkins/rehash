export default {
  deserialize: dateString => {
    return new Date(Number(dateString))
  },
  serialize: val => {
    return val.getMilliseconds().toString()
  },
}
