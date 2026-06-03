export default function DrivingBriefing({ briefing, loading }) {
  if (loading) {
    return (
      <div className="card briefing-card">
        <div className="briefing-loading">情報を取得中...</div>
      </div>
    )
  }

  const { events = [], traffic = [], trains = [] } = briefing || {}
  const hasItems = events.length > 0 || traffic.length > 0 || trains.length > 0

  return (
    <div className="card briefing-card">
      <div className="briefing-header">
        <span className="briefing-title">本日の注意情報</span>
      </div>

      {!hasItems && (
        <div className="briefing-empty">特記事項なし — 順調な営業日です</div>
      )}

      {events.length > 0 && (
        <div className="briefing-section">
          <div className="briefing-section-label">🎪 イベント</div>
          {events.map((ev, i) => (
            <div key={i} className="briefing-item">
              <span className="briefing-item-name">{ev.name}</span>
              <span className="briefing-item-sub">{ev.venue}　終演 {ev.end}</span>
            </div>
          ))}
        </div>
      )}

      {traffic.length > 0 && (
        <div className="briefing-section">
          <div className="briefing-section-label">🚗 道路状況</div>
          {traffic.map((t, i) => (
            <div key={i} className="briefing-item">
              <span className="briefing-item-name">{t.road}</span>
              <span className={`briefing-badge ${t.level === 'bad' ? 'badge-high' : 'badge-mid'}`}>{t.status}</span>
            </div>
          ))}
        </div>
      )}

      {trains.length > 0 && (
        <div className="briefing-section">
          <div className="briefing-section-label">🚆 電車状況</div>
          {trains.map((t, i) => (
            <div key={i} className="briefing-item">
              <span className="briefing-item-name">{t.name}</span>
              <span className={`briefing-badge ${t.status.includes('見合') || t.status.includes('運休') ? 'badge-high' : 'badge-mid'}`}>{t.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
