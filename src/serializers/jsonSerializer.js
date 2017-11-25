export default {
  deserialize: jsonString => {
    return JSON.parse(jsonString)
  },
  serialize: val => {
    return JSON.stringify(val)
  },
}
