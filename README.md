# rehash

Rehash is a lightweight, low boilerplate Redux-alike library that uses the
browser's hash fragment as the store. It's a good fit for applications where the
shared state is limited to query or filter _parameters_ (the hash fragment is
not a great place to store actual _data_).

## Installation

`yarn add rehashjs`

## Usage

Import the necessary objects:

```
import { Store, JsonSerializer, Provider, connect } from 'rehashjs'
```

Create your store, specifying the shape of the state and the serializers you
want to use:

```
const store = new Store({
  count: JsonSerializer,
})
```

If you just need to update the value of your state, with no reducer logic, you
can have Rehash auto-generate your actions:

```
const actions = store.defineActions()
```

...alternatively, you can provide a set of reducers that will be called when
your action is fired:

```
const actions = store.defineActions({
  increment: state => ({ count: state.count + 1 }),
})
```

You can provide a payload to the action with a second parameter:

```
const actions = store.defineActions({
  increment: state, payload => ({ count: state.count + payload }),
})
```

Create a "connected" component using the `connect` function:

```
const mapToProps = ({ count }) => ({ count })

const Counter = connect(mapToProps, actions)(({ count, increment }) => {
  return (
    <div>
      <h1>Count: {count || 0}</h1>
      <button onClick={() => increment(5)}>Increment counter</button>
    </div>
  )
})
```

`mapToProps` handles extracting the values the component cares about from the
app's shared state. It's passed the full state and needs to return an object.

To connect the store instance to React, use the `Provider` component:

```
class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Counter />
      </Provider>
    )
  }
}
```

### Serializers

Any object with a `serialize` and `deserialize` method can serve as a Rehash
serializer. Let's make a simple serializer that transforms a `Date` object into
an epoch string:

```
const DateSerializer = {
  deserialize: dateString => {
    return new Date(Number(dateString))
  },
  serialize: val => {
    return val.getTime().toString()
  },
}
```

## Example

There's a sample React app in `examples/counter`. To start it:

* `yarn install`
* `yarn start`
* Visit `localhost:3000` in your browser

## Roadmap

* Async/await?
* Middleware?

## Docs

* [Code of Conduct](https://www.contributor-covenant.org/version/1/4/code-of-conduct.md)

## TODO

1. [ ] The `Connect` component should not auto-bind the actions to the `Store`
       instance
1. [ ] Add a `createStore` exported function to emulate the behavior of Redux
