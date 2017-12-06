// adapted from https://raw.githubusercontent.com/concretesolutions/redux-zero/master/src/react/components/connect.spec.tsx

import * as React from 'react'
import { mount, shallow } from 'enzyme'
import PropTypes from 'prop-types'

import createStore from '../../createStore'
import createFakeStore from '../../fakes/createFakeStore'
import JsonSerializer from '../../serializers/jsonSerializer'
import { Provider, Connect, connect } from '..'

describe('rehash - react bindings', () => {
  let store, listener

  beforeEach(() => {
    store = createStore({ message: JsonSerializer, count: JsonSerializer })
    listener = jest.fn()
    store.subscribe(listener)
  })

  describe('connect HOC', () => {
    it('should provide the state and subscribe to changes', () => {
      store.setState({ message: 'hello' })

      expect(store.getState()).toEqual({ message: 'hello', count: null })

      const mapToProps = ({ message }) => ({ message })
      const Comp = ({ message }) => <h1>{message}</h1>

      const ConnectedComp = connect(mapToProps)(Comp)

      const App = () => (
        <Provider store={store}>
          <ConnectedComp />
        </Provider>
      )

      const wrapper = mount(<App />)

      expect(wrapper.html()).toBe('<h1>hello</h1>')

      store.setState({ message: 'bye' })

      expect(wrapper.html()).toBe('<h1>bye</h1>')
    })

    it('should provide the actions and subscribe to changes', () => {
      store.setState({ count: 0 })

      const Comp = ({ count, increment }) => (
        <h1 onClick={increment}>{count}</h1>
      )

      const mapToProps = ({ count }) => ({ count })

      const actions = {
        increment: state => ({ count: state.count + 1 }),
      }

      const ConnectedComp = connect(mapToProps, actions)(Comp)

      const App = () => (
        <Provider store={store}>
          <ConnectedComp />
        </Provider>
      )

      const wrapper = mount(<App />)

      expect(wrapper.html()).toBe('<h1>0</h1>')

      wrapper.children().simulate('click')
      wrapper.children().simulate('click')

      expect(wrapper.html()).toBe('<h1>2</h1>')
    })

    it('should provide actions with parameters and subscribe to changes', () => {
      store.setState({ count: 0 })

      const Comp = ({ count, incrementOf }) => (
        <h1 onClick={() => incrementOf(10)}>{count}</h1>
      )

      const mapToProps = ({ count }) => ({ count })

      const actions = {
        incrementOf: (state, payload) => ({ count: state.count + payload }),
      }

      const ConnectedComp = connect(mapToProps, actions)(Comp)

      const App = () => (
        <Provider store={store}>
          <ConnectedComp />
        </Provider>
      )

      const wrapper = mount(<App />)

      expect(wrapper.html()).toBe('<h1>0</h1>')

      wrapper.children().simulate('click')
      wrapper.children().simulate('click')

      expect(wrapper.html()).toBe('<h1>20</h1>')
    })

    it('should provide the store as a prop', () => {
      const Comp = ({ store }) => <h1>{String(!!store)}</h1>

      const mapToProps = state => state

      const ConnectedComp = connect(mapToProps)(Comp)

      const App = () => (
        <Provider store={store}>
          <ConnectedComp />
        </Provider>
      )

      const wrapper = mount(<App />)

      expect(wrapper.html()).toBe('<h1>true</h1>')
    })

    it('should connect with nested children', () => {
      store.setState({ message: 'hello' })

      const Comp = ({ message, children }) => (
        <div>
          parent {message} {children}
        </div>
      )
      const ChildComponent = ({ message }) => <span>child {message}</span>

      const mapToProps = ({ message }) => ({ message })

      const ConnectedComp = connect(mapToProps)(Comp)
      const ConnectedChildComp = connect(mapToProps)(ChildComponent)

      const App = () => (
        <Provider store={store}>
          <ConnectedComp>
            <ConnectedChildComp />
          </ConnectedComp>
        </Provider>
      )

      const wrapper = mount(<App />)

      expect(wrapper.html()).toBe(
        '<div>parent hello <span>child hello</span></div>',
      )

      store.setState({ message: 'bye' })

      expect(wrapper.html()).toBe(
        '<div>parent bye <span>child bye</span></div>',
      )
    })

    it('should connect return all state when mapToProps is not passed', () => {
      store.setState({ message: 'Hey!' })
      const Comp = ({ message }) => <h1>{message}</h1>
      const ConnectedComp = connect()(Comp)

      const App = () => (
        <Provider store={store}>
          <ConnectedComp />
        </Provider>
      )

      const wrapper = mount(<App />)
      expect(wrapper.html()).toBe('<h1>Hey!</h1>')
    })
  })

  describe('Connect component', () => {
    it('should provide the state and subscribe to changes', () => {
      store.setState({ message: 'hello' })

      const mapToProps = ({ message }) => ({ message })

      const ConnectedComp = () => (
        <Connect mapToProps={mapToProps}>
          {({ message }) => <h1>{message}</h1>}
        </Connect>
      )

      const App = () => (
        <Provider store={store}>
          <ConnectedComp />
        </Provider>
      )

      const wrapper = mount(<App />)

      expect(wrapper.html()).toBe('<h1>hello</h1>')

      store.setState({ message: 'bye' })

      expect(wrapper.html()).toBe('<h1>bye</h1>')
    })

    it('should provide the actions and subscribe to changes', () => {
      store.setState({ count: 0 })

      const mapToProps = ({ count }) => ({ count })

      const actions = {
        increment: state => ({ count: state.count + 1 }),
      }

      const ConnectedComp = () => (
        <Connect mapToProps={mapToProps} actions={actions}>
          {({ count, increment }) => <h1 onClick={increment}>{count}</h1>}
        </Connect>
      )

      const App = () => (
        <Provider store={store}>
          <ConnectedComp />
        </Provider>
      )

      const wrapper = mount(<App />)
      expect(wrapper.html()).toBe('<h1>0</h1>')

      wrapper.children().simulate('click')
      wrapper.children().simulate('click')

      expect(wrapper.html()).toBe('<h1>2</h1>')
    })

    it('should provide actions with parameters and subscribe to changes', () => {
      store.setState({ count: 0 })

      const mapToProps = ({ count }) => ({ count })

      const actions = {
        incrementOf: (state, payload) => ({ count: state.count + payload }),
      }

      const ConnectedComp = () => (
        <Connect mapToProps={mapToProps} actions={actions}>
          {({ count, incrementOf }) => (
            <h1 onClick={() => incrementOf(10)}>{count}</h1>
          )}
        </Connect>
      )

      const App = () => (
        <Provider store={store}>
          <ConnectedComp />
        </Provider>
      )

      const wrapper = mount(<App />)

      expect(wrapper.html()).toBe('<h1>0</h1>')

      wrapper.children().simulate('click')
      wrapper.children().simulate('click')

      expect(wrapper.html()).toBe('<h1>20</h1>')
    })

    it('should provide the store as a prop', () => {
      const mapToProps = state => state

      const ConnectedComp = () => (
        <Connect mapToProps={mapToProps}>
          {({ store }) => <h1>{String(!!store)}</h1>}
        </Connect>
      )

      const App = () => (
        <Provider store={store}>
          <ConnectedComp />
        </Provider>
      )

      const wrapper = mount(<App />)

      expect(wrapper.html()).toBe('<h1>true</h1>')
    })

    it('should connect with nested children', () => {
      store.setState({ message: 'hello' })

      const mapToProps = ({ message }) => ({ message })

      const ConnectedComp = ({ children }) => (
        <Connect mapToProps={mapToProps}>
          {({ message }) => (
            <div>
              parent {message} {children}
            </div>
          )}
        </Connect>
      )

      const ConnectedChildComp = () => (
        <Connect mapToProps={mapToProps}>
          {({ message }) => <span>child {message}</span>}
        </Connect>
      )

      const App = () => (
        <Provider store={store}>
          <ConnectedComp>
            <ConnectedChildComp />
          </ConnectedComp>
        </Provider>
      )

      const wrapper = mount(<App />)

      expect(wrapper.html()).toBe(
        '<div>parent hello <span>child hello</span></div>',
      )

      store.setState({ message: 'bye' })

      expect(wrapper.html()).toBe(
        '<div>parent bye <span>child bye</span></div>',
      )
    })
  })

  describe('When testing with no Provider component', () => {
    let fakeStore

    beforeEach(() => {
      fakeStore = createFakeStore({
        message: JsonSerializer,
        count: JsonSerializer,
      })
    })

    describe('when there are no actions defined', () => {
      it('should be able to read from Enzyme context properly', () => {
        fakeStore.setState({ message: 'hello' })

        const mapToProps = ({ message }) => ({ message })

        const Comp = ({ message }) => <h1>{message}</h1>
        const ConnectedComp = connect(mapToProps)(Comp)

        const wrapper = mount(<ConnectedComp />, {
          context: { store: fakeStore },
          childContextTypes: { store: PropTypes.object.isRequired },
        })
        expect(wrapper.html()).toBe('<h1>hello</h1>')
      })
    })

    describe('when there are actions defined', () => {
      it('should be able to call the actions without issues', () => {
        fakeStore.setState({ count: 0 })

        const actions = fakeStore.defineActions({
          increment: state => ({ count: state.count + 1 }),
        })

        const mapToProps = ({ count }) => ({ count })

        const Comp = ({ count, increment }) => (
          <h1 onClick={increment}>{count}</h1>
        )
        const ConnectedComp = connect(mapToProps, actions)(Comp)

        const wrapper = mount(<ConnectedComp />, {
          context: { store: fakeStore },
          childContextTypes: { store: PropTypes.object.isRequired },
        })

        expect(wrapper.html()).toBe('<h1>0</h1>')

        wrapper.children().simulate('click')
        wrapper.children().simulate('click')

        expect(wrapper.html()).toBe('<h1>2</h1>')
      })
    })
  })
})
