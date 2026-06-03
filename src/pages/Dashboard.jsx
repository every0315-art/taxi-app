import { useState, useCallback } from 'react'
import { useDriver } from '../hooks/useDriver'
import StatusToggle from '../components/StatusToggle'
import RideRequest from '../components/RideRequest'
import DailySummary from '../components/DailySummary'
import SalesRecord from '../components/SalesRecord'
import EventInfo from '../components/EventInfo'
import TrafficInfo from '../components/TrafficInfo'
import TrainInfo from '../components/TrainInfo'
import TaxiNews from '../components/TaxiNews'
import DrivingBriefing from '../components/DrivingBriefing'
import HanedaInfo from '../components/HanedaInfo'

const TOP_TABS = [
  { key: 'home',  label: 'ホーム' },
  { key: 'news',  label: 'ニュース' },
  { key: 'sales', label: '売上' },
]

const BOTTOM_TABS = [
  { key: 'event',   label: 'イベント', icon: '🎪' },
  { key: 'traffic', label: '道路状況', icon: '🚗' },
  { key: 'train',   label: '電車状況', icon: '🚆' },
]

async function fetchBriefing() {
  const [evRes, trRes, tnRes] = await Promise.allSettled([
    fetch('/api/events').then(r => r.json()),
    fetch('/api/traffic').then(r => r.json()),
    fetch('/api/train-info').then(r => r.json()),
  ])
  return {
    events:  evRes.status  === 'fulfilled' ? (evRes.value.events   || []) : [],
    traffic: trRes.status  === 'fulfilled' ? (trRes.value.traffic  || []).filter(t => t.level === 'bad' || t.level === 'mid') : [],
    trains:  tnRes.status  === 'fulfilled' ? (tnRes.value.delayed  || []) : [],
  }
}

export default function Dashboard() {
  const { isOnline, toggleOnline, rideRequest, simulateRequest, acceptRide, rejectRide, sales, addSale, totalSales } = useDriver()
  const [topTab, setTopTab] = useState('home')
  const [bottomTab, setBottomTab] = useState(null)
  const [briefing, setBriefing] = useState(null)
  const [briefingLoading, setBriefingLoading] = useState(false)

  const handleToggleOnline = useCallback(async () => {
    if (!isOnline) {
      setBriefingLoading(true)
      setBriefing(null)
      toggleOnline()
      try {
        const data = await fetchBriefing()
        setBriefing(data)
      } finally {
        setBriefingLoading(false)
      }
    } else {
      setBriefing(null)
      toggleOnline()
    }
  }, [isOnline, toggleOnline])

  const handleBottomTab = (key) => {
    setBottomTab(prev => prev === key ? null : key)
  }

  return (
    <div className="dashboard">
      <header className="app-header">
        <h1>タクシー営業</h1>
        <div className="header-date">
          {new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}
        </div>
      </header>

      <div className="top-tab-bar">
        {TOP_TABS.map(t => (
          <button
            key={t.key}
            className={`top-tab ${topTab === t.key ? 'top-tab-active' : ''}`}
            onClick={() => setTopTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {topTab === 'home'  && <StatusToggle isOnline={isOnline} onToggle={handleToggleOnline} onSimulate={simulateRequest} />}
      {topTab === 'home' && (briefingLoading || briefing) && (
        <DrivingBriefing briefing={briefing} loading={briefingLoading} />
      )}
      {topTab === 'home' && (
        <div className="card">
          <h2>✈️ 羽田空港 駐車場</h2>
          <HanedaInfo />
        </div>
      )}
      {topTab === 'news'  && <TaxiNews />}
      {topTab === 'sales' && (
        <>
          <DailySummary sales={sales} totalSales={totalSales} />
          <SalesRecord onAdd={addSale} />
        </>
      )}

      {bottomTab && (
        <>
          <div className="bottom-sheet-backdrop" onClick={() => setBottomTab(null)} />
          <div className="bottom-sheet">
            <div className="bottom-sheet-handle" onClick={() => setBottomTab(null)} />
            {bottomTab === 'event'   && <EventInfo />}
            {bottomTab === 'traffic' && <TrafficInfo />}
            {bottomTab === 'train'   && <TrainInfo />}
          </div>
        </>
      )}

      <nav className="bottom-tab-bar">
        {BOTTOM_TABS.map(t => (
          <button
            key={t.key}
            className={`bottom-tab ${bottomTab === t.key ? 'bottom-tab-active' : ''}`}
            onClick={() => handleBottomTab(t.key)}
          >
            <span className="bottom-tab-icon">{t.icon}</span>
            <span className="bottom-tab-label">{t.label}</span>
          </button>
        ))}
      </nav>

      <RideRequest request={rideRequest} onAccept={acceptRide} onReject={rejectRide} />
    </div>
  )
}
