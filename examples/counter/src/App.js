import React, { Component } from 'react'
import { createStore, JsonSerializer, Provider, connect } from 'rehashjs'

const store = createStore({
  count: JsonSerializer,
})

const actions = store.defineActions({
  increment: (state, payload) => ({ count: state.count + payload }),
})

const mapToProps = ({ count }) => ({ count })

const Counter = connect(mapToProps, actions)(({ count, increment }) => {
  return (
    <div>
      <h1>Count: {count || 0}</h1>
      <button onClick={() => increment(10)}>Increment counter</button>
    </div>
  )
})

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Counter />
      </Provider>
    )
  }
}

export default App
