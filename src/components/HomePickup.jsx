import { useState, useEffect } from 'react'

async function loadAll() {
  const [evRes, trRes, tnRes, hdRes, tpRes] = await Promise.allSettled([
    fetch('/api/events').then(r => r.json()),
    fetch('/api/traffic').then(r => r.json()),
    fetch('/api/train-info').then(r => r.json()),
    fetch('/api/haneda').then(r => r.json()),
    fetch('/api/taxi-pool').then(r => r.json()),
  ])
  return {
    events:  evRes.status === 'fulfilled' ? (evRes.value.events  || []) : null,
    traffic: trRes.status === 'fulfilled' ? trRes.value : null,
    trains:  tnRes.status === 'fulfilled' ? (tnRes.value.delayed || []) : null,
    parking: hdRes.status === 'fulfilled' ? (hdRes.value.parking || []) : null,
    pools:   tpRes.status === 'fulfilled' ? (tpRes.value.pools   || []) : null,
  }
}

function EventSummary({ events }) {
  if (events === null) return <span className="pickup-sub error">取得失敗</span>
  if (events.length === 0) return <span className="pickup-sub ok">予定なし</span>
  return (
    <>
      <span className="pickup-badge warn">{events.length}件</span>
      <span className="pickup-sub">{events[0].venue}</span>
    </>
  )
}

function TrafficSummary({ data }) {
  if (data === null) return <span className="pickup-sub error">取得失敗</span>
  const issues = (data.traffic || []).filter(t => t.level === 'bad' || t.level === 'mid')
  const closures = (data.closures || [])
  if (issues.length === 0 && closures.length === 0)
    return <span className="pickup-sub ok">順調</span>
  return (
    <>
      {issues.length > 0 && <span className="pickup-badge warn">{issues.length}件渋滞</span>}
      {closures.length > 0 && <span className="pickup-badge alert">{closures.length}閉鎖</span>}
    </>
  )
}

function TrainSummary({ trains }) {
  if (trains === null) return <span className="pickup-sub error">取得失敗</span>
  if (trains.length === 0) return <span className="pickup-sub ok">全線正常</span>
  return (
    <>
      <span className="pickup-badge warn">{trains.length}路線</span>
      <span className="pickup-sub">{trains[0].name}</span>
    </>
  )
}

function AirportSummary({ parking, pools }) {
  const allClosed = pools && pools.length > 0 && pools.every(p => p.level === 'closed')
  const busyPools = pools ? pools.filter(p => p.level === 'busy').length : 0

  const full  = parking ? parking.filter(p => p.status === '満車').length : 0
  const crowd = parking ? parking.filter(p => p.status === '混雑').length : 0
  const allFull = parking && parking.length > 0 && full === parking.length

  if (parking === null && pools === null) return <span className="pickup-sub error">取得失敗</span>

  return (
    <>
      {allClosed
        ? <span className="pickup-sub">プール運用外</span>
        : busyPools > 0
          ? <span className="pickup-badge warn">P混雑 {busyPools}箇所</span>
          : <span className="pickup-sub ok">P空き</span>
      }
      {allFull
        ? <span className="pickup-badge alert">駐車場満車</span>
        : full > 0
          ? <span className="pickup-badge warn">満車 {full}棟</span>
          : null
      }
    </>
  )
}

export default function HomePickup({ onTabOpen }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAll().then(d => { setData(d); setLoading(false) })
  }, [])

  const tiles = [
    { key: 'event',   icon: '🎪', label: 'イベント' },
    { key: 'traffic', icon: '🚗', label: '道路状況' },
    { key: 'train',   icon: '🚆', label: '電車状況' },
    { key: 'airport', icon: '✈️', label: '空港' },
  ]

  return (
    <div className="card pickup-card">
      <div className="pickup-grid">
        {tiles.map(t => (
          <button key={t.key} className="pickup-tile" onClick={() => onTabOpen(t.key)}>
            <div className="pickup-tile-top">
              <span className="pickup-icon">{t.icon}</span>
              <span className="pickup-label">{t.label}</span>
            </div>
            <div className="pickup-tile-body">
              {loading ? (
                <span className="pickup-sub">取得中...</span>
              ) : (
                <>
                  {t.key === 'event'   && <EventSummary   events={data?.events} />}
                  {t.key === 'traffic' && <TrafficSummary data={data?.traffic} />}
                  {t.key === 'train'   && <TrainSummary   trains={data?.trains} />}
                  {t.key === 'airport' && <AirportSummary parking={data?.parking} pools={data?.pools} />}
                </>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
