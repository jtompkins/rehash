# rehash

[![npm version](https://badge.fury.io/js/rehashjs.svg)](https://badge.fury.io/js/rehashjs)

Rehash is a lightweight state container based on Redux and heavily inspired by
Redux Zero. Instead of a singleton in-memory store, Rehash uses the browser's
hash fragment to store your serialized state.

## Installation

`yarn add rehashjs`

## Usage

Import the necessary objects:

```js
import { createStore, JsonSerializer, Provider, connect } from 'rehashjs'
```

### Creating the store

To create a Rehash store, you'll need to define the state of your shape, and the
serializer you want to use for each key:

```js
const store = createStore({
  count: JsonSerializer,
})
```

Rehash comes with two serializers - `DateSerializer`, which serializes `Date`s
to epoch millisecond strings, and `JsonSerializer`, which, well, JSON-serializes
things.

### Defining Actions

Just like Redux, Rehash uses "actions" to modify application state. _Unlike_
Redux, you don't have to define reducers or action creators - just tell Rehash
what your actions are called and provide an (optional) reducer implementation.

```js
const actions = store.defineActions({
  increment: state, payload => ({ count: state.count + payload }),
})
```

Your reducer implementation receives the application state when the action is
called, but you won't have to worry about that when you're actually calling the
action - `defineAction` curries the reducer functions for you, as we'll see
later.

The return value from a Rehash reducer is _merged_ into the program state - so
you can return the entire state, just like in Redux, or you can return only
what's changed.

If your action doesn't have a payload, the second argument is optional:

```js
const actions = store.defineActions({
  increment: state => ({ count: state.count + 1 }),
})
```

Many Rehash applications just need to modify the application's state, with no
business logic necessary. If that's the case, you can have Rehash auto-generate
your actions:

```js
const actions = store.defineActions()
```

The generated actions will have the same names as your state keys.

### Connecting your application to the store

To connect the store instance to React, use the `Provider` component:

```js
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

### Connecting React components to the store

Just like Redux, Rehash provides a `connect` function that you can use to
connect your components to the Rehash store.

```js
const mapStateToProps = ({ count }) => ({ count })

const Counter = connect(mapStateToProps)(({ count }) => {
  return (
    <div>
      <h1>Count: {count || 0}</h1>
    </div>
  )
})
```

`connect` takes two arguments, both optional:

* `mapStateToProps`, which extracts values from the Rehash store to pass to the
  component and must return an object,
* `actions`, an object containing actions used by the component (in the same
  form returned by `store.defineActions`)

If you don't provide `mapStateToProps`, the entire state will be passed to the
component. The actions and the `mapStateToProps` return value will be passed to
the component as React props.

### Updating state

Update the state by calling one of your actions, optionally passing in a
payload:

```js
const mapStateToProps = ({ count }) => ({ count })

const actions = store.defineActions({
  increment: state, payload => ({ count: state.count + payload }),
})

const Counter = connect(mapStateToProps, actions)(({ count, increment }) => {
  return (
    <div>
      <h1>Count: {count || 0}</h1>
      <button onClick={() => increment(10)}>Increment!</button>
    </div>
  )
})
```

### Serializers

Any object with a `serialize` and `deserialize` method can serve as a Rehash
serializer. Let's make a simple serializer that transforms a `Date` object into
an epoch string:

```js
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
