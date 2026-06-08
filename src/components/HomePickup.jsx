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

const LEVEL_CLASS = { high: 'badge-high', mid: 'badge-mid' }

function PickupCard({ label, tabKey, onOpen, summary, children, loading }) {
  return (
    <div className="pickup-card-v2">
      <button className="pickup-card-header" onClick={() => onOpen(tabKey)}>
        <span className="pickup-label">{label}</span>
        {loading
          ? <span className="pickup-sub" style={{ marginLeft: 'auto' }}>取得中...</span>
          : <span className="pickup-card-summary">{summary}</span>
        }
        <span className="pickup-card-arrow">›</span>
      </button>
      {!loading && (
        <div className="pickup-card-body">{children}</div>
      )}
    </div>
  )
}

export default function HomePickup({ onTabOpen }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAll().then(d => { setData(d); setLoading(false) })
  }, [])

  const events  = data?.events  ?? []
  const traffic = data?.traffic ?? null
  const trains  = data?.trains  ?? []
  const parking = data?.parking ?? []
  const pools   = data?.pools   ?? []

  const trafficIssues  = traffic ? [...(traffic.traffic || []).filter(t => t.level !== 'good'), ...(traffic.closures || [])] : []
  const knownPools     = pools.some(p => p.level !== 'unknown')

  return (
    <div className="pickup-stack">

      {/* イベント */}
      <PickupCard
        label="イベント" tabKey="event" onOpen={onTabOpen} loading={loading}
        summary={
          events.length === 0
            ? <span className="pickup-sub ok">予定なし</span>
            : <span className="pickup-badge warn">{events.length}件</span>
        }
      >
        {events.length === 0
          ? <p className="pickup-empty">本日のイベントはありません</p>
          : events.slice(0, 5).map((ev, i) => (
            <div key={i} className="pickup-row">
              <span className={`badge ${LEVEL_CLASS[ev.level] || 'badge-high'}`}>{ev.level === 'high' ? '混雑' : '注目'}</span>
              <span className="pickup-row-main">{ev.name}</span>
              <span className="pickup-row-sub">{ev.venue}</span>
            </div>
          ))
        }
      </PickupCard>

      {/* 道路状況 */}
      <PickupCard
        label="道路状況" tabKey="traffic" onOpen={onTabOpen} loading={loading}
        summary={
          trafficIssues.length === 0
            ? <span className="pickup-sub ok">順調</span>
            : <span className="pickup-badge warn">{trafficIssues.length}件</span>
        }
      >
        {trafficIssues.length === 0
          ? <p className="pickup-empty">渋滞・通行止めなし</p>
          : trafficIssues.slice(0, 5).map((t, i) => (
            <div key={i} className="pickup-row">
              <span className={`badge ${t.level === 'bad' || t.closed ? 'badge-high' : 'badge-mid'}`}>
                {t.closed ? '閉鎖' : t.level === 'bad' ? '渋滞' : '混雑'}
              </span>
              <span className="pickup-row-main">{t.road || t.name || t.route}</span>
              <span className="pickup-row-sub">{t.section || t.direction || ''}</span>
            </div>
          ))
        }
      </PickupCard>

      {/* 電車状況 */}
      <PickupCard
        label="電車状況" tabKey="train" onOpen={onTabOpen} loading={loading}
        summary={
          trains.length === 0
            ? <span className="pickup-sub ok">全線正常</span>
            : <span className="pickup-badge warn">{trains.length}路線</span>
        }
      >
        {trains.length === 0
          ? <p className="pickup-empty">遅延・運休なし</p>
          : trains.slice(0, 5).map((t, i) => (
            <div key={i} className="pickup-row">
              <span className="badge badge-mid">遅延</span>
              <span className="pickup-row-main">{t.name}</span>
              <span className="pickup-row-sub">{t.status || ''}</span>
            </div>
          ))
        }
      </PickupCard>

      {/* 空港 */}
      <PickupCard
        label="空港" tabKey="airport" onOpen={onTabOpen} loading={loading}
        summary={
          parking.length === 0
            ? <span className="pickup-sub">---</span>
            : parking.filter(p => p.status === '満車').length === parking.length
              ? <span className="pickup-badge alert">全満車</span>
              : <span className="pickup-sub ok">空きあり</span>
        }
      >
        {parking.slice(0, 3).map((p, i) => (
          <div key={i} className="pickup-row">
            <span className={`badge ${p.status === '満車' ? 'badge-high' : p.status === '混雑' ? 'badge-mid' : 'badge-ok'}`}>
              {p.status}
            </span>
            <span className="pickup-row-main">{p.name}</span>
            <span className="pickup-row-sub">{p.terminal}</span>
          </div>
        ))}
        {knownPools && pools.slice(0, 2).map((p, i) => (
          <div key={`pool-${i}`} className="pickup-row">
            <span className={`badge ${p.level === 'busy' ? 'badge-mid' : p.level === 'closed' ? 'badge-ok' : 'badge-ok'}`}>
              {p.level === 'busy' ? '混雑' : p.level === 'closed' ? '運用外' : '空き'}
            </span>
            <span className="pickup-row-main">{p.label}</span>
          </div>
        ))}
        {!knownPools && parking.length === 0 && <p className="pickup-empty">情報取得中</p>}
      </PickupCard>

    </div>
  )
}
