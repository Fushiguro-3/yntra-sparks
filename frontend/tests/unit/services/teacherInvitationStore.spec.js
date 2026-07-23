import { describe, it, expect } from 'vitest'
import { teacherInvitationStore } from '@/services/teacherInvitationStore'

describe('teacherInvitationStore', () => {
  it('creates a pending invitation scoped to a school', () => {
    const invite = teacherInvitationStore.create(1, { name: 'Jane Doe', email: 'Jane@Example.com' })
    expect(invite.status).toBe('pending')
    expect(invite.schoolId).toBe(1)
    expect(invite.email).toBe('jane@example.com') // normalized lowercase
    expect(invite.token).toEqual(expect.any(String))
    expect(invite.resendCount).toBe(0)
  })

  it('lists invitations scoped to the requested school only', () => {
    teacherInvitationStore.create(2, { name: 'A', email: 'a@school2.com' })
    teacherInvitationStore.create(3, { name: 'B', email: 'b@school3.com' })
    const school2 = teacherInvitationStore.listBySchool(2)
    expect(school2.every((i) => i.schoolId === 2)).toBe(true)
    expect(school2.some((i) => i.email === 'b@school3.com')).toBe(false)
  })

  it('detects a duplicate pending invite for the same email + school', () => {
    teacherInvitationStore.create(4, { name: 'A', email: 'dup@school4.com' })
    expect(teacherInvitationStore.hasPendingInvite(4, 'dup@school4.com')).toBe(true)
    expect(teacherInvitationStore.hasPendingInvite(4, 'DUP@school4.com')).toBe(true) // case-insensitive
    expect(teacherInvitationStore.hasPendingInvite(4, 'someone-else@school4.com')).toBe(false)
    // Different school, same email — not a duplicate.
    expect(teacherInvitationStore.hasPendingInvite(5, 'dup@school4.com')).toBe(false)
  })

  it('resend regenerates the token, bumps resendCount, and extends expiry', () => {
    const invite = teacherInvitationStore.create(6, { name: 'A', email: 'resend@school6.com' })
    const resent = teacherInvitationStore.resend(invite.id)
    expect(resent.token).not.toBe(invite.token)
    expect(resent.resendCount).toBe(1)
    expect(new Date(resent.expiresAt).getTime()).toBeGreaterThan(new Date(invite.expiresAt).getTime() - 1000)
    expect(resent.status).toBe('pending')
  })

  it('revoke marks the invitation revoked', () => {
    const invite = teacherInvitationStore.create(7, { name: 'A', email: 'revoke@school7.com' })
    const revoked = teacherInvitationStore.revoke(invite.id)
    expect(revoked.status).toBe('revoked')
    expect(teacherInvitationStore.hasPendingInvite(7, 'revoke@school7.com')).toBe(false)
  })

  it('markAccepted marks the invitation accepted with a timestamp', () => {
    const invite = teacherInvitationStore.create(8, { name: 'A', email: 'accept@school8.com' })
    const accepted = teacherInvitationStore.markAccepted(invite.id)
    expect(accepted.status).toBe('accepted')
    expect(accepted.acceptedAt).toEqual(expect.any(String))
  })

  it('computes expired status live once expiresAt has passed, without mutating storage', () => {
    const invite = teacherInvitationStore.create(9, { name: 'A', email: 'expired@school9.com' })
    // Backdate the stored expiresAt directly to simulate time passing.
    const raw = JSON.parse(localStorage.getItem('ys_teacher_invitations_v1'))
    const stored = raw.find((i) => i.id === invite.id)
    stored.expiresAt = new Date(Date.now() - 1000).toISOString()
    localStorage.setItem('ys_teacher_invitations_v1', JSON.stringify(raw))

    const [listed] = teacherInvitationStore.listBySchool(9)
    expect(listed.status).toBe('expired')
  })

  it('throws a 404-shaped error for an unknown invitation id', () => {
    expect(() => teacherInvitationStore.revoke('nonexistent-id')).toThrow()
  })
})
