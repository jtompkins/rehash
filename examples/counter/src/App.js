import React, { Component } from 'react'
import { Store, JsonSerializer, Provider, connect } from 'rehash'

const store = new Store({
  count: JsonSerializer,
})

const actions = {
  increment: state => ({ count: state.count + 1 }),
}

const mapToProps = ({ count }) => ({ count })

const Counter = connect(mapToProps, actions)(({ count, increment }) => {
  return (
    <div>
      <h1>Count: {count || 0}</h1>
      <button onClick={increment}>Increment counter</button>
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
