import { useState } from 'react'
import EventInfo from './EventInfo'
import TrafficInfo from './TrafficInfo'
import TrainInfo from './TrainInfo'

const TABS = [
  { key: 'event', label: 'イベント' },
  { key: 'traffic', label: '道路情報' },
  { key: 'train', label: '電車運行情報' },
]

export default function InfoTabs() {
  const [tab, setTab] = useState('event')

  return (
    <div className="card">
      <div className="tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? 'tab-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'event' && <EventInfo />}
      {tab === 'traffic' && <TrafficInfo />}
      {tab === 'train' && <TrainInfo />}
    </div>
  )
}
