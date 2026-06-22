import { useGoogleSync } from '../hooks/useGoogleSync'

const HAS_CLIENT = !!import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function CloudSync({ sales }) {
  const { user, syncing, syncMsg, signIn, signOut, syncToSheets } = useGoogleSync()

  if (!HAS_CLIENT) return null

  return (
    <div className="card cloud-sync-card">
      <h2>クラウド同期</h2>
      {!user ? (
        <button className="btn-google-signin" onClick={signIn}>
          Googleでログイン
        </button>
      ) : (
        <div className="cloud-sync-content">
          <div className="cloud-sync-user">
            {user.picture && (
              <img
                src={user.picture}
                alt=""
                className="cloud-sync-avatar"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="cloud-sync-info">
              <div className="cloud-sync-name">{user.name}</div>
              <div className="cloud-sync-email">{user.email}</div>
            </div>
          </div>
          <div className="cloud-sync-actions">
            <button
              className="btn-sync"
              onClick={() => syncToSheets(sales, signOut)}
              disabled={syncing}
            >
              {syncing ? '同期中...' : 'スプレッドシートに同期'}
            </button>
            <button className="btn-signout" onClick={signOut}>
              ログアウト
            </button>
          </div>
          {syncMsg && <div className="sync-msg">{syncMsg}</div>}
        </div>
      )}
    </div>
  )
}
