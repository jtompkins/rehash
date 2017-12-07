import JsonSerializer from './jsonSerializer'

describe('JsonSerializer', () => {
  const TEST_OBJECT = { test: 'value' }
  const TEST_JSON = JSON.stringify(TEST_OBJECT)
  const INVALID_JSON = '{"test":"value"' // NO CLOSING BRACE!

  describe('serialize', () => {
    it('serializes a value into JSON', () => {
      expect(JsonSerializer.serialize(TEST_OBJECT)).toEqual(TEST_JSON)
    })
  })

  describe('deserialize', () => {
    it('deserializes a JSON string into a value', () => {
      expect(JsonSerializer.deserialize(TEST_JSON)).toEqual(TEST_OBJECT)
    })

    describe('when the input is not valid JSON', () => {
      it('returns null', () => {
        expect(JsonSerializer.deserialize(INVALID_JSON)).toBeNull()
      })
    })
  })
})
