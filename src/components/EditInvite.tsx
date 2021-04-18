import * as React from 'react'
import { Form, Button, Select, DropdownProps, Grid, Loader } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getInvite, patchInvite } from '../api/invites-api'
import { Invite } from '../types/Invite'
import { History } from 'history'
import { UpdateInviteRequest } from '../types/UpdateInviteRequest'

interface EditInviteProps {
  match: {
    params: {
      InviteId: string
    }
  }
  auth: Auth
  history: History
}

interface EditInviteState {
  Invite: Invite,
  updateFamilyName: string,
  updateType: string,
  updateResponded?: boolean,
  updateAttending?: boolean,
  loadingForm: boolean
}

export class EditInvite extends React.PureComponent<EditInviteProps, EditInviteState> {
  state: EditInviteState = {
    Invite: {} as Invite,
    updateFamilyName: '',
    updateType: '',
    loadingForm: true
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      await patchInvite(
        this.props.auth.idToken,
        this.props.match.params.InviteId,
        {
          familyName: this.state.updateFamilyName,
          type: this.state.updateType,
          responded: this.state.updateResponded,
          attending: this.state.updateAttending
        } as UpdateInviteRequest
      );
      alert('Invite was edited!')
      this.props.history.goBack();
    } catch (e) {
      alert('Could not edit invite: ' + e.message)
    }
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let familyName = this.state.updateFamilyName;
    if (event.target.name === 'familyName') {
      familyName = event.target.value;
    }
    this.setState({
      updateFamilyName: familyName,
    })
  }

  handleSelectChange = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    const type = data.value ? data.value.toString() : 'zoom';
    this.setState({ updateType: type })
  }

  handleSelectAttendingChange = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    const type = data.value as boolean;
    console.log(type)
    this.setState({ updateAttending: type })
  }

  handleSelectRespondedChange = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    const type = data.value as boolean;
    this.setState({ updateResponded: type })
  }

  async componentDidMount() {
    try {
      const Invite = await getInvite(this.props.auth.getIdToken(), this.props.match.params.InviteId);
      this.setState({
        Invite: Invite,
        updateFamilyName: Invite.familyName,
        updateType: Invite.type,
        updateAttending: Invite.attending,
        updateResponded: Invite.responded,
        loadingForm: false
      })
    } catch (e) {
      alert(`Failed to fetch Invite: ${e.message}`)
    }
  }

  render() {
    if (this.state.loadingForm) {
      return this.renderLoading()
    }

    return (
      this.renderForm()
    )
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Form
        </Loader>
      </Grid.Row>
    )
  }

  renderForm() {
    return (
      <div>
        <h1>Edit invite</h1>
        <h3>{this.state.Invite.inviteId}</h3>
        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Family Name</label>
            <input
              name='familyName'
              type="text"
              defaultValue={this.state.Invite.familyName}
              placeholder="Last name of family"
              onChange={this.handleChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Type</label>
            <Select
              name='type'
              value={this.state.updateType}
              compact
              selection
              options={[
                { key: 'zoom', text: 'Zoom', value: 'zoom' },
                { key: 'guest', text: 'Guest', value: 'guest' }
              ]}
              placeholder="Type of invite"
              onChange={this.handleSelectChange}
            />
          </Form.Field>
          <Form.Group widths={'equal'}>
          <Form.Field>
            <label>Responded</label>
            <Select
              name='responded'
              value={this.state.updateResponded}
              compact
              selection
              options={[
                { key: 'responded', text: 'Yes', value: true },
                { key: 'notResponded', text: 'No', value: false }
              ]}
              onChange={this.handleSelectRespondedChange}
            />
          </Form.Field>
            <Form.Field>
              <label>Attending</label>
              <Select
                name='attending'
                value={this.state.updateAttending}
                compact
                selection
                options={[
                  { key: 'attending', text: 'Yes', value: true },
                  { key: 'notAttending', text: 'No', value: false }
                ]}
                onChange={this.handleSelectAttendingChange}
              />
            </Form.Field>
          </Form.Group>
          <Button
            color='blue'
            type="submit"
            onClick={this.handleSubmit}
          >
          Edit
        </Button>
        </Form>
      </div>
    )
  }
}
