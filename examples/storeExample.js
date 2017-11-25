// NOTA BENE: This test is designed (for now) to be run from Node 8
const { Store, DateSerializer, FakeHashRepository } = require('../dist/bundle')

const store = new Store(
  {
    selectedDate: DateSerializer,
  },
  new FakeHashRepository(),
)

const actions = store.defineActions({
  selectNewDate: (store, payload) => (store.selectedDate = payload),
})

const logger = store => console.log(`New selected date: ${store.selectedDate}`)

store.subscribe(logger)

actions.selectNewDate(new Date())
