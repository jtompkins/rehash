export default {
  deserialize: string => string,
  serialize: val => {
    try {
      return val.toString()
    } catch (e) {
      return ''
    }
  }
}
