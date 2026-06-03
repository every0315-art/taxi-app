import { useState, useEffect, useCallback } from 'react'
import BusMap from './BusMap'

// 羽田空港定額運賃表（東タク協 特別区・武三版 2026年4月20日適用）
// 出典: https://www.taxi-tokyo.or.jp/teigaku/from.html ※首都高利用前提、有料道路別途
// ※品川区・目黒区・港区・大田区・中央区・江東区はメーター制（定額対象外）
const FLAT_RATES = [
  { area: '千代田区',   day: '7,600',  night: '9,000' },
  { area: '渋谷区',     day: '8,500',  night: '10,000' },
  { area: '世田谷区',   day: '8,900',  night: '10,400' },
  { area: '台東区',     day: '9,100',  night: '10,800' },
  { area: '墨田区',     day: '9,100',  night: '10,700' },
  { area: '新宿区',     day: '9,000',  night: '10,700' },
  { area: '文京区',     day: '9,300',  night: '10,900' },
  { area: '中野区',     day: '9,900',  night: '11,700' },
  { area: '荒川区',     day: '10,400', night: '12,200' },
  { area: '杉並区',     day: '10,800', night: '12,600' },
  { area: '北区',       day: '11,000', night: '13,000' },
  { area: '豊島区',     day: '11,200', night: '13,200' },
  { area: '足立区',     day: '11,100', night: '13,100' },
  { area: '江戸川区',   day: '9,000',  night: '10,500' },
  { area: '葛飾区',     day: '11,300', night: '13,400' },
  { area: '板橋区',     day: '12,300', night: '14,500' },
  { area: '練馬区',     day: '12,800', night: '15,100' },
  { area: '武蔵野市',   day: '14,000', night: '16,500' },
  { area: '三鷹市',     day: '13,300', night: '15,700' },
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

      {tab === 'bus' && <BusMap />}

      {tab === 'fare' && (
        <>
          <div className="fare-note">首都高利用前提・有料道路別途。深夜(22時〜5時)は割増額。<br />品川・目黒・港・大田・中央・江東区はメーター制。</div>
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
            <a href="https://www.taxi-tokyo.or.jp/teigaku/from.html" target="_blank" rel="noopener noreferrer">東タク協 公式</a> 特別区・武三版 2026年4月20日適用
          </div>
        </>
      )}
    </div>
  )
}
