// Frontend-only Teacher invitation lifecycle for the Principal portal:
// pending -> accepted | expired | revoked. This sits ON TOP of the existing
// teacherService.create() one-time-temp-password flow rather than
// replacing it — accepting an invitation calls that same real create() call
// (see mockPrincipalService-style callers), so there is exactly one way a
// mock teacher account ever comes into existence.
//
// Designed for a future real backend: token/email delivery would move
// server-side, but the statuses and lifecycle here should map directly.
// See docs/frontend-api-dependencies.md.
import { readJSON, writeJSON } from '@/utils/mockStorage'

const STORAGE_KEY = 'ys_teacher_invitations_v1'
const EXPIRY_DAYS = 7

function readAll() {
  return readJSON(STORAGE_KEY, [])
}

function writeAll(invites) {
  writeJSON(STORAGE_KEY, invites)
}

function nextId() {
  return `inv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/** A mock-only token — clearly not a real secret, never sent anywhere real. */
function generateToken() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function withComputedStatus(invite) {
  // Expiry is computed live from expiresAt rather than mutated on a cron,
  // so listing always reflects reality without a background job.
  if (invite.status === 'pending' && new Date(invite.expiresAt).getTime() < Date.now()) {
    return { ...invite, status: 'expired' }
  }
  return invite
}

function find(invites, id) {
  const invite = invites.find((i) => i.id === id)
  if (!invite) throw { message: 'Invitation not found', status: 404 }
  return invite
}

export const teacherInvitationStore = {
  listBySchool(schoolId) {
    return readAll()
      .filter((i) => i.schoolId === Number(schoolId))
      .map(withComputedStatus)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  hasPendingInvite(schoolId, email) {
    const normalized = email.trim().toLowerCase()
    return this.listBySchool(schoolId).some((i) => i.email === normalized && i.status === 'pending')
  },

  create(schoolId, { name, email, phone = '', gradeOrSubject = '' }) {
    const invites = readAll()
    const invite = {
      id: nextId(),
      schoolId: Number(schoolId),
      name,
      email: email.trim().toLowerCase(),
      phone,
      gradeOrSubject,
      status: 'pending',
      token: generateToken(),
      resendCount: 0,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString()
    }
    invites.push(invite)
    writeAll(invites)
    return invite
  },

  resend(id) {
    const invites = readAll()
    const invite = find(invites, id)
    invite.token = generateToken()
    invite.resendCount += 1
    invite.status = 'pending'
    invite.expiresAt = new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString()
    writeAll(invites)
    return invite
  },

  revoke(id) {
    const invites = readAll()
    const invite = find(invites, id)
    invite.status = 'revoked'
    writeAll(invites)
    return invite
  },

  markAccepted(id) {
    const invites = readAll()
    const invite = find(invites, id)
    invite.status = 'accepted'
    invite.acceptedAt = new Date().toISOString()
    writeAll(invites)
    return invite
  }
}
