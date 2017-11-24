export default {
  deserialize: jsonString => {
    return JSON.parse(jsonString)
  },
  serialize: val => {
    return val.toJson()
  },
}
