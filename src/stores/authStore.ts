import { create } from 'zustand'
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { api, type UserProfile } from '@/lib/api'

// Read admin UID from env — set at build time, never exposed as secret
const ADMIN_UID = import.meta.env.VITE_ADMIN_UID as string | undefined

interface AuthState {
  user: User | null
  loading: boolean
  isAdmin: boolean
  profile: UserProfile | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  initAuth: () => () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isAdmin: false,
  profile: null,

  signInWithGoogle: async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      console.error('Sign in error:', err)
      throw err
    }
  },

  signOut: async () => {
    await firebaseSignOut(auth)
    set({ user: null, isAdmin: false, profile: null })
  },

  refreshProfile: async () => {
    const { user } = useAuthStore.getState()
    if (!user) {
      set({ profile: null })
      return
    }
    try {
      const profile = await api.getMe()
      set({ profile })
    } catch (err) {
      console.error('Refresh profile error:', err)
    }
  },

  initAuth: () => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      const isAdmin = !!user && !!ADMIN_UID && user.uid === ADMIN_UID
      set({ user, loading: false, isAdmin })
      if (user) {
        useAuthStore.getState().refreshProfile()
      }
    })
    return unsub
  },
}))
