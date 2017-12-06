import StringSerializer from './stringSerializer'

describe('StringSerializer', () => {
  const TEST_STRING = 'myMessage'
  const TEST_RESULT = TEST_STRING.toString()
  const NULL_THING = null
  const NULL_RESULT = ''

  describe('serialize', () => {
    it('serializes a value into a string', () => {
      expect(StringSerializer.serialize(TEST_STRING)).toEqual(TEST_RESULT)
    })

    it('serializes non-string values correctly', () => {
      expect(StringSerializer.serialize(NULL_THING)).toEqual(NULL_RESULT)
    })
  })

  describe('deserialize', () => {
    it('deserializes a string into a string', () => {
      expect(StringSerializer.deserialize(TEST_RESULT)).toEqual(TEST_STRING)
    })
  })
})
