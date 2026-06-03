import { parse } from 'node-html-parser'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const response = await fetch('https://transit.yahoo.co.jp/traininfo/area/4/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        'Accept-Language': 'ja-JP,ja;q=0.9',
      },
    })
    const html = await response.text()
    const root = parse(html)
    const seen = new Set()
    const delayed = []

    root.querySelectorAll('li a[href^="/diainfo/"]').forEach(a => {
      const name = a.querySelector('dt.title')?.text?.trim()
      const status = a.querySelector('dd.subText')?.text?.trim()
      if (name && status && status !== '平常運転' && !seen.has(name)) {
        seen.add(name)
        delayed.push({ name, status, detail: '' })
      }
    })

    res.status(200).json({ delayed, updatedAt: new Date().toISOString() })
  } catch (e) {
    res.status(500).json({ error: e.message, delayed: [] })
  }
}
