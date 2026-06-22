import { useState, useCallback } from 'react'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const SHEET_ID  = import.meta.env.VITE_GOOGLE_SHEET_ID  || ''
const SCOPE     = 'https://www.googleapis.com/auth/spreadsheets'
const AUTH_KEY  = 'gauth_user'
const TOKEN_KEY = 'gauth_token'

export function useGoogleSync() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY)) } catch { return null }
  })
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState(null)

  const signIn = useCallback(() => {
    if (!CLIENT_ID || !window.google?.accounts?.oauth2) return
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: async (response) => {
        if (!response.access_token) return
        const token = response.access_token
        setAccessToken(token)
        localStorage.setItem(TOKEN_KEY, token)
        try {
          const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
          })
          const info = await res.json()
          const u = { name: info.name, email: info.email, picture: info.picture }
          setUser(u)
          localStorage.setItem(AUTH_KEY, JSON.stringify(u))
        } catch { /* ignore */ }
      }
    })
    client.requestAccessToken()
  }, [])

  const signOut = useCallback(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    // トークンを確実に失効させてから状態を削除する
    // disableAutoSelect()だけでは次回ロード時に自動再ログインされるため revoke() が必須
    if (token && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(token, () => {})
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect()
    }
    setUser(null)
    setAccessToken(null)
    localStorage.removeItem(AUTH_KEY)
    localStorage.removeItem(TOKEN_KEY)
    setSyncMsg(null)
  }, [])

  const syncToSheets = useCallback(async (sales, onSignOut) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) { setSyncMsg('ログインが必要です'); return false }
    if (!SHEET_ID) { setSyncMsg('スプレッドシートIDが未設定です'); return false }
    setSyncing(true)
    setSyncMsg(null)
    try {
      const date = new Date().toLocaleDateString('ja-JP')
      const values = sales.map(s => [date, s.time, s.from, s.to || '', s.amount])
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A:E:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ values })
        }
      )
      if (!res.ok) {
        if (res.status === 401) {
          onSignOut?.()
          setSyncMsg('セッション切れ。再ログインしてください')
        } else {
          setSyncMsg('同期エラー')
        }
        return false
      }
      setSyncMsg('同期完了')
      return true
    } catch {
      setSyncMsg('同期エラー')
      return false
    } finally {
      setSyncing(false)
    }
  }, [])

  return { user, accessToken, syncing, syncMsg, signIn, signOut, syncToSheets }
}
