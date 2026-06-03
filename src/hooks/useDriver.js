import { useState, useCallback } from 'react'

const STORAGE_KEY = 'taxi_sales_' + new Date().toDateString()

function loadSales() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function useDriver() {
  const [isOnline, setIsOnline] = useState(false)
  const [rideRequest, setRideRequest] = useState(null)
  const [sales, setSales] = useState(loadSales)

  const toggleOnline = useCallback(() => {
    setIsOnline(prev => {
      if (prev) setRideRequest(null)
      return !prev
    })
  }, [])

  const simulateRequest = useCallback(() => {
    const requests = [
      { from: '渋谷駅', to: '新宿駅', distance: '4.2km', fare: 1200 },
      { from: '品川駅', to: '東京駅', distance: '6.8km', fare: 1800 },
      { from: '銀座', to: '浅草', distance: '5.1km', fare: 1500 },
      { from: '池袋駅', to: '六本木', distance: '8.3km', fare: 2200 },
    ]
    setRideRequest(requests[Math.floor(Math.random() * requests.length)])
  }, [])

  const acceptRide = useCallback(() => {
    if (!rideRequest) return
    const record = {
      id: Date.now(),
      amount: rideRequest.fare,
      from: rideRequest.from,
      to: rideRequest.to,
      time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
    }
    setSales(prev => {
      const next = [record, ...prev]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
    setRideRequest(null)
  }, [rideRequest])

  const rejectRide = useCallback(() => setRideRequest(null), [])

  const addSale = useCallback((amount) => {
    const record = {
      id: Date.now(),
      amount,
      from: '手動入力',
      to: '',
      time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
    }
    setSales(prev => {
      const next = [record, ...prev]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const totalSales = sales.reduce((sum, s) => sum + s.amount, 0)

  return { isOnline, toggleOnline, rideRequest, simulateRequest, acceptRide, rejectRide, sales, addSale, totalSales }
}
