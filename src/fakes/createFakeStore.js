import Store from '../store'
import FakeHashRepository from './fakeHashRepository'

const createFakeStore = shape => new Store(shape, new FakeHashRepository())

export default createFakeStore
