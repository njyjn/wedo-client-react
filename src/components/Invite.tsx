import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import { Link } from 'react-router-dom'
import {
  Button,
  Checkbox,
  Select,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Card,
  DropdownProps,
  List,
  Dropdown,
  Pagination,
  Dimmer
} from 'semantic-ui-react'

import { createInvite, deleteInvite, getInvites, patchInvite } from '../api/invites-api'
import Auth from '../auth/Auth'
import { Invite } from '../types/Invite'

interface InvitesProps {
  auth: Auth
  history: History
}

interface InvitesState {
  Invites: Invite[]
  newInviteFamilyName: string
  newInviteType: string
  loadingInvites: boolean
  activePage: number
  nextElement: any
}

export class Invites extends React.PureComponent<InvitesProps, InvitesState> {
  state: InvitesState = {
    Invites: [],
    newInviteFamilyName: '',
    newInviteType: 'zoom',
    loadingInvites: true,
    activePage: 1,
    nextElement: undefined
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newInviteFamilyName: event.target.value })
  }

  handleTypeChange = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    const type = data.value ? data.value.toString() : 'zoom';
    this.setState({ newInviteType: type })
  }

  onEditButtonClick = (inviteId: string) => {
    this.props.history.push(`/Invites/${inviteId}/edit`)
  }

  onUploadButtonClick = (inviteId: string) => {
    this.props.history.push(`/Invites/${inviteId}/upload`)
  }

  onInviteCreate = async (event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      const newInvite = await createInvite(this.props.auth.getIdToken(), {
        familyName: this.state.newInviteFamilyName,
        type: this.state.newInviteType,
      })
      this.setState({
        Invites: [newInvite, ...this.state.Invites],
        newInviteFamilyName: '',
        newInviteType: ''
      })
    } catch (e) {
      alert('Invite creation failed')
    }
  }

  onInviteDelete = async (inviteId: string) => {
    try {
      await deleteInvite(this.props.auth.getIdToken(), inviteId)
      this.setState({
        Invites: this.state.Invites.filter(Invite => Invite.inviteId != inviteId)
      })
    } catch {
      alert('Invite deletion failed')
    }
  }

  onInviteResponded = async (pos: number) => {
    try {
      const Invite = this.state.Invites[pos]
      await patchInvite(this.props.auth.getIdToken(), Invite.inviteId, {
        familyName: Invite.familyName,
        type: Invite.type,
        responded: !Invite.responded,
        attending: Invite.attending
      })
      this.setState({
        Invites: update(this.state.Invites, {
          [pos]: { responded: { $set: !Invite.responded } }
        }),
      })
    } catch {
      alert('Invite could not be marked responded')
    }
  }

  onInviteAttending = async (pos: number) => {
    try {
      const Invite = this.state.Invites[pos]
      await patchInvite(this.props.auth.getIdToken(), Invite.inviteId, {
        familyName: Invite.familyName,
        type: Invite.type,
        responded: Invite.responded,
        attending: !Invite.attending
      })
      this.setState({
        Invites: update(this.state.Invites, {
          [pos]: { attending: { $set: !Invite.attending } }
        }),
      })
    } catch {
      alert('Invite could not be marked attending')
    }
  }

  async componentDidMount() {
    try {
      const Invites = await getInvites(this.props.auth.getIdToken())
      this.setState({
        Invites,
        loadingInvites: false
      })
    } catch (e) {
      alert(`Failed to fetch Invites: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Invites</Header>
        {this.renderCreateInviteInput()}
        {/* {this.renderFilterBar()} */}
        {this.renderInvites()}
        {/* {this.renderPagination()} */}
      </div>
    )
  }

  renderPagination() {
    return (
      <Grid.Row centered padded>
        <Divider hidden />
        <Pagination activePage={this.state.activePage} defaultActivePage={1} totalPages={10} />
      </Grid.Row>
    )
  }

  renderFilterBar() {
    return (
      <Grid.Row>
        <Dropdown
          text='Filter'
          icon='filter'
          floating
          labeled
          button
          className='icon'
        >
          <Dropdown.Menu>
            <Dropdown.Header icon='tags' content='Filter by type' />
            <Dropdown.Item>Guest</Dropdown.Item>
            <Dropdown.Item>Zoom</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Divider hidden />
      </Grid.Row>
    )
  }

  renderCreateInviteInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            fluid
            type='text'
            placeholder='Enter name of primary guest'
            action
            onChange={this.handleNameChange}
            >
              <input />
              <Select
                name='type'
                compact
                defaultValue='zoom'
                selection
                options={[
                  { key: 'zoom', text: 'Zoom', value: 'zoom' },
                  { key: 'guest', text: 'Guest', value: 'guest' }
                ]}
                onChange={this.handleTypeChange}
              />
              <Button
                color='green'
                type='submit'
                onClick = {this.onInviteCreate}
              >Quick Add</Button>
            </Input>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderInvites() {
    if (this.state.loadingInvites) {
      return this.renderLoading()
    }

    return this.renderInvitesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Invites
        </Loader>
      </Grid.Row>
    )
  }

  renderLoadingUpdate() {
    return (
      <Grid.Row>
        <Dimmer dimmed>
          <Loader indeterminate active inline="centered">
            Updating...
          </Loader>
        </Dimmer>
      </Grid.Row>
    )
  }

  renderInvitesList() {
    return (
      <Card.Group>
        {this.state.Invites.map((Invite, pos) => {
          return (
            <Card
              color={
                Invite.attending ? 'green' :
                  (Invite.responded ? 'pink' : 'grey')
              }
              key={Invite.inviteId}
            >
              {Invite.qrCodeUrl && (
                <Image alt='QR code generating... Refresh page when ready' src={Invite.qrCodeUrl} size="tiny" wrapped centered />
              )}
              <Card.Content>
                <Card.Header>
                  <Link to={`/Invites/${Invite.inviteId}/view`}>
                    {Invite.familyName}
                  </Link>
                </Card.Header>
                <Card.Meta>
                  {Invite.inviteId}
                </Card.Meta>
                <Card.Description>
                  Type: {Invite.type}<Divider />
                  Created {new Date(Invite.createTs).toDateString()}
                </Card.Description>
                </Card.Content>
                <Card.Content extra>
                  <Checkbox
                      label='Responded'
                      checked={Invite.responded}
                      onClick={() => this.onInviteResponded(pos)}
                  />
                  <br />
                  <Checkbox
                      label='Attending'
                      checked={Invite.attending}
                      onClick={() => this.onInviteAttending(pos)}
                  />
                  <Divider />
                  <Button
                    icon
                    color="blue"
                    onClick={() => this.onEditButtonClick(Invite.inviteId)}
                  >
                    <Icon name="pencil" />
                  </Button>
                  <Button
                  icon
                  color="yellow"
                  onClick={() => this.onUploadButtonClick(Invite.inviteId)}
                  >
                    <Icon name="attach" />
                  </Button>
                  <Button
                  icon
                  color="red"
                  onClick={() => this.onInviteDelete(Invite.inviteId)}
                  >
                    <Icon name="delete" />
                  </Button>
              </Card.Content>
            </Card>
          )})
        }
      </Card.Group>
    )
  }
}
