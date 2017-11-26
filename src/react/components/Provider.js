// adapted from https://github.com/concretesolutions/redux-zero/blob/master/src/react/components/Provider.tsx

import * as React from 'react'
import PropTypes from 'prop-types'

export default class Provider extends React.Component {
  static childContextTypes = {
    store: PropTypes.object,
  }

  getChildContext() {
    const { store } = this.props
    return { store }
  }

  render() {
    const { children } = this.props
    return React.Children.only(children)
  }
}
