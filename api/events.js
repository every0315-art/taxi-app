// 東京都内大規模イベント静的データベース（年間固定イベント）
// m=月, d1=開始日, d2=終了日
const EVENTS_DB = [
  { name: '浅草寺初詣', area: '浅草', venue: '浅草寺', m: 1, d1: 1, d2: 3, cap: 3000000, end: '21:00', level: 'high' },
  { name: '東京オートサロン', area: '幕張', venue: '幕張メッセ', m: 1, d1: 9, d2: 11, cap: 300000, end: '20:00', level: 'high' },
  { name: '世田谷ボロ市', area: '世田谷', venue: '世田谷', m: 1, d1: 15, d2: 16, cap: 200000, end: '20:00', level: 'mid' },
  { name: '節分会', area: '浅草・池上', venue: '浅草寺・池上本門寺ほか', m: 2, d1: 3, d2: 3, cap: 100000, end: '20:00', level: 'mid' },
  { name: 'ワンダーフェスティバル冬', area: '幕張', venue: '幕張メッセ', m: 2, d1: 8, d2: 8, cap: 50000, end: '17:00', level: 'mid' },
  { name: '東京マラソン', area: '都心部', venue: '東京都心一円', m: 3, d1: 1, d2: 1, cap: 38000, end: '18:00', level: 'high' },
  { name: '桜まつり', area: '目黒・上野ほか', venue: '目黒川・上野公園', m: 3, d1: 25, d2: 31, cap: 300000, end: '22:00', level: 'high' },
  { name: '東京モーターサイクルショー', area: '有明', venue: '東京ビッグサイト', m: 3, d1: 27, d2: 29, cap: 150000, end: '17:00', level: 'mid' },
  { name: 'AnimeJapan', area: '有明', venue: '東京ビッグサイト', m: 3, d1: 28, d2: 29, cap: 156000, end: '17:00', level: 'high' },
  { name: '桜まつり', area: '目黒・上野ほか', venue: '目黒川・上野公園', m: 4, d1: 1, d2: 10, cap: 300000, end: '22:00', level: 'high' },
  { name: 'ニコニコ超会議', area: '幕張', venue: '幕張メッセ', m: 4, d1: 25, d2: 26, cap: 130000, end: '18:00', level: 'high' },
  { name: 'くらやみ祭', area: '府中', venue: '大國魂神社', m: 5, d1: 3, d2: 6, cap: 500000, end: '22:00', level: 'high' },
  { name: '神田祭', area: '神田', venue: '神田明神', m: 5, d1: 9, d2: 10, cap: 200000, end: '21:00', level: 'high' },
  { name: '三社祭', area: '浅草', venue: '浅草神社', m: 5, d1: 15, d2: 17, cap: 1800000, end: '21:00', level: 'high' },
  { name: 'メトロック', area: '江東区', venue: '海の森公園', m: 5, d1: 16, d2: 17, cap: 80000, end: '22:00', level: 'high' },
  { name: 'デザインフェスタ春', area: '有明', venue: '東京ビッグサイト', m: 5, d1: 16, d2: 17, cap: 60000, end: '17:00', level: 'mid' },
  { name: '日比谷オクトーバーフェスト', area: '日比谷', venue: '日比谷公園', m: 5, d1: 14, d2: 31, cap: 50000, end: '22:00', level: 'mid' },
  { name: '鳥越祭', area: '蔵前', venue: '鳥越神社', m: 6, d1: 6, d2: 8, cap: 100000, end: '22:00', level: 'mid' },
  { name: '山王祭（本祭）', area: '赤坂', venue: '日枝神社', m: 6, d1: 8, d2: 17, cap: 200000, end: '21:00', level: 'high' },
  { name: '81 MUSIC FESTIVAL', area: 'お台場', venue: 'TOYOTA ARENA TOKYO', m: 6, d1: 27, d2: 27, cap: 50000, end: '22:00', level: 'mid' },
  { name: '東京みなと祭', area: '有明', venue: '東京国際クルーズターミナル', m: 6, d1: 27, d2: 28, cap: 100000, end: '21:00', level: 'mid' },
  { name: 'World DJ Festival Japan', area: '江東区', venue: '海の森水上競技場', m: 7, d1: 4, d2: 5, cap: 50000, end: '23:00', level: 'mid' },
  { name: '入谷朝顔市', area: '入谷', venue: '入谷鬼子母神', m: 7, d1: 6, d2: 8, cap: 50000, end: '23:00', level: 'mid' },
  { name: 'ほおずき市', area: '浅草', venue: '浅草寺', m: 7, d1: 9, d2: 10, cap: 50000, end: '22:00', level: 'mid' },
  { name: 'みたままつり', area: '九段', venue: '靖国神社', m: 7, d1: 13, d2: 16, cap: 300000, end: '22:00', level: 'high' },
  { name: 'ハンドメイドインジャパンフェス', area: '有明', venue: '東京ビッグサイト', m: 7, d1: 18, d2: 19, cap: 50000, end: '17:00', level: 'mid' },
  { name: '隅田川花火大会', area: '浅草・両国', venue: '隅田川', m: 7, d1: 26, d2: 26, cap: 1000000, end: '20:30', level: 'high' },
  { name: 'TOKYO IDOL FESTIVAL', area: 'お台場', venue: 'お台場', m: 7, d1: 31, d2: 31, cap: 30000, end: '22:00', level: 'mid' },
  { name: 'TOKYO IDOL FESTIVAL', area: 'お台場', venue: 'お台場', m: 8, d1: 1, d2: 2, cap: 30000, end: '22:00', level: 'mid' },
  { name: '深川八幡祭り', area: '門前仲町', venue: '富岡八幡宮', m: 8, d1: 13, d2: 15, cap: 200000, end: '21:00', level: 'high' },
  { name: '神宮外苑花火大会', area: '神宮外苑', venue: '神宮外苑', m: 8, d1: 15, d2: 15, cap: 100000, end: '21:00', level: 'high' },
  { name: 'コミックマーケット夏', area: '有明', venue: '東京ビッグサイト', m: 8, d1: 15, d2: 16, cap: 200000, end: '16:00', level: 'high' },
  { name: 'サマーソニック', area: '幕張', venue: '幕張メッセ', m: 8, d1: 15, d2: 16, cap: 60000, end: '22:00', level: 'high' },
  { name: '高円寺阿波おどり', area: '高円寺', venue: '高円寺駅周辺', m: 8, d1: 29, d2: 30, cap: 1000000, end: '20:30', level: 'high' },
  { name: '原宿表参道元氣祭スーパーよさこい', area: '原宿', venue: '原宿・表参道', m: 8, d1: 29, d2: 30, cap: 150000, end: '20:00', level: 'high' },
  { name: 'ULTRA JAPAN', area: 'お台場', venue: 'お台場', m: 9, d1: 12, d2: 13, cap: 60000, end: '23:00', level: 'high' },
  { name: '東京ゲームショウ', area: '幕張', venue: '幕張メッセ', m: 9, d1: 17, d2: 21, cap: 260000, end: '17:00', level: 'high' },
  { name: 'TOKYO ISLAND', area: '江東区', venue: '海の森公園', m: 10, d1: 10, d2: 12, cap: 50000, end: '22:00', level: 'mid' },
  { name: '東京レガシーハーフマラソン', area: '国立競技場', venue: '国立競技場発着', m: 10, d1: 18, d2: 18, cap: 20000, end: '14:00', level: 'mid' },
  { name: 'ジャパンモビリティショー', area: '有明', venue: '東京ビッグサイト', m: 10, d1: 25, d2: 31, cap: 200000, end: '18:00', level: 'high' },
  { name: '酉の市（一の酉）', area: '浅草', venue: '鷲神社・花園神社', m: 11, d1: 7, d2: 8, cap: 100000, end: '23:00', level: 'high' },
  { name: 'デザインフェスタ秋', area: '有明', venue: '東京ビッグサイト', m: 11, d1: 14, d2: 15, cap: 60000, end: '17:00', level: 'mid' },
  { name: '七五三', area: '明治神宮・日枝神社ほか', venue: '都内各神社', m: 11, d1: 14, d2: 16, cap: 50000, end: '16:00', level: 'mid' },
  { name: '酉の市（二の酉）', area: '浅草', venue: '鷲神社・花園神社', m: 11, d1: 19, d2: 20, cap: 100000, end: '23:00', level: 'high' },
  { name: '羽子板市', area: '浅草', venue: '浅草寺', m: 12, d1: 17, d2: 19, cap: 80000, end: '21:00', level: 'mid' },
  { name: 'ジャンプフェスタ', area: '幕張', venue: '幕張メッセ', m: 12, d1: 19, d2: 20, cap: 100000, end: '17:00', level: 'high' },
  { name: 'コミックマーケット冬', area: '有明', venue: '東京ビッグサイト', m: 12, d1: 29, d2: 31, cap: 200000, end: '16:00', level: 'high' },
]

const HEADERS = { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15' }

// 東京ドーム公式スケジュールをスクレイピング
async function fetchTokyoDomeEvents(day, month, year) {
  try {
    const html = await fetch('https://www.tokyo-dome.co.jp/dome/event/schedule.html', { headers: HEADERS }).then(r => r.text())
    const events = []
    const headerPositions = []
    const hRe = /c-ttl-set-calender">(\d{4})年0?(\d{1,2})月/g
    let hm
    while ((hm = hRe.exec(html)) !== null) {
      headerPositions.push({ pos: hm.index, year: parseInt(hm[1]), month: parseInt(hm[2]) })
    }
    const tablePositions = []
    const tRe = /<table/g
    let tm
    while ((tm = tRe.exec(html)) !== null) {
      tablePositions.push(tm.index)
    }
    for (const tablePos of tablePositions) {
      const header = [...headerPositions].reverse().find(h => h.pos < tablePos)
      if (!header || header.year !== year || header.month !== month) continue
      const tableEnd = html.indexOf('</table>', tablePos)
      const tableHtml = html.slice(tablePos, tableEnd)
      const rowRe = /<tr[^>]*class="c-mod-calender__item[^"]*"[^>]*>([\s\S]*?)<\/tr>/g
      let rm
      while ((rm = rowRe.exec(tableHtml)) !== null) {
        const row = rm[1]
        const dm = row.match(/calender__day">(\d+)</)
        if (!dm || parseInt(dm[1]) !== day) continue
        const linkBlocks = [...row.matchAll(/calender__links">([\s\S]*?)<\/p>/g)]
        for (const [, block] of linkBlocks) {
          if (block.includes('/dome/visit/')) continue
          const name = block.replace(/<[^>]+>/g, '').trim()
          if (!name) continue
          events.push({ name, area: '文京区', venue: '東京ドーム', cap: 55000, end: '21:00', level: 'high' })
        }
      }
      break
    }
    return events
  } catch { return [] }
}

// 神宮球場JSONをスクレイピング
async function fetchJinguEvents(day, month, year) {
  try {
    const data = await fetch('https://www.jingu-stadium.com/event/json/data.json', { headers: HEADERS }).then(r => r.json())
    const events = []
    for (const entry of data) {
      for (const ye of entry) {
        if (ye.year !== year) continue
        for (const mon of (ye.yearData || [])) {
          if (mon.month !== month) continue
          for (const d of (mon.monthData || [])) {
            if (d.day !== day) continue
            for (const ev of (d.dayData || [])) {
              let name = ev.category || '試合'
              if (ev.value?.length > 0) {
                const v = ev.value[0]
                const t1 = (v.team1 || '').match(/alt='([^']+)'/)
                const t2 = (v.team2 || '').match(/alt='([^']+)'/)
                if (t1 && t2) name = `${t1[1]} vs ${t2[1]}`
              }
              const end = estimateEnd(ev.time, ev.category)
              events.push({ name, area: '新宿区', venue: '神宮球場', cap: 30000, end, level: 'mid' })
            }
          }
        }
      }
    }
    return events
  } catch { return [] }
}

// 有明ガーデンシアター
async function fetchGardenTheaterEvents(day, month) {
  const MM = String(month).padStart(2, '0')
  const DD = String(day).padStart(2, '0')
  const events = []
  try {
    const html = await fetch('https://www.shopping-sumitomo-rd.com/tokyo_garden_theater/schedule/', { headers: HEADERS }).then(r => r.text())
    let text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '')
    text = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    const re = new RegExp(`${MM} ${DD} \\w+\\.`, 'g')
    const seen = new Set()
    for (const m of text.matchAll(re)) {
      const chunk = text.slice(m.index, m.index + 300)
      const nameMatch = chunk.match(/\d{2} \d{2} \w+\.(?:\s+\d{2} \d{2} \w+\.)?\s+(?:コンサート・ショー|会議・式典・セミナー|スポーツ)\s+\S+\s+(.+?)(?=\s+\d{2} \d{2} |\s*$)/)
      if (!nameMatch) continue
      const name = nameMatch[1].trim().split(/\s+/).filter((w, i, a) => i === 0 || w !== a[i - 1]).join(' ')
      if (name && !seen.has(name)) {
        seen.add(name)
        events.push({ name, area: '江東区', venue: '有明ガーデンシアター', cap: 8000, end: '21:00', level: 'mid' })
      }
    }
  } catch { }
  return events
}

// 有明アリーナ
async function fetchAriakeArenaEvents(day, month) {
  const events = []
  try {
    const html = await fetch('https://ariake-arena.tokyo/event/', { headers: HEADERS }).then(r => r.text())
    const blocks = [...html.matchAll(/class="detail_top_content"[^>]*>([\s\S]*?)(?=class="detail_top_content"|<\/section>|$)/g)].map(m => m[1])
    const seen = new Set()
    for (const block of blocks) {
      const dates = [...block.matchAll(/<span>(\d+)\.(\d+)\s+\w+<\/span>/g)].map(m => ({ m: parseInt(m[1]), d: parseInt(m[2]) }))
      if (!dates.some(d => d.m === month && d.d === day)) continue
      const nameMatch = block.match(/class="event_name"[^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/)
      const name = nameMatch ? nameMatch[1].replace(/<[^>]+>/g, '').trim() : null
      if (name && !seen.has(name)) {
        seen.add(name)
        events.push({ name, area: '江東区', venue: '有明アリーナ', cap: 15000, end: '21:00', level: 'high' })
      }
    }
  } catch { }
  return events
}

// 代々木体育館
async function fetchYoyogiEvents(day, month, year) {
  const dateStr = `${year}/${String(month).padStart(2,'0')}/${String(day).padStart(2,'0')}`
  const events = []
  try {
    for (const [tabid, label, area] of [['59','代々木第一体育館','渋谷区'],['60','代々木第二体育館','渋谷区']]) {
      const html = await fetch(`https://www.jpnsport.go.jp/yoyogi/event/tabid/${tabid}/Default.aspx`, { headers: HEADERS }).then(r => r.text())
      const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map(m => m[1])
      const seen = new Set()
      for (const row of rows) {
        const text = row.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
        if (!text.startsWith(dateStr)) continue
        const name = text.slice(dateStr.length).replace(/^\([^)]+\)\s*/, '').trim()
        if (name && !seen.has(name)) {
          seen.add(name)
          events.push({ name, area, venue: label, cap: 12000, end: '21:00', level: 'mid' })
        }
      }
    }
  } catch { }
  return events
}

// 国立競技場
async function fetchKokuritsuEvents(day, month, year) {
  const events = []
  try {
    const html = await fetch('https://jns-e.com/event/', { headers: HEADERS }).then(r => r.text())
    const MM = String(month).padStart(2, '0')
    const DD = String(day).padStart(2, '0')
    const datePattern = new RegExp(`${year}${MM}/${DD}|${month}/${day}[^\\d]`)
    const blocks = html.split(/<a\s/i).slice(1)
    const seen = new Set()
    for (const block of blocks) {
      if (!datePattern.test(block)) continue
      const text = block.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      const nameMatch = text.match(/(?:スポーツ|音楽|その他)\s+(.{4,60?})(?:\s+日程|\s+開始|\s+主催|$)/)
        || text.match(/\d{4}[\d\/]+[月火水木金土日]\s+(.{4,60?})(?:\s+日程|\s+開始|\s+主催|$)/)
      if (!nameMatch) continue
      const name = nameMatch[1].replace(/\s+/g, ' ').trim()
      const timeMatch = text.match(/(\d{1,2}):(\d{2})\s*(?:キックオフ|開演|開始)/)
      let end = '22:00'
      if (timeMatch) {
        const endH = (parseInt(timeMatch[1]) + 2) % 24
        end = `${String(endH).padStart(2, '0')}:${timeMatch[2]}`
      }
      if (name && !seen.has(name)) {
        seen.add(name)
        events.push({ name, area: '新宿区', venue: '国立競技場', cap: 68000, end, level: 'high' })
      }
    }
  } catch { }
  return events
}

// 東京体育館
async function fetchTokyoGymEvents(day, month, year) {
  const JA_MONTHS = ['','1','2','3','4','5','6','7','8','9','10','11','12']
  const dateStr = `${year}年${JA_MONTHS[month]}月${day}日`
  const events = []
  try {
    const html = await fetch('https://www.tef.or.jp/tmg/arena/index.html', { headers: HEADERS }).then(r => r.text())
    const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map(m => m[1])
    const seen = new Set()
    for (const row of rows) {
      if (!row.includes(dateStr)) continue
      const text = row.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      const nameMatch = text.match(/\d{4}年\d+月\d+日[（(][^)）]+[)）]\s+(.+?)(?:\s+(?:有|無|公式HP|特設サイト)|$)/)
      const name = nameMatch ? nameMatch[1].trim() : null
      if (name && !seen.has(name)) {
        seen.add(name)
        events.push({ name, area: '渋谷区', venue: '東京体育館', cap: 10000, end: '21:00', level: 'mid' })
      }
    }
  } catch { }
  return events
}

function estimateEnd(startTime, category = '') {
  if (!startTime || startTime === '0000') return '21:00'
  const [h, m] = startTime.split(':').map(Number)
  const hours = category.includes('野球') || category.includes('プロ') ? 3 : 4
  const endH = (h + hours) % 24
  return `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function normalize(s) {
  return s.replace(/[Ａ-Ｚａ-ｚ０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
    .replace(/[\s　ー－-]/g, '').toLowerCase()
}

function dedup(events) {
  const seen = new Set()
  return events.filter(e => {
    const key = e.venue + ':' + normalize(e.name).slice(0, 12)
    if (seen.has(key)) return false
    seen.add(key)
    for (const k of seen) {
      if (k !== key && k.startsWith(e.venue + ':')) {
        const existing = k.slice(e.venue.length + 1)
        const current = normalize(e.name).slice(0, 12)
        if (existing.includes(current) || current.includes(existing)) return false
      }
    }
    return true
  })
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=300')

  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
  const day = now.getDate(), month = now.getMonth() + 1, year = now.getFullYear()

  // 各会場を直接スクレイピング（無料）
  const [domeEvents, jinguEvents, gardenEvents, ariakeEvents, yoyogiEvents, gymEvents, kokuritsuEvents] = await Promise.all([
    fetchTokyoDomeEvents(day, month, year),
    fetchJinguEvents(day, month, year),
    fetchGardenTheaterEvents(day, month),
    fetchAriakeArenaEvents(day, month),
    fetchYoyogiEvents(day, month, year),
    fetchTokyoGymEvents(day, month, year),
    fetchKokuritsuEvents(day, month, year),
  ])

  // 年間固定イベントDB（祭り・フェス等）
  const staticEvents = EVENTS_DB
    .filter(ev => ev.m === month && day >= ev.d1 && day <= ev.d2)
    .map(({ name, area, venue, cap, end, level }) => ({ name, area, venue, cap, end, level }))

  const events = dedup([
    ...domeEvents, ...jinguEvents, ...gardenEvents, ...ariakeEvents,
    ...yoyogiEvents, ...gymEvents, ...kokuritsuEvents,
    ...staticEvents,
  ])

  res.status(200).json({ events, updatedAt: new Date().toISOString() })
}
