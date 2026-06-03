import { useDriver } from '../hooks/useDriver'
import StatusToggle from '../components/StatusToggle'
import RideRequest from '../components/RideRequest'
import DailySummary from '../components/DailySummary'
import SalesRecord from '../components/SalesRecord'
import InfoTabs from '../components/InfoTabs'
import TaxiNews from '../components/TaxiNews'

export default function Dashboard() {
  const { isOnline, toggleOnline, rideRequest, simulateRequest, acceptRide, rejectRide, sales, addSale, totalSales } = useDriver()

  return (
    <div className="dashboard">
      <header className="app-header">
        <h1>タクシー営業</h1>
        <div className="header-date">
          {new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}
        </div>
      </header>

      <StatusToggle isOnline={isOnline} onToggle={toggleOnline} onSimulate={simulateRequest} />
      <InfoTabs />
      <TaxiNews />
      <DailySummary sales={sales} totalSales={totalSales} />
      <SalesRecord onAdd={addSale} />

      <RideRequest request={rideRequest} onAccept={acceptRide} onReject={rejectRide} />
    </div>
  )
}
