export default {
  deserialize: jsonString => {
    try {
      return JSON.parse(jsonString)
    } catch (err) {
      return null
    }
  },
  serialize: val => {
    return JSON.stringify(val)
  },
}
