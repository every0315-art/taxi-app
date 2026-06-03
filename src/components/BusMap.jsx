const TERMINALS = [
  {
    id: 't1', label: '第1T', sublabel: '国内線', color: '#3b82f6',
    stops: [
      { num: '1', type: 'limousine', name: '京急バス/リムジン', dest: '東京・横浜方面' },
      { num: '2', type: 'express',   name: 'エアポートバス東京・横浜', dest: '東京駅・横浜（格安）' },
      { num: '3', type: 'limousine', name: '東京空港交通', dest: '新宿・池袋・都内ホテル' },
    ],
    hotel: '羽田エクセルホテル東急 / プレミアホテル-CABIN-羽田',
  },
  {
    id: 't2', label: '第2T', sublabel: '国内線', color: '#22c55e',
    stops: [
      { num: '1', type: 'limousine', name: '京急バス/リムジン', dest: '東京・横浜方面' },
      { num: '2', type: 'express',   name: 'エアポートバス東京・横浜', dest: '東京駅・横浜（格安）' },
      { num: '3', type: 'limousine', name: '東京空港交通', dest: '新宿・池袋・都内ホテル' },
    ],
    hotel: 'ホテル JAL シティ羽田 / ヴィラフォンテーヌ羽田',
  },
  {
    id: 't3', label: '第3T', sublabel: '国際線', color: '#f97316',
    stops: [
      { num: '1・2', type: 'limousine', name: '京急バス/リムジン', dest: '東京・横浜方面' },
      { num: '3',   type: 'express',   name: 'エアポートバス東京・横浜', dest: '東京駅・横浜（格安）' },
      { num: '4-6', type: 'limousine', name: '東京空港交通', dest: '都内ホテル・新宿・成田' },
    ],
    hotel: 'ファーストキャビン羽田 / ヴィラフォンテーヌ羽田',
  },
]

const TYPE_COLOR = {
  limousine: { bg: 'rgba(59,130,246,0.12)',  text: '#3b82f6' },
  express:   { bg: 'rgba(34,197,94,0.12)',   text: '#22c55e' },
}

export default function BusMap() {
  return (
    <div className="busmap-wrap">

      {/* 凡例 */}
      <div className="busmap-legend">
        <span className="busmap-legend-item limousine">リムジン・一般路線</span>
        <span className="busmap-legend-item express">格安バス</span>
        <span className="busmap-legend-item hotel">🏨 ホテル送迎</span>
        <span className="busmap-legend-item shuttle">🔄 ターミナル循環</span>
      </div>

      {/* ターミナル道路図 */}
      <div className="busmap-road">
        <div className="busmap-road-line" />
        {TERMINALS.map((t, ti) => (
          <div key={t.id} className="busmap-terminal-col">
            {/* ターミナルビル */}
            <div className="busmap-building" style={{ borderColor: t.color }}>
              <div className="busmap-building-label" style={{ background: t.color }}>{t.label}</div>
              <div className="busmap-building-sub">{t.sublabel}</div>
              <div className="busmap-building-floor">1F 到着口</div>
            </div>
            {/* 矢印 */}
            <div className="busmap-arrow">↓</div>
            {/* バス停 */}
            <div className="busmap-stops">
              {t.stops.map((s, si) => (
                <div key={si} className="busmap-stop">
                  <div className="busmap-stop-num" style={{ background: TYPE_COLOR[s.type].bg, color: TYPE_COLOR[s.type].text }}>
                    {s.num}番
                  </div>
                  <div className="busmap-stop-info">
                    <div className="busmap-stop-name">{s.name}</div>
                    <div className="busmap-stop-dest">{s.dest}</div>
                  </div>
                </div>
              ))}
              {/* ホテル送迎 */}
              <div className="busmap-stop hotel-stop">
                <div className="busmap-stop-num hotel-num">🏨</div>
                <div className="busmap-stop-info">
                  <div className="busmap-stop-name">ホテル送迎</div>
                  <div className="busmap-stop-dest">{t.hotel}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ターミナル循環バス */}
      <div className="busmap-shuttle">
        <span className="busmap-shuttle-icon">🔄</span>
        <div className="busmap-shuttle-info">
          <div className="busmap-shuttle-title">ターミナル間循環バス（無料）</div>
          <div className="busmap-shuttle-route">第1T ↔ 第2T ↔ 第3T（国際線）　所要 約15分</div>
          <div className="busmap-shuttle-stand">各ターミナル 1F 到着ロビー外 のりば</div>
        </div>
      </div>

      <div className="fare-source">参考情報 / 運行状況は各社公式でご確認ください</div>
    </div>
  )
}
