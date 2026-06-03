import { parse } from 'node-html-parser'

async function fetchSite(url, label) {
  const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  const html = await response.text()
  const root = parse(html)
  const news = []
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

  root.querySelectorAll('li').forEach(li => {
    const text = li.text.trim()
    const match = text.match(/(\d{4}[.\-]\d{1,2}[.\-]\d{1,2})\s*[｜|]?\s*(.+)/)
    if (match) {
      const dateStr = match[1].replace(/-/g, '.')
      const [year, month, day] = dateStr.split('.').map(Number)
      const itemDate = new Date(year, month - 1, day)
      if (itemDate >= oneMonthAgo) {
        const a = li.querySelector('a')
        const href = a ? a.getAttribute('href') : null
        news.push({
          date: dateStr,
          title: match[2].trim().replace(/\s+/g, ' ').replace(/PDF$/, '').trim(),
          url: href ? (href.startsWith('http') ? href : new URL(href, url).href) : null,
          source: label,
        })
      }
    }
  })
  return news
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const [assocNews, centerNews] = await Promise.allSettled([
      fetchSite('https://www.taxi-tokyo.or.jp/', '東タク協'),
      fetchSite('https://www.tokyo-tc.or.jp/news/', 'タクシーセンター'),
    ])

    const news = [
      ...(assocNews.status === 'fulfilled' ? assocNews.value : []),
      ...(centerNews.status === 'fulfilled' ? centerNews.value : []),
    ].sort((a, b) => b.date.localeCompare(a.date))

    res.status(200).json({ news })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
