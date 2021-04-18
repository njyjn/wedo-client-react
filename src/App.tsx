import React, { Component } from 'react'
import { Link, Route, Router, Switch } from 'react-router-dom'
import { Grid, Menu, Segment } from 'semantic-ui-react'

import Auth from './auth/Auth'
import { EditInvite } from './components/EditInvite'
import { LogIn } from './components/LogIn'
import { NotFound } from './components/NotFound'
import { Invites } from './components/Invite'
import { ViewInvite } from './components/ViewInvite'
import { UploadInviteAttachment } from './components/UploadInviteAttachment'
import { Home } from './components/Home'

export interface AppProps {}

export interface AppProps {
  auth: Auth
  history: any
}

export interface AppState {}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)

    this.handleLogin = this.handleLogin.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
  }

  handleLogin() {
    this.props.auth.login()
  }

  handleLogout() {
    this.props.auth.logout()
  }

  render() {
    console.log('Org ID: ', this.props.auth.getSub())
    return (
      <div>
        {this.generateMenu()}
        <Segment style={{ padding: '8em 0em' }} vertical>
          <Grid container stackable verticalAlign="middle">
            <Grid.Row>
              <Grid.Column fluid>
                <Router history={this.props.history}>
                  {this.generateCurrentPage()}
                </Router>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    )
  }

  generateMenu() {
    return (
      <Menu stackable>
        <Menu.Item header name="WeDo">
          <Link to="/">WeDo</Link>
        </Menu.Item>
        {this.generateAdminMenu()}
        <Menu.Menu position="right">
          {this.currentUserName()}
          {this.logInLogOutButton()}
        </Menu.Menu>
      </Menu>
    )
  }

  generateAdminMenu() {
    if (this.props.auth.isAuthenticated()) {
      return (
        <Menu.Item name="invites">
          <Link to="/Invites">Invites</Link>
        </Menu.Item>
      )  
    }
  }

  currentUserName() {
    if (this.props.auth.isAuthenticated()) {
      return (
        <Menu.Item>
          <Menu.Header>
            {this.props.auth.sub}
          </Menu.Header>
        </Menu.Item>
      )
    }
  }

  logInLogOutButton() {
    if (this.props.auth.isAuthenticated()) {
      return (
        <Menu.Item name="logout" onClick={this.handleLogout}>
          Log Out
        </Menu.Item>
      )
    } else {
      return (
        <Menu.Item name="login" onClick={this.handleLogin}>
          Log In
        </Menu.Item>
      )
    }
  }

  generateCurrentPage() {
    if (window.location.pathname !== '/' && !this.props.auth.isAuthenticated()) {
      return <LogIn auth={this.props.auth} />
    }

    return (
      <Switch>
        <Route
          path="/Invites"
          exact
          render={props => {
            return <Invites {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/Invites/:InviteId/edit"
          exact
          render={props => {
            return <EditInvite {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/Invites/:InviteId/view"
          exact
          render={props => {
            return <ViewInvite {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/Invites/:InviteId/upload"
          exact
          render={props => {
            return <UploadInviteAttachment {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/"
          exact
          render={props => {
            return <Home {...props} auth={this.props.auth} />
          }}
        />

        <Route component={NotFound} />
      </Switch>
    )
  }
}
