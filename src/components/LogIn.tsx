import * as React from 'react'
import Auth from '../auth/Auth'
import { Button, Icon } from 'semantic-ui-react'

interface LogInProps {
  auth: Auth
}

interface LogInState {}

export class LogIn extends React.PureComponent<LogInProps, LogInState> {
  onLogin = () => {
    this.props.auth.login()
  }

  render() {
    return (
      <div style={{ textAlign: 'center' }}>
        <Icon name='lock' size='huge'></Icon>
        <h1>You must be logged in to see this page</h1>
      </div>
    )
  }
}
