import { useState, useEffect, useCallback } from 'react'

const DAYS = ['日', '月', '火', '水', '木', '金', '土']

const levelLabel = { high: '混雑予想', mid: '注目イベント' }
const levelClass = { high: 'badge-high', mid: 'badge-mid' }

export default function EventInfo() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [updatedAt, setUpdatedAt] = useState(null)

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(false)
    fetch('/api/events')
      .then(r => r.json())
      .then(data => {
        setEvents(data.events || [])
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
      <div className="traffic-update-row">
        {updatedAt && (
          <span className="traffic-update">
            年間カレンダー / {updatedAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        <button className="btn-refresh" onClick={fetchData} disabled={loading}>
          {loading ? '取得中...' : '更新'}
        </button>
      </div>
      {loading && <div className="train-status-msg">イベント情報を取得中...</div>}
      {error && <div className="train-status-msg error">情報を取得できませんでした</div>}
      {!loading && !error && events.length === 0 && (
        <div className="train-all-good">{new Date().toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}の大規模イベントはありません</div>
      )}
      {!loading && !error && events.length > 0 && (
        <div className="event-list">
          {events.map((ev, i) => (
            <div key={i} className="event-item">
              <div className="event-date">
                {new Date().toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })}
              </div>
              <div className="event-detail">
                <div className="event-name">{ev.name}</div>
                <div className="event-area">📍{ev.area}　{ev.venue}</div>
                <div className="event-end">終演 {ev.end}　👥 {Number(ev.cap).toLocaleString()}人規模</div>
              </div>
              <span className={`badge ${levelClass[ev.level] || 'badge-high'}`}>
                {levelLabel[ev.level] || '混雑予想'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
