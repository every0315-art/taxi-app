import { useState, useEffect, useCallback } from 'react'

const CATEGORY_ONLY = /^(事業者・運転者|プレスリリース|お知らせ|重要なお知らせ|一般|乗客)$/

export default function TaxiNews() {
  const [news, setNews] = useState([])
  const [pickupNews, setPickupNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [pickupExpanded, setPickupExpanded] = useState(false)

  const fetchNews = useCallback(() => {
    setLoading(true)
    setError(false)
    fetch('/api/taxi-news')
      .then(r => r.json())
      .then(data => {
        setNews(data.news || [])
        setPickupNews(data.pickupNews || [])
        setUpdatedAt(new Date())
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  useEffect(() => { fetchNews() }, [fetchNews])

  return (
    <div>
      <div className="card">
        <h2>タクシー関連 お知らせ</h2>
        {loading && <div className="train-status-msg">読み込み中...</div>}
        {error && <div className="train-status-msg error">情報を取得できませんでした</div>}
        {!loading && !error && news.length === 0 && (
          <div className="train-status-msg">お知らせはありません</div>
        )}
        {!loading && !error && news.length > 0 && (
          <div className="taxi-news-list">
            {news.map((item, i) => (
              <div key={i} className="taxi-news-item">
                <div className="taxi-news-date">
                  <div>{item.date}</div>
                  <div className="taxi-news-source">{item.source}</div>
                </div>
                <div className="taxi-news-title">
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
                  ) : item.title}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="traffic-update-row">
          {updatedAt && (
            <span className="traffic-update">
              最終更新: {updatedAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button className="btn-refresh" onClick={fetchNews} disabled={loading}>更新</button>
        </div>
      </div>

      {!loading && !error && pickupNews.length > 0 && (
        <div className="card" style={{ marginTop: '12px' }}>
          <h2
            onClick={() => setPickupExpanded(e => !e)}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            タクシーニュース
            <span style={{ fontSize: '12px', marginLeft: '8px', color: 'var(--text-tertiary)', fontWeight: 'normal' }}>
              {pickupExpanded ? `全${Math.min(pickupNews.length, 50)}件 ▲` : `${pickupNews.length}件 ▼`}
            </span>
          </h2>
          <div className="taxi-news-list">
            {pickupNews.slice(0, pickupExpanded ? 50 : 5).map((item, i) => (
              <div key={i} className="taxi-news-item">
                <div className="taxi-news-date">
                  <div>{item.date}</div>
                  <div className="taxi-news-source">{item.source}</div>
                </div>
                <div className="taxi-news-title">
                  <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
                </div>
              </div>
            ))}
          </div>
          {!pickupExpanded && pickupNews.length > 5 && (
            <button className="btn-refresh" style={{ marginTop: '8px', width: '100%' }} onClick={() => setPickupExpanded(true)}>
              もっと見る（全{Math.min(pickupNews.length, 50)}件）
            </button>
          )}
        </div>
      )}
    </div>
  )
}
