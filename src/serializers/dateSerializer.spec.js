import DateSerializer from './dateSerializer'

describe('DateSerializer', () => {
  const NOV_25_2017_IN_MILLIS = '1511740800000'
  const NOV_25_2017_IN_DATE = new Date(Date.UTC(2017, 10, 27, 0, 0, 0, 0))

  describe('serialize', () => {
    it('serializes a date into milliseconds', () => {
      expect(DateSerializer.serialize(NOV_25_2017_IN_DATE)).toEqual(
        NOV_25_2017_IN_MILLIS,
      )
    })
  })

  describe('deserialize', () => {
    it('deserializes a millisecond string into a Date', () => {
      expect(DateSerializer.deserialize(NOV_25_2017_IN_DATE)).toEqual(
        NOV_25_2017_IN_DATE,
      )
    })
  })
})
