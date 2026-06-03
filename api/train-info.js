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

    const delayed = []

    // Yahoo路線情報のテーブル行を解析
    root.querySelectorAll('tr, li, .elmTblLstLine').forEach(el => {
      const text = el.text.replace(/\s+/g, ' ').trim()

      // 路線名と状況のパターン
      const lineEl = el.querySelector('a, .elmTblLstLineName')
      const statusEl = el.querySelector('.elmTblLstLineSts, .status, td')

      if (lineEl && statusEl) {
        const name = lineEl.text.trim()
        const status = statusEl.text.trim()

        if (name && status && status !== '平常運転' && name.length < 30 && status.length < 20) {
          const detailEl = el.querySelector('.elmTblLstLineDly, td:last-child')
          const detail = detailEl ? detailEl.text.trim().slice(0, 40) : ''

          if (!delayed.some(d => d.name === name)) {
            delayed.push({ name, status, detail })
          }
        }
      }
    })

    // テーブル形式でもパース
    if (delayed.length === 0) {
      const rows = root.querySelectorAll('table tr')
      rows.forEach(row => {
        const cells = row.querySelectorAll('td')
        if (cells.length >= 2) {
          const name = cells[0].text.trim()
          const status = cells[1].text.trim()
          if (name && status && status !== '平常運転' && !delayed.some(d => d.name === name)) {
            delayed.push({ name, status, detail: cells[2]?.text?.trim()?.slice(0, 40) || '' })
          }
        }
      })
    }

    res.status(200).json({ delayed, updatedAt: new Date().toISOString() })
  } catch (e) {
    res.status(500).json({ error: e.message, delayed: [] })
  }
}
