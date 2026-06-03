import { parse } from 'node-html-parser'

const ROUTES = [
  { name: '都心環状線', id: 'C1' },
  { name: '1号羽田線', id: 'K1' },
  { name: '2号目黒線', id: 'O1' },
  { name: '3号渋谷線', id: 'K3' },
  { name: '4号新宿線', id: 'S4' },
  { name: '5号池袋線', id: 'S5' },
  { name: '6号向島線', id: 'S6' },
  { name: '7号小松川線', id: 'S7' },
  { name: '湾岸線', id: 'B' },
  { name: '中央環状線', id: 'C2' },
]

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const response = await fetch('https://www.shutoko.co.jp/use/traffic-info/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        'Accept-Language': 'ja-JP,ja;q=0.9',
      },
    })
    const html = await response.text()
    const root = parse(html)
    const traffic = []
    const closures = []

    // 首都高公式の渋滞・通行止め情報を抽出
    root.querySelectorAll('[class*="congestion"], [class*="traffic"], [class*="regulation"], [class*="closure"]').forEach(el => {
      const text = el.text.replace(/\s+/g, ' ').trim()
      if (text.includes('渋滞') && text.length < 100) {
        traffic.push({ road: '首都高', status: '渋滞', detail: text.slice(0, 40), level: 'bad' })
      }
      if (text.includes('通行止め') && text.length < 100) {
        closures.push({ name: text.slice(0, 30) })
      }
    })

    // テキストから渋滞情報を抽出（フォールバック）
    if (traffic.length === 0) {
      const bodyText = root.text.replace(/\s+/g, ' ')
      const congMatches = bodyText.match(/[^\s]{2,15}[線路道]\s*[^\s]*渋滞[^\s。]{0,20}/g) || []
      congMatches.slice(0, 5).forEach(m => {
        traffic.push({ road: m.slice(0, 20), status: '渋滞', detail: '', level: 'bad' })
      })
    }

    res.status(200).json({ traffic, closures, updatedAt: new Date().toISOString() })
  } catch (e) {
    res.status(500).json({ error: e.message, traffic: [], closures: [] })
  }
}
