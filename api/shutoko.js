import { parse } from 'node-html-parser'

function isActiveToday(text) {
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate()
  const today = new Date(y, m - 1, d)

  const dates = [...text.matchAll(/(\d{4})年(\d{1,2})月(\d{1,2})日/g)]
  if (dates.length >= 2) {
    const start = new Date(+dates[0][1], +dates[0][2] - 1, +dates[0][3])
    const end   = new Date(+dates[dates.length-1][1], +dates[dates.length-1][2] - 1, +dates[dates.length-1][3])
    return today >= start && today <= end
  }
  if (dates.length === 1) {
    return +dates[0][1] === y && +dates[0][2] === m && +dates[0][3] === d
  }
  return false
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const response = await fetch('https://www.shutoko.jp/traffic/control/largeScale/list/', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    const html = await response.text()
    const root = parse(html)
    const closures = []

    root.querySelectorAll('tr, li').forEach(el => {
      const text = el.text.replace(/\s+/g, ' ').trim()

      // 入口・出口のみ対象（本線・JCTは除外）
      if (!/(入口|出口)/.test(text)) return
      if (!/(通行止め|閉鎖)/.test(text)) return
      if (text.length > 300) return
      if (!isActiveToday(text)) return

      const nameMatch = text.match(/(.{2,20}(?:入口|出口))/)
      if (!nameMatch) return

      const name = nameMatch[1].trim()
      if (!closures.some(c => c.name === name)) {
        closures.push({ name })
      }
    })

    res.status(200).json({ closures })
  } catch (e) {
    res.status(500).json({ error: e.message, closures: [] })
  }
}
