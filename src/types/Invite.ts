import { Guest } from './Guest';

export interface Invite {
  inviteId: string
  familyName: string
  createTs: string
  type: string
  qrCodeUrl?: string
  responded: boolean
  attending: boolean,
  attachments?: Set<string>,
}
