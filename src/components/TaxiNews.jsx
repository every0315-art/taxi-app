import { useState, useEffect, useCallback } from 'react'

export default function TaxiNews() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [updatedAt, setUpdatedAt] = useState(null)

  const fetchNews = useCallback(() => {
    setLoading(true)
    setError(false)
    fetch('/api/taxi-news')
      .then(r => r.json())
      .then(data => {
        setNews(data.news || [])
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
  )
}
