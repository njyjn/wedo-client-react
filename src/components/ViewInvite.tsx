import * as React from 'react'
import { History } from 'history'
import { Button, Checkbox, Divider, Grid, Header, Icon, Image, List, Loader, Menu } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { deleteInvite, getGuests, getInvite, patchInvite } from '../api/invites-api'
import { Invite } from '../types/Invite'
import { Guest } from '../types/Guest'
import { Link } from 'react-router-dom'

interface ViewInviteProps {
  match: {
    params: {
      InviteId: string
    }
  }
  auth: Auth
  history: History
}

interface ViewInviteState {
  Invite: Invite,
  Guests: Guest[],
  loadingInvite: boolean
}

export class ViewInvite extends React.PureComponent<ViewInviteProps, ViewInviteState> {
  state: ViewInviteState = {
    Invite: {} as Invite,
    Guests: [],
    loadingInvite: true
  }

  async componentDidMount() {
    try {
      const Invite = await getInvite(this.props.auth.getIdToken(), this.props.match.params.InviteId);
      const Guests = await getGuests(this.props.auth.getIdToken(), this.props.match.params.InviteId);
      this.setState({
        Invite: Invite,
        Guests: Guests,
        loadingInvite: false
      })
    } catch (e) {
      alert(`Failed to fetch Invite: ${e.message}`)
    }
  }

  onEditButtonClick = (inviteId: string) => {
    this.props.history.push(`/Invites/${inviteId}/edit`)
  }

  onUploadButtonClick = (inviteId: string) => {
    this.props.history.push(`/Invites/${inviteId}/upload`)
  }

  onInviteDelete = async (inviteId: string) => {
    try {
      await deleteInvite(this.props.auth.getIdToken(), inviteId);
      alert('Invite deleted');
      this.props.history.push(`/Invites`)
    } catch {
      alert('Invite deletion failed')
    }
  }

  render() {
    if (this.state.loadingInvite) {
      return this.renderLoading()
    }

    return (
      this.renderInvite()
    )
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Invite
        </Loader>
      </Grid.Row>
    )
  }

  renderOpsMenu() {
    const Invite = this.state.Invite;
    return (
      <Menu vertical>
        <Menu.Item
          icon
          color="blue"
          onClick={() => this.onEditButtonClick(Invite.inviteId)}
        >
          Edit <Icon name="pencil" />
        </Menu.Item>
        <Menu.Item
          icon
          color="yellow"
          onClick={() => this.onUploadButtonClick(Invite.inviteId)}
        >
          Attach <Icon name="attach" />
        </Menu.Item>
        <Menu.Item
          icon
          color="red"
          onClick={() => this.onInviteDelete(Invite.inviteId)}
        >
          Delete <Icon name="delete" />
        </Menu.Item>
      </Menu>
    )
  }

  renderInvite() {
    return (
      <div>
        <Header>
          <h1>View Invite</h1>
        </Header>
        <Divider />
        <Grid stackable padded='vertically'>
          {this.renderInviteSummary()}
          {this.renderGuestInformation()}
          {this.renderAttachmentInformation()}
        </Grid>
      </div>

    )
  }

  renderInviteSummary() {
    const Invite = this.state.Invite;
    return (
      <Grid.Row>
        <Grid.Column width={2}>
          {Invite.qrCodeUrl && (
            <Image src={this.state.Invite.qrCodeUrl} size="large" wrapped centered />
          )}
        </Grid.Column>
        <Grid.Column width={10} verticalAlign='middle'>
            <Header>{Invite.familyName}</Header>
            {Invite.inviteId}
            <Divider />
            <Checkbox
              label='Responded'
              disabled
              checked={Invite.responded}
            />
            <br />
            <Checkbox
              label='Attending'
              disabled
              checked={Invite.attending}
            />
        </Grid.Column>
        <Grid.Column width={4}>
          {this.renderOpsMenu()}
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderAttachmentInformation() {
    const AttachmentList = [];
    if (this.state.Invite.attachments) {
      const Attachments = this.state.Invite.attachments.values();
      //@ts-ignore
      for (const Attachment: string of Attachments) {
        AttachmentList.push(
          <List.Item
            icon='file'
            content={<a href={Attachment}>{Attachment}</a>}
          />
        );
      }
    }
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Header>Attachments ({AttachmentList.length})</Header>
          <Divider />
        </Grid.Column>
        <Grid.Column width={16}>
          <List>
            {AttachmentList}
          </List>
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderGuestInformation() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Header>Guest Information</Header>
          <Divider />
        </Grid.Column>
        <Grid.Column width={16}>
          <List horizontal>
            {this.state.Guests.map((Guest, pos) => {
              const contact = Guest.contact? Guest.contact : 'No contact info'
              return (
                <List.Item key={Guest.guestId}>
                  <List.Content>
                    <List.Header>
                      {Guest.fullName}
                    </List.Header>
                    {contact}
                  </List.Content>
                </List.Item>
              )
            })}
          </List>
        </Grid.Column>
      </Grid.Row>
    )
  }
}
