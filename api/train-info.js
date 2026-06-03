import { parse } from 'node-html-parser'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
  'Accept-Language': 'ja-JP,ja;q=0.9',
}

async function fetchDetail(url) {
  try {
    const res = await fetch('https://transit.yahoo.co.jp' + url, { headers: HEADERS })
    const html = await res.text()
    const match = html.match(/(?:台風|大雨|事故|強風|地震|車両)[^\",<]{3,60}(?:遅れ|運休|見合)[^\",<。]{0,30}/)
    return match ? match[0].replace(/[><]/g, '').trim() : ''
  } catch {
    return ''
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const response = await fetch('https://transit.yahoo.co.jp/traininfo/area/4/', { headers: HEADERS })
    const html = await response.text()
    const root = parse(html)
    const seen = new Set()
    const routes = []

    root.querySelectorAll('li a[href^="/diainfo/"]').forEach(a => {
      const name = a.querySelector('dt.title')?.text?.trim()
      const status = a.querySelector('dd.subText')?.text?.trim()
      const href = a.getAttribute('href')
      if (name && status && status !== '平常運転' && !seen.has(name)) {
        seen.add(name)
        routes.push({ name, status, href })
      }
    })

    // 最大8路線まで詳細を並行取得
    const top = routes.slice(0, 8)
    const details = await Promise.all(top.map(r => fetchDetail(r.href)))
    const delayed = top.map((r, i) => ({
      name: r.name,
      status: r.status,
      detail: details[i],
    }))

    // 残りは詳細なしで追加
    routes.slice(8).forEach(r => delayed.push({ name: r.name, status: r.status, detail: '' }))

    res.status(200).json({ delayed, updatedAt: new Date().toISOString() })
  } catch (e) {
    res.status(500).json({ error: e.message, delayed: [] })
  }
}
