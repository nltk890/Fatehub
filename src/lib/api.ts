/**
 * API client for Cloudflare Workers backend.
 * All requests include the Firebase ID token for server-side auth verification.
 */

import { auth } from '@/lib/firebase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

// ── HTTP helper ────────────────────────────────────────────────────
async function getIdToken(): Promise<string> {
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')
  return await user.getIdToken()
}

async function apiFetch<T>(path: string, options?: RequestInit, isBlob = false): Promise<T> {
  const token = await getIdToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options?.headers || {}),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error((err as { error: string }).error || `HTTP ${res.status}`)
  }
  if (isBlob) return res.blob() as unknown as T
  return res.json() as Promise<T>
}

// ── Types ──────────────────────────────────────────────────────────
export interface UserProfile {
  uid: string
  displayName: string
  email: string
  points: number
  lifetimePoints: number
  tier: string
  createdAt: number
  isAdmin: boolean
  dailyClaimAt: number
}

export interface Transaction {
  id: number
  delta: number
  reason: string
  meta: string | null
  createdAt: number
}

export interface LeaderboardEntry {
  rank: number
  displayName: string
  lifetimePoints: number
  tier: string
  uid: string
}

export interface Reward {
  id: number
  name: string
  description: string
  cost: number
  type: string
  stock: number
  imageUrl?: string
  isActive: boolean
}

export interface InventoryItem {
  inventoryId: number
  rewardId: number
  name: string
  type: string
  content: string
  instructions: string
  acquiredAt: number
}

// ── API methods ────────────────────────────────────────────────────
export const api = {
  /** Fetch the current user's profile from D1. Creates user on first call. */
  getMe: () => apiFetch<UserProfile>('/api/me'),

  /** Get last 20 point transactions for current user. */
  getTransactions: () => apiFetch<Transaction[]>('/api/transactions'),

  /** Get public leaderboard (top 10 by lifetime points). */
  getLeaderboard: () => apiFetch<LeaderboardEntry[]>('/api/leaderboard'),

  /** Get all active store reward items. */
  getRewards: () => apiFetch<Reward[]>('/api/rewards'),

  /** Claim a hidden video code. Returns points awarded + new balance. */
  claimCode: (code: string) =>
    apiFetch<{ ok: boolean; pointsAwarded: number; newBalance: number }>(
      '/api/claim-code',
      { method: 'POST', body: JSON.stringify({ code }) }
    ),

  /** Redeem a store reward. Returns new balance after deduction. */
  redeem: (rewardId: number) =>
    apiFetch<{ ok: boolean; newBalance: number }>(
      '/api/redeem',
      { method: 'POST', body: JSON.stringify({ rewardId }) }
    ),

  /** Daily claim reward */
  dailyClaim: () =>
    apiFetch<{ ok: boolean; pointsAwarded: number; newDailyClaimAt: number }>(
      '/api/daily-claim',
      { method: 'POST' }
    ),

  /** Get user owned inventory items */
  getInventory: () => apiFetch<InventoryItem[]>('/api/inventory'),

  /** Securely fetch a digital asset stream */
  downloadInventoryItem: (inventoryId: number) => 
    apiFetch<Blob>(`/api/inventory/download/${inventoryId}`, {
      headers: { 'Accept': '*/*' } 
    }, true),

  // ── Admin-only endpoints ───────────────────────────────────────
  admin: {
    getStats: () => apiFetch<{
      totalUsers: number; codesClaimed: number; pointsCirculating: number; activeCodes: number; adminUid: string
    }>('/api/admin/stats'),

    createCode: (data: { code?: string; pointsValue: number; usesRemaining: number; expiresInHours?: number }) =>
      apiFetch<{ ok: boolean; code: string; pointsValue: number; usesRemaining: number; expiresAt: number | null }>(
        '/api/admin/create-code', { method: 'POST', body: JSON.stringify(data) }
      ),

    adjustPoints: (targetUid: string, delta: number, reason: string) =>
      apiFetch<{ ok: boolean; newBalance: number }>(
        '/api/admin/adjust-points', { method: 'POST', body: JSON.stringify({ targetUid, delta, reason }) }
      ),

    getUsers: () => apiFetch<UserProfile[]>('/api/admin/users'),

    // Store Management
    getRewards: () => apiFetch<(Reward & { content?: string, instructions?: string })[]>('/api/admin/rewards'),
    
    createReward: (data: Partial<Reward> & { content?: string, instructions?: string }) =>
      apiFetch<{ ok: boolean }>('/api/admin/create-reward', {
        method: 'POST', body: JSON.stringify(data)
      }),
      
    updateReward: (data: Partial<Reward> & { id: number, content?: string, instructions?: string }) =>
      apiFetch<{ ok: boolean }>('/api/admin/update-reward', {
        method: 'POST', body: JSON.stringify(data)
      }),

    notifyUser: (targetUid: string, subject: string, message: string) =>
      apiFetch<{ ok: boolean }>('/api/admin/notify-user', {
        method: 'POST', body: JSON.stringify({ targetUid, subject, message })
      }),
  },
}
