import { useState, useEffect, useCallback } from 'react'

export default function TrainInfo() {
  const [delayed, setDelayed] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [updatedAt, setUpdatedAt] = useState(null)

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(false)
    fetch('/api/train-info')
      .then(r => r.json())
      .then(data => {
        setDelayed(data.delayed || [])
        setUpdatedAt(new Date())
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchData()
    const timer = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(timer)
  }, [fetchData])

  const statusClass = (status) => {
    if (status.includes('見合') || status.includes('運休') || status.includes('脱線')) return 'traffic-bad'
    return 'traffic-mid'
  }

  return (
    <div>
      {loading && <div className="train-status-msg">読み込み中...</div>}
      {error && <div className="train-status-msg error">情報を取得できませんでした</div>}
      {!loading && !error && delayed.length === 0 && (
        <div className="train-all-good">全路線正常運行中</div>
      )}
      {!loading && !error && delayed.length > 0 && (
        <div className="traffic-list">
          {delayed.map((t, i) => (
            <div key={i} className="traffic-item">
              <div className="traffic-road">{t.name}</div>
              <div className="traffic-detail">{t.detail}</div>
              <span className={`traffic-status ${statusClass(t.status)}`}>{t.status}</span>
            </div>
          ))}
        </div>
      )}
      <div className="traffic-update-row">
        {updatedAt && (
          <span className="traffic-update">
            Yahoo!路線 / {updatedAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        <button className="btn-refresh" onClick={fetchData} disabled={loading}>更新</button>
      </div>
    </div>
  )
}
