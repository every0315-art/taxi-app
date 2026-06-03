import { parse } from 'node-html-parser'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
  'Accept-Language': 'ja-JP,ja;q=0.9',
}

// 都内・近郊の主要路線のみ表示
const ALLOW_LINES = [
  '山手線','中央線','総武線','京浜東北線','東海道線','横須賀線','常磐線','埼京線',
  '湘南新宿ライン','上野東京ライン','南武線','武蔵野線','横浜線','京葉線',
  '銀座線','丸ノ内線','日比谷線','東西線','千代田線','有楽町線','半蔵門線','南北線','副都心線',
  '浅草線','三田線','新宿線','大江戸線',
  '東急東横線','東急田園都市線','東急目黒線','東急大井町線','東急池上線','東急多摩川線',
  '小田急線','小田急小田原線','小田急江ノ島線','小田急多摩線',
  '京王線','京王井の頭線','京王相模原線','京王高尾線',
  '西武池袋線','西武新宿線','西武有楽町線','西武多摩湖線','西武拝島線',
  '東武東上線','東武スカイツリーライン','東武伊勢崎線','東武日光線','東武野田線',
  '京急線','京急本線','京急空港線','京急逗子線',
  '京成線','京成本線','京成押上線','京成空港線','北総線',
  '相鉄線','相鉄本線','相鉄いずみ野線','相鉄・東急直通線',
  'ゆりかもめ','東京モノレール','りんかい線','多摩モノレール','東京臨海高速鉄道',
  'つくばエクスプレス','東葉高速線','埼玉高速鉄道','横浜市営地下鉄','みなとみらい線',
]

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
      if (name && status && status !== '平常運転' && !seen.has(name) &&
          ALLOW_LINES.some(l => name.includes(l) || l.includes(name))) {
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
