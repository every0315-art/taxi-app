import { useState, useEffect, useCallback } from 'react'

const statusClass = { mid: 'traffic-mid', bad: 'traffic-bad' }

export default function TrafficInfo() {
  const [traffic, setTraffic] = useState([])
  const [closures, setClosures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [updatedAt, setUpdatedAt] = useState(null)

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(false)
    Promise.all([
      fetch('/api/traffic').then(r => r.json()),
      fetch('/api/shutoko').then(r => r.json()),
    ])
      .then(([trafficData, shutokoData]) => {
        setTraffic(trafficData.traffic || [])
        setClosures(shutokoData.closures || [])
        setUpdatedAt(new Date())
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div>
      {loading && <div className="train-status-msg">読み込み中...</div>}
      {error && <div className="train-status-msg error">情報を取得できませんでした</div>}

      {!loading && !error && (
        <>
          {traffic.length === 0 ? (
            <div className="train-all-good">首都高 全線順調</div>
          ) : (
            <div className="traffic-list">
              {traffic.map((t, i) => (
                <div key={i} className="traffic-item">
                  <div className="traffic-road">{t.road}</div>
                  <div className="traffic-detail">{t.detail}</div>
                  <span className={`traffic-status ${statusClass[t.level]}`}>{t.status}</span>
                </div>
              ))}
            </div>
          )}

          {closures.length > 0 && (
            <>
              <div className="ic-regulation-header">首都高 出入口閉鎖（{new Date().toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}）</div>
              <div className="traffic-list">
                {closures.map((c, i) => (
                  <div key={i} className="traffic-item">
                    <div className="traffic-road">{c.name}</div>
                    <div className="traffic-detail"></div>
                    <span className="traffic-status traffic-bad">通行止め</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <div className="traffic-update-row">
        {updatedAt && (
          <span className="traffic-update">
            NAVITIME・首都高 / {updatedAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        <button className="btn-refresh" onClick={fetchData} disabled={loading}>更新</button>
      </div>
    </div>
  )
}
