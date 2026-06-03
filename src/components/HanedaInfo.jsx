import { useState, useEffect, useCallback } from 'react'

const STATUS_CLASS = { 空車: 'haneda-ok', 混雑: 'haneda-mid', 満車: 'haneda-full', エラー: 'haneda-err' }

export default function HanedaInfo() {
  const [parking, setParking] = useState([])
  const [updatedAt, setUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(false)
    fetch('/api/haneda')
      .then(r => r.json())
      .then(data => {
        setParking(data.parking || [])
        setUpdatedAt(data.updatedAt || null)
        setLoading(false)
      })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const fullCount = parking.filter(p => p.status === '満車').length
  const allFull = parking.length > 0 && fullCount === parking.length

  return (
    <div>
      {loading && <div className="train-status-msg">読み込み中...</div>}
      {error  && <div className="train-status-msg error">情報を取得できませんでした</div>}

      {!loading && !error && (
        <>
          {allFull && (
            <div className="haneda-alert">全駐車場 満車 — 乗客増の可能性あり</div>
          )}
          <div className="haneda-grid">
            {parking.map(p => (
              <div key={p.name} className="haneda-lot">
                <span className="haneda-lot-name">{p.name}</span>
                <span className="haneda-lot-terminal">{p.terminal}</span>
                <span className={`haneda-lot-status ${STATUS_CLASS[p.status] || 'haneda-err'}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="traffic-update-row">
        {updatedAt && (
          <span className="traffic-update">羽田空港公式 / {updatedAt.replace(/^\d{4}\//, '')}</span>
        )}
        <button className="btn-refresh" onClick={fetchData} disabled={loading}>更新</button>
      </div>
    </div>
  )
}
