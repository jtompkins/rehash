# rehash

Lightweight Redux, for the hash fragment

## Usage

`yarn add rehashjs`

## TODO

1. [ ] Write some actual docs, probably
2. [ ] Make the example app pull Rehash from NPM instead of just a weird `yarn
       link` thing
3. [ ] Make the `HashRepository` implementation more efficient - it parses
       `window.location.hash` **a lot**

## Open Questions

1. Should the `Connect` component be binding the actions to the store? Maybe the
   user should do that?
2. Can the `HashRepository` view hash operations as a "transaction" of some
   kind? Maybe they can be cached briefly so it doesn't parse
   `window.location.hash` over and over again?
3. Should `getState` return `null` for keys in the store that don't have values
   in the hash fragment? Maybe the keys shouldn't be there in the output?
4. Most of the public-facing API looks like Redux Zero. Maybe we should have a
   `createStore` function instead of a `Store` constructor? Maybe we should just
   have both?
5. Does `async/await/Promises` work? How should it work?
6. Is middleware a thing this library needs? The usage is focused pretty
   tightly, maybe if you need that you should move on to something more
   full-featured?
