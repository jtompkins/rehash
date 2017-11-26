// adapted from https://raw.githubusercontent.com/concretesolutions/redux-zero/master/src/react/components/connect.tsx

import * as React from 'react'
import PropTypes from 'prop-types'

import shallowEqual from '../../util/shallowEqual'

export class Connect extends React.Component {
  static contextTypes = {
    store: PropTypes.object,
  }

  unsubscribe
  state = this.getProps()
  actions = this.getActions()

  componentWillMount() {
    this.unsubscribe = this.context.store.subscribe(this.update)
  }

  componentWillUnmount() {
    this.unsubscribe(this.update)
  }

  getProps() {
    const { mapToProps } = this.props
    const state = (this.context.store && this.context.store.getState()) || {}
    return mapToProps ? mapToProps(state, this.props) : state
  }

  getActions() {
    const { actions } = this.props
    return actions ? this.context.store.defineActions(actions) : {}
  }

  update = () => {
    const mapped = this.getProps()
    if (!shallowEqual(mapped, this.state)) {
      this.setState(mapped)
    }
  }

  render() {
    return this.props.children({
      store: this.context.store,
      ...this.state,
      ...this.actions,
    })
  }
}

export default function connect(mapToProps, actions = {}) {
  return Child => props => (
    <Connect mapToProps={mapToProps} actions={actions}>
      {mappedProps => <Child {...mappedProps} {...props} />}
    </Connect>
  )
}
