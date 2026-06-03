export default function RideRequest({ request, onAccept, onReject }) {
  if (!request) return null

  return (
    <div className="overlay">
      <div className="card ride-request-card">
        <h2>配車依頼</h2>
        <div className="ride-info">
          <div className="ride-row">
            <span className="ride-icon">📍</span>
            <div>
              <div className="ride-sub">乗車</div>
              <div className="ride-place">{request.from}</div>
            </div>
          </div>
          <div className="ride-row">
            <span className="ride-icon">🏁</span>
            <div>
              <div className="ride-sub">降車</div>
              <div className="ride-place">{request.to}</div>
            </div>
          </div>
          <div className="ride-row">
            <span className="ride-icon">📏</span>
            <div>
              <div className="ride-sub">距離 / 概算料金</div>
              <div className="ride-place">{request.distance} / ¥{request.fare.toLocaleString()}</div>
            </div>
          </div>
        </div>
        <div className="ride-actions">
          <button className="btn-reject" onClick={onReject}>拒否</button>
          <button className="btn-accept" onClick={onAccept}>承認</button>
        </div>
      </div>
    </div>
  )
}
