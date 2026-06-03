import { useState, useEffect, useCallback } from 'react'

// 羽田空港定額運賃表（東タク協 特別区・武三地区 2026年版）
// 出典: https://www.taxi-tokyo.or.jp/teigaku/from.html
const FLAT_RATES = [
  { area: '大田区（空港周辺）',   day: '〜2,000', night: '〜2,600' },
  { area: '品川区・目黒区',       day: '3,000〜4,000', night: '3,900〜5,200' },
  { area: '港区',                 day: '4,500〜5,500', night: '5,900〜7,200' },
  { area: '渋谷区・世田谷区',     day: '4,500〜5,500', night: '5,900〜7,200' },
  { area: '新宿区・中野区',       day: '5,500〜6,500', night: '7,200〜8,500' },
  { area: '千代田区・中央区',     day: '5,500〜6,500', night: '7,200〜8,500' },
  { area: '台東区・文京区',       day: '6,500〜7,500', night: '8,500〜9,800' },
  { area: '墨田区・江東区',       day: '6,500〜8,000', night: '8,500〜10,400' },
  { area: '北区・板橋区・練馬区', day: '7,500〜9,000', night: '9,800〜11,700' },
  { area: '足立区・葛飾区・江戸川区', day: '8,000〜10,500', night: '10,400〜13,700' },
]

const STATUS_CLASS = { 空車: 'haneda-ok', 混雑: 'haneda-mid', 満車: 'haneda-full', エラー: 'haneda-err' }
const POOL_LEVEL_CLASS = { free: 'pool-free', normal: 'pool-normal', busy: 'pool-busy', closed: 'pool-closed', unknown: 'pool-unknown' }

export default function HanedaInfo() {
  const [parking, setParking]       = useState([])
  const [pools, setPools]           = useState([])
  const [parkUpdated, setParkUpdated] = useState(null)
  const [poolUpdated, setPoolUpdated] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(false)
  const [tab, setTab]               = useState('pool')

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(false)
    Promise.all([
      fetch('/api/haneda').then(r => r.json()),
      fetch('/api/taxi-pool').then(r => r.json()),
    ])
      .then(([hd, tp]) => {
        setParking(hd.parking || [])
        setPools(tp.pools || [])
        setParkUpdated(hd.updatedAt || null)
        setPoolUpdated(tp.updatedAt ? new Date(tp.updatedAt) : null)
        setLoading(false)
      })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const fullCount = parking.filter(p => p.status === '満車').length
  const allFull   = parking.length > 0 && fullCount === parking.length

  return (
    <div>
      <div className="airport-tabs">
        {[['pool','タクシープール'],['parking','駐車場'],['fare','定額運賃'],['bus','バス乗り場']].map(([k,l]) => (
          <button key={k} className={`airport-tab ${tab===k?'airport-tab-active':''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {loading && <div className="train-status-msg">読み込み中...</div>}
      {error   && <div className="train-status-msg error">情報を取得できませんでした</div>}

      {!loading && !error && tab === 'pool' && (
        <>
          <div className="pool-list">
            {pools.map(p => (
              <div key={p.id} className="pool-item">
                <span className="pool-label">{p.label}</span>
                <span className={`pool-status ${POOL_LEVEL_CLASS[p.level] || 'pool-unknown'}`}>
                  {p.level === 'closed' ? '運用外' : p.status}
                </span>
              </div>
            ))}
          </div>
          <div className="traffic-update-row">
            {poolUpdated && (
              <span className="traffic-update">
                東京タクシーセンター / {poolUpdated.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button className="btn-refresh" onClick={fetchData} disabled={loading}>更新</button>
          </div>
        </>
      )}

      {!loading && !error && tab === 'parking' && (
        <>
          {allFull && <div className="haneda-alert">全駐車場 満車 — 乗客増の可能性あり</div>}
          <div className="haneda-grid">
            {parking.map(p => (
              <div key={p.name} className="haneda-lot">
                <span className="haneda-lot-name">{p.name}</span>
                <span className="haneda-lot-terminal">{p.terminal}</span>
                <span className={`haneda-lot-status ${STATUS_CLASS[p.status] || 'haneda-err'}`}>{p.status}</span>
              </div>
            ))}
          </div>
          <div className="traffic-update-row">
            {parkUpdated && (
              <span className="traffic-update">羽田空港公式 / {String(parkUpdated).replace(/^\d{4}\//, '')}</span>
            )}
            <button className="btn-refresh" onClick={fetchData} disabled={loading}>更新</button>
          </div>
        </>
      )}

      {tab === 'bus' && (
        <div className="bus-info">
          {[
            { terminal: '第1ターミナル（国内線）', floor: '1F 到着ロビー外', gates: [
              { name: '京急バス・リムジン', stand: '1番のりば', dest: '品川・新橋・東京・横浜方面' },
              { name: 'エアポートバス東京・横浜', stand: '2番のりば', dest: '東京駅・横浜方面（格安）' },
              { name: '東京空港交通（リムジン）', stand: '3番のりば', dest: '都内各ホテル・新宿・池袋方面' },
            ]},
            { terminal: '第2ターミナル（国内線）', floor: '1F 到着ロビー外', gates: [
              { name: '京急バス・リムジン', stand: '1番のりば', dest: '品川・新橋・東京・横浜方面' },
              { name: 'エアポートバス東京・横浜', stand: '2番のりば', dest: '東京駅・横浜方面（格安）' },
              { name: '東京空港交通（リムジン）', stand: '3番のりば', dest: '都内各ホテル・新宿・池袋方面' },
            ]},
            { terminal: '第3ターミナル（国際線）', floor: '1F 到着ロビー外', gates: [
              { name: '京急バス・リムジン', stand: '1・2番のりば', dest: '品川・新橋・東京・横浜方面' },
              { name: 'エアポートバス東京・横浜', stand: '3番のりば', dest: '東京駅・横浜方面（格安）' },
              { name: '東京空港交通（リムジン）', stand: '4〜6番のりば', dest: '都内各ホテル・新宿・池袋・成田方面' },
            ]},
          ].map((t, ti) => (
            <div key={ti} className="bus-terminal">
              <div className="bus-terminal-name">{t.terminal}</div>
              <div className="bus-terminal-floor">{t.floor}</div>
              {t.gates.map((g, gi) => (
                <div key={gi} className="bus-gate">
                  <span className="bus-stand">{g.stand}</span>
                  <div className="bus-detail">
                    <div className="bus-operator">{g.name}</div>
                    <div className="bus-dest">{g.dest}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div className="bus-terminal">
            <div className="bus-terminal-name">🔄 ターミナル間循環バス</div>
            <div className="bus-terminal-floor">無料 / 各ターミナル1F 到着ロビー外</div>
            <div className="bus-gate">
              <span className="bus-stand">循環</span>
              <div className="bus-detail">
                <div className="bus-operator">羽田空港ターミナル連絡バス</div>
                <div className="bus-dest">第1T ↔ 第2T ↔ 第3T（国際線）所要約15分</div>
              </div>
            </div>
          </div>

          <div className="bus-terminal">
            <div className="bus-terminal-name">🏨 近隣ホテル送迎バス</div>
            <div className="bus-terminal-floor">各ターミナル1F 到着ロビー外 / 無料</div>
            {[
              { hotel: 'ホテル JAL シティ羽田 東京', time: '各T随時', stand: '要確認' },
              { hotel: '羽田エクセルホテル東急', time: '第1・2T 随時', stand: '1F 外' },
              { hotel: 'ファーストキャビン羽田', time: '第1・3T 随時', stand: '要確認' },
              { hotel: 'ヴィラフォンテーヌ羽田空港', time: '各T随時', stand: '1F 外' },
              { hotel: 'プレミアホテル-CABIN-羽田', time: '第1T 随時', stand: '要確認' },
            ].map((h, i) => (
              <div key={i} className="bus-gate">
                <span className="bus-stand">{h.stand}</span>
                <div className="bus-detail">
                  <div className="bus-operator">{h.hotel}</div>
                  <div className="bus-dest">{h.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="fare-source">参考情報 / 最新情報は各社公式でご確認ください</div>
        </div>
      )}

      {tab === 'fare' && (
        <>
          <div className="fare-note">※首都高利用前提。深夜(22時〜5時)は割増。有料道路別途。</div>
          <div className="fare-table">
            <div className="fare-row fare-header">
              <span>エリア</span>
              <span>通常</span>
              <span>深夜</span>
            </div>
            {FLAT_RATES.map((r, i) => (
              <div key={i} className="fare-row">
                <span className="fare-area">{r.area}</span>
                <span className="fare-price">¥{r.day}</span>
                <span className="fare-price night">¥{r.night}</span>
              </div>
            ))}
          </div>
          <div className="fare-source">
            出典: <a href="https://www.taxi-tokyo.or.jp/teigaku/from.html" target="_blank" rel="noopener noreferrer">東タク協 公式サイト</a>（目安額）
          </div>
        </>
      )}
    </div>
  )
}
