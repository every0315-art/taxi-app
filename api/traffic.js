import { parse } from 'node-html-parser'

// 首都高主要路線のNAVITIME ID
const ROUTES = [
  { name: '都心環状線', id: '17950' },
  { name: '3号渋谷線', id: '17953' },
  { name: '4号新宿線', id: '17955' },
  { name: '5号池袋線', id: '17956' },
  { name: '湾岸線', id: '17954' },
  { name: '中央環状線', id: '17951' },
]

async function fetchRoute({ name, id }) {
  const url = `https://www.navitime.co.jp/highwaycongestion/prediction/result?id=${id}`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' },
  })
  const html = await res.text()
  const root = parse(html)

  // 渋滞キロ数を抽出
  const congestionItems = root.querySelectorAll('.icon_congestion, [class*="congestion"]')
  let totalKm = 0

  root.querySelectorAll('li, tr, p').forEach(el => {
    const text = el.text.trim()
    const kmMatch = text.match(/(\d+\.?\d*)\s*km/)
    if (kmMatch && text.includes('渋滞')) {
      totalKm += parseFloat(kmMatch[1])
    }
  })

  // 渋滞テキストを直接取得
  const bodyText = root.text.replace(/\s+/g, ' ')
  const congMatches = bodyText.match(/(\d+\.?\d*)km（約(\d+)分）/g) || []

  let status = '順調'
  let level = 'good'
  let detail = ''

  if (congMatches.length > 0 || totalKm > 0) {
    const km = totalKm || congMatches.length
    detail = congMatches.slice(0, 2).join(' ') || `約${totalKm.toFixed(1)}km渋滞`
    if (km >= 5 || congMatches.length >= 3) {
      status = '渋滞'
      level = 'bad'
    } else {
      status = '混雑'
      level = 'mid'
    }
  }

  return { road: `首都高 ${name}`, status, detail: detail.slice(0, 30), level }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const results = await Promise.allSettled(ROUTES.map(fetchRoute))
    const traffic = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value)
      .filter(t => t.level !== 'good') // 順調は非表示

    res.status(200).json({ traffic, updatedAt: new Date().toISOString() })
  } catch (e) {
    res.status(500).json({ error: e.message, traffic: [] })
  }
}
