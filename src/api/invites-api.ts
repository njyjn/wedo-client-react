import { apiEndpoint, apiKey } from '../config'
import { Invite } from '../types/Invite';
import { Guest } from '../types/Guest';
import { CreateInviteRequest } from '../types/CreateInviteRequest';
import Axios from 'axios'
import { UpdateInviteRequest } from '../types/UpdateInviteRequest';
import { RespondToInviteRequest } from '../types/RespondToInviteRequest';

export async function getInvite(idToken: string, inviteId: string): Promise<Invite> {
  console.log('Fetching Invite', inviteId);

  const response = await Axios.get(`${apiEndpoint}/invites/${inviteId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
      'x-api-key': `${apiKey}`
    },
  })
  console.log('Invite:', response.data);
  return response.data.item;
};

export async function getInvites(idToken: string): Promise<Invite[]> {
  console.log('Fetching Invites')

  const response = await Axios.get(`${apiEndpoint}/invites`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
      'x-api-key': `${apiKey}`
    },
  })
  console.log('Invites:', response.data)
  return response.data.items
};

export async function getGuests(idToken: string, inviteId: string): Promise<Guest[]> {
  console.log(`Fetching guests from invite ${inviteId}`);

  const response = await Axios.get(`${apiEndpoint}/invites/${inviteId}/guests`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
      'x-api-key': `${apiKey}`
    },
  })
  console.log('Guests:', response.data)
  return response.data.items
};

export async function createInvite(
  idToken: string,
  newInvite: CreateInviteRequest
): Promise<Invite> {
  const response = await Axios.post(`${apiEndpoint}/invites`,  JSON.stringify(newInvite), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
      'x-api-key': `${apiKey}`
    }
  })
  return response.data.newItem
};

export async function patchInvite(
  idToken: string,
  inviteId: string,
  updatedInvite: UpdateInviteRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/invites/${inviteId}`, JSON.stringify(updatedInvite), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
      'x-api-key': `${apiKey}`
    }
  })
};

// Public API to respond to invite provided invite credentials are correct
export async function respondToInvite(
  response: RespondToInviteRequest
): Promise<void> {
  await Axios.patch(
    `${apiEndpoint}/invites/${response.inviteId}/respond`,
    JSON.stringify({
      orgId: response.orgId,
      familyName: response.familyName,
      attending: response.attending
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': `${apiKey}`
      }
    }
  )
};

export async function deleteInvite(
  idToken: string,
  inviteId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/invites/${inviteId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
      'x-api-key': `${apiKey}`
    }
  })
};

export async function getUploadUrl(
  idToken: string,
  inviteId: string,
  fileName: string,
): Promise<string> {
  const response = await Axios.post(
    `${apiEndpoint}/invites/${inviteId}/attachment`,
    {
      fileName: fileName
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
        'x-api-key': `${apiKey}`
      }
  })
  return response.data.uploadUrl
};

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
};
