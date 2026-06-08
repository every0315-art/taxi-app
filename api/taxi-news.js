import { parse } from 'node-html-parser'

async function fetchTaxiJapanNews() {
  try {
    const xml = await fetch('https://taxi-japan.or.jp/feed/', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }).then(r => r.text())

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1])
    const news = []
    for (const item of items.slice(0, 30)) {
      const title = (item.match(/<title><!\[CDATA\[(.+?)\]\]><\/title>/) || item.match(/<title>(.+?)<\/title>/))?.[1]?.trim()
      const link  = (item.match(/<link>(https?[^<]+)<\/link>/) || item.match(/<guid[^>]*>(https?[^<]+)<\/guid>/))?.[1]?.trim()
      const pub   = item.match(/<pubDate>(.+?)<\/pubDate>/)?.[1]?.trim()
      if (!title || !link) continue
      if (link.includes('/member-only-post/')) continue
      const d = pub ? new Date(pub) : null
      const date = d ? `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}` : ''
      news.push({ date, title, url: link, source: '全タク連' })
    }
    return news
  } catch { return [] }
}

const TAXI_KEYWORDS = /タクシー|ライドシェア|配車アプリ|ハイヤー|乗務員|運転手|GO(?:タクシー| App)|DiDi|Uber/

async function fetchGeneralTaxiNews() {
  const SOURCES = [
    { url: 'https://www3.nhk.or.jp/rss/news/cat0.xml', name: 'NHK' },
    { url: 'https://www3.nhk.or.jp/rss/news/cat1.xml', name: 'NHK' },
    { url: 'https://www3.nhk.or.jp/rss/news/cat5.xml', name: 'NHK' },
    { url: 'https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml', name: 'ITmedia' },
  ]
  const seen = new Set()
  const results = []
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  await Promise.allSettled(SOURCES.map(async ({ url, name }) => {
    try {
      const xml = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(r => r.text())
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1])
      for (const item of items) {
        const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim()
        const link  = item.match(/<link>(https?[^<\s]+)/)?.[1]?.trim()
        const pub   = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim()
        const desc  = item.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.replace(/<[^>]+>/g, '').replace(/<!\[CDATA\[|\]\]>/g, '').trim() || ''
        if (!title || !link || seen.has(link)) continue
        if (!TAXI_KEYWORDS.test(title) && !TAXI_KEYWORDS.test(desc)) continue
        const d = pub ? new Date(pub) : null
        if (d && d < oneWeekAgo) continue
        seen.add(link)
        const date = d ? `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}` : ''
        results.push({ date, title, url: link, source: name })
      }
    } catch { }
  }))

  return results.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30)
}

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
    const [assocNews, centerNews, taxiJapan, generalNews] = await Promise.allSettled([
      fetchSite('https://www.taxi-tokyo.or.jp/', '東タク協'),
      fetchSite('https://www.tokyo-tc.or.jp/news/', 'タクシーセンター'),
      fetchTaxiJapanNews(),
      fetchGeneralTaxiNews(),
    ])

    const news = [
      ...(assocNews.status === 'fulfilled' ? assocNews.value : []),
      ...(centerNews.status === 'fulfilled' ? centerNews.value : []),
    ].sort((a, b) => b.date.localeCompare(a.date))

    const pickupNews = [
      ...(taxiJapan.status === 'fulfilled' ? taxiJapan.value : []),
      ...(generalNews.status === 'fulfilled' ? generalNews.value : []),
    ].sort((a, b) => b.date.localeCompare(a.date))

    res.status(200).json({ news, pickupNews })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
