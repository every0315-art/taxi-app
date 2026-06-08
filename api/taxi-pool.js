import { parse } from 'node-html-parser'

const POOLS = [
  { id: 'p1',   label: '第1待機所',        url: 'https://ttc.taxi-inf.jp/index.php' },
  { id: 'p34',  label: '第3・4待機所',     url: 'https://ttc.taxi-inf.jp/no23.php' },
  { id: 'p4s',  label: '第4乗場',          url: 'https://ttc.taxi-inf.jp/No4TaxiStand.php' },
  { id: 'p5',   label: '第5乗場(第3T)',    url: 'https://ttc.taxi-inf.jp/No5TaxiStand.php' },
]

const HEADERS = { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15' }

function extractStatus(html) {
  // スクリプト・スタイル除去後、テーブル内の最初の意味ある状態テキストを取得
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')

  const root = parse(cleaned)

  // tableタグ内のテキストを取得
  const tables = root.querySelectorAll('table')
  for (const table of tables) {
    const text = table.text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 3 && !l.startsWith('[') && !l.startsWith('【') && !l.startsWith('http') && !/^\d{4}\//.test(l))
    if (text.length > 0) {
      const status = text[0]
      // 混雑レベルを判定
      let level = 'normal'
      if (/終了|閉鎖|休止/.test(status)) level = 'closed'
      else if (/混雑|満|多い/.test(status)) level = 'busy'
      else if (/空き|少ない|順調|スムーズ/.test(status)) level = 'free'
      return { status, level }
    }
  }
  return { status: '情報なし', level: 'unknown' }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=60')

  try {
    const results = await Promise.allSettled(
      POOLS.map(p => {
        const ctrl = new AbortController()
        setTimeout(() => ctrl.abort(), 5000)
        return fetch(p.url, { headers: HEADERS, signal: ctrl.signal }).then(r => r.text())
      })
    )

    const pools = POOLS.map((p, i) => {
      if (results[i].status !== 'fulfilled') {
        return { id: p.id, label: p.label, status: '取得失敗', level: 'unknown' }
      }
      const { status, level } = extractStatus(results[i].value)
      return { id: p.id, label: p.label, status, level }
    })

    res.status(200).json({ pools, updatedAt: new Date().toISOString(), source: 'https://www.tokyo-tc.or.jp/driver/stand/livecamera/' })
  } catch (e) {
    res.status(500).json({ error: e.message, pools: [] })
  }
}
