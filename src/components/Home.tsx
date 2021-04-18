import * as React from 'react'
import Auth from '../auth/Auth'
import { History } from 'history'
import { Button, Form, Grid, Segment, Image, Message, CheckboxProps } from 'semantic-ui-react'
import { respondToInvite } from '../api/invites-api'
import { RespondToInviteRequest } from '../types/RespondToInviteRequest'

enum AttendingRadioOptions {
  'Attending',
  'NotAttending'
}

interface HomeProps {
  auth: Auth
  history: History
}

interface HomeState {
  attendingRadio: AttendingRadioOptions
  formSubmitSuccess: boolean
  formSubmitFailed: boolean
  orgId: string
  familyName: string
  inviteId: string
  attending: boolean
}

export class Home extends React.PureComponent<HomeProps, HomeState> {
  state: HomeState = {
    attendingRadio: AttendingRadioOptions.Attending,
    formSubmitSuccess: false,
    formSubmitFailed: false,
    orgId: '',
    familyName: '',
    inviteId: '',
    attending: true
  }
  onLogin = () => {
    this.props.auth.login()
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      await respondToInvite(
        {
          familyName: this.state.familyName,
          inviteId: this.state.inviteId,
          orgId: this.state.orgId,
          attending: this.state.attending
        } as RespondToInviteRequest
      );
      this.setState({
        formSubmitSuccess: true,
        formSubmitFailed: false
      })
    } catch (e) {
      this.setState({
        formSubmitSuccess: false,
        formSubmitFailed: true
      })
    }
  }

  handleOrgIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ orgId: event.target.value })
  };

  handleFamilyNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ familyName: event.target.value })
  };

  handleInviteIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ inviteId: event.target.value })
  };

  handleRadioChange = (event: React.MouseEvent<HTMLInputElement, MouseEvent>, data: CheckboxProps) => {
    const value = data.value;
    const response: boolean = value === AttendingRadioOptions.Attending;
    this.setState({
      attendingRadio: value as AttendingRadioOptions,
      attending: response
    });
  }

  render() {
    return (
      <div>
        <Grid relaxed stackable columns={2}>
        <Grid.Column>
          {this.renderSideshow()}
        </Grid.Column>
        <Grid.Column>
          <h1>Respond</h1>
          <Segment>
            <Form
              success={this.state.formSubmitSuccess}
              error={this.state.formSubmitFailed}
              onSubmit={this.handleSubmit}
            >
              <Form.Field>
                <label>Organizer's Principal ID</label>
                {/* <input disabled value='dhzuxinfcehr8ty4n38o' /> */}
                <input
                  required
                  placeholder="For testing purposes, this is Auth0 user's sub ID"
                  onChange={this.handleOrgIdChange}
                />
              </Form.Field>
              <Form.Field>
                <label>Family Name</label>
                <input
                  required
                  placeholder='Full name of primary guest printed on invite'
                  onChange={this.handleFamilyNameChange}
                />
              </Form.Field>
              <Form.Field>
                <label>Invite Code</label>
                <input
                  required
                  placeholder='6-letter/number code sent on invite'
                  onChange={this.handleInviteIdChange}
                />
              </Form.Field>
              <Form.Group>
                <Form.Radio
                  label='I will be attending'
                  value={AttendingRadioOptions.Attending}
                  checked={this.state.attendingRadio === AttendingRadioOptions.Attending}
                  onClick={this.handleRadioChange}
                />
                <Form.Radio
                  label='I will not be attending'
                  value={AttendingRadioOptions.NotAttending}
                  checked={this.state.attendingRadio === AttendingRadioOptions.NotAttending}
                  onClick={this.handleRadioChange}
                />
              </Form.Group>
              <Button type='submit' color='green'>Submit</Button>
              <Message
                success
                header='Response Submitted'
                content="Thank you for your response. See you there!"
              />
              <Message
                error
                header='Something went wrong'
                content="Please try again later, sorry!"
              />
            </Form>
          </Segment>
        </Grid.Column>
        </Grid>
      </div>
    )
  }

  renderSideshow() {
    return (
      <Segment>
        <Image src="https://images.unsplash.com/photo-1515923019249-6b544314450f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" fluid />
      </Segment>
    )
  }
}
