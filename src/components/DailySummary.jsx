export default function DailySummary({ sales, totalSales }) {
  return (
    <div className="card">
      <h2>今日の集計</h2>
      <div className="summary-stats">
        <div className="stat">
          <div className="stat-value">¥{totalSales.toLocaleString()}</div>
          <div className="stat-label">売上合計</div>
        </div>
        <div className="stat">
          <div className="stat-value">{sales.length}</div>
          <div className="stat-label">件数</div>
        </div>
        <div className="stat">
          <div className="stat-value">
            {sales.length > 0 ? `¥${Math.round(totalSales / sales.length).toLocaleString()}` : '—'}
          </div>
          <div className="stat-label">平均単価</div>
        </div>
      </div>
      {sales.length > 0 && (
        <div className="sales-list">
          {sales.slice(0, 5).map(s => (
            <div key={s.id} className="sales-item">
              <div className="sales-route">
                {s.to ? `${s.from} → ${s.to}` : s.from}
              </div>
              <div className="sales-right">
                <span className="sales-time">{s.time}</span>
                <span className="sales-amount">¥{s.amount.toLocaleString()}</span>
              </div>
            </div>
          ))}
          {sales.length > 5 && (
            <div className="sales-more">他 {sales.length - 5} 件</div>
          )}
        </div>
      )}
    </div>
  )
}
