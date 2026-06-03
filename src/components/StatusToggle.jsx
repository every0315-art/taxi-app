export default function StatusToggle({ isOnline, onToggle, onSimulate }) {
  return (
    <div className="card status-card">
      <div className="status-top">
        <div className="status-info">
          <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
          <span className="status-label">{isOnline ? '営業中' : 'オフライン'}</span>
        </div>
        {isOnline && (
          <button className="btn-simulate" onClick={onSimulate}>
            配車依頼
          </button>
        )}
      </div>
      <button className={`btn-toggle ${isOnline ? 'btn-stop' : 'btn-start'}`} onClick={onToggle}>
        {isOnline ? '営業を終了する' : '営業を開始する'}
      </button>
    </div>
  )
}
