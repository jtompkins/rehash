// adapted from https://github.com/concretesolutions/redux-zero/blob/master/src/react/components/Provider.spec.tsx

import * as React from 'react'
import { mount } from 'enzyme'

import Store from '../../store'
import JsonSerializer from '../../serializers/jsonSerializer'
import { Provider } from '../index'

describe('rehash - react bindings', () => {
  const listener = jest.fn()
  let store, unsubscribe

  beforeEach(() => {
    store = new Store({ message: JsonSerializer })
    listener.mockReset()
    unsubscribe = store.subscribe(listener)
  })

  describe('Provider', () => {
    it.only('should provide the store in the apps context', () => {
      store.message = 'hello'

      class Comp extends React.Component {
        static contextTypes = {
          store: () => null,
        }
        render() {
          return <h1>{String(!!this.context.store)}</h1>
        }
      }

      const App = () => (
        <Provider store={store}>
          <Comp />
        </Provider>
      )
      const wrapper = mount(<App />)

      expect(wrapper.html()).toBe('<h1>true</h1>')
    })
  })
})
