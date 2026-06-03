import { useState } from 'react'
import { useDriver } from '../hooks/useDriver'
import StatusToggle from '../components/StatusToggle'
import RideRequest from '../components/RideRequest'
import DailySummary from '../components/DailySummary'
import SalesRecord from '../components/SalesRecord'
import EventInfo from '../components/EventInfo'
import TrafficInfo from '../components/TrafficInfo'
import TrainInfo from '../components/TrainInfo'
import TaxiNews from '../components/TaxiNews'

const TABS = [
  { key: 'event',   label: 'イベント',  icon: '🎪' },
  { key: 'traffic', label: '道路状況',  icon: '🚗' },
  { key: 'train',   label: '電車状況',  icon: '🚆' },
]

export default function Dashboard() {
  const { isOnline, toggleOnline, rideRequest, simulateRequest, acceptRide, rejectRide, sales, addSale, totalSales } = useDriver()
  const [activeTab, setActiveTab] = useState(null)

  const handleTabClick = (key) => {
    setActiveTab(prev => prev === key ? null : key)
  }

  return (
    <div className="dashboard">
      <header className="app-header">
        <h1>タクシー営業</h1>
        <div className="header-date">
          {new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}
        </div>
      </header>

      <StatusToggle isOnline={isOnline} onToggle={toggleOnline} onSimulate={simulateRequest} />
      <TaxiNews />
      <DailySummary sales={sales} totalSales={totalSales} />
      <SalesRecord onAdd={addSale} />

      {activeTab && (
        <div className="bottom-sheet">
          <div className="bottom-sheet-handle" />
          {activeTab === 'event'   && <EventInfo />}
          {activeTab === 'traffic' && <TrafficInfo />}
          {activeTab === 'train'   && <TrainInfo />}
        </div>
      )}

      <nav className="bottom-tab-bar">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`bottom-tab ${activeTab === t.key ? 'bottom-tab-active' : ''}`}
            onClick={() => handleTabClick(t.key)}
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
