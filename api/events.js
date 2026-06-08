import { parse } from 'node-html-parser'

// 年間大規模イベントリスト（Notionデータベースより）
const ANNUAL_EVENTS_BY_MONTH = {
  1: '浅草寺初詣(1/1-3), 東京オートサロン(1/9-11 幕張メッセ), 世田谷ボロ市(1/15-16)',
  2: '節分会(2/3), ワンダーフェスティバル冬(2/8 幕張メッセ)',
  3: '東京マラソン(3/1), 桜まつり(3月下旬-4月上旬), AnimeJapan(3/28-29 東京ビッグサイト)',
  4: 'ニコニコ超会議(4/25-26 幕張メッセ)',
  5: 'くらやみ祭(5/3-6), 三社祭(5/15-17 浅草神社), メトロック(5/16-17), デザインフェスタ春(5/16-17)',
  6: '鳥越祭(6月上旬), 山王祭(6/14), 81 MUSIC FESTIVAL(6/27 お台場), 東京みなと祭(6/27-28)',
  7: '入谷朝顔市(7/6-8), みたままつり(7/13-16 靖国神社), 隅田川花火大会(7/25 約100万人), TOKYO IDOL FESTIVAL(7/31-8/2)',
  8: 'サマーソニック(8/15-16), コミックマーケット夏(8/15-16), 高円寺阿波おどり(8/29-30 約100万人)',
  9: 'ROCK IN JAPAN FESTIVAL(9/12-21 千葉市), 東京ゲームショウ(9/17-21 幕張メッセ)',
  10: 'TOKYO ISLAND(10/10-12), 東京レガシーハーフマラソン(10/18), ジャパンモビリティショー(10月下旬)',
  11: '酉の市(11/7・11/19), デザインフェスタ秋(11/14-15), 七五三(11/15)',
  12: 'ジャンプフェスタ(12/19-20 幕張メッセ), コミックマーケット冬(12/29-31), カウントダウン(12/31)',
}

function getRelevantEvents(month) {
  const prev = month === 1 ? 12 : month - 1
  const next = month === 12 ? 1 : month + 1
  return [prev, month, next]
    .map(m => `【${m}月】${ANNUAL_EVENTS_BY_MONTH[m]}`)
    .join('\n')
}

// 1日1回のAI検索キャッシュ
let aiCache = { dateKey: null, events: null }

const HEADERS = { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15' }

// 東京ドーム公式スケジュールをスクレイピング（当月のテーブルのみ）
async function fetchTokyoDomeEvents(day, month, year) {
  try {
    const html = await fetch('https://www.tokyo-dome.co.jp/dome/event/schedule.html', { headers: HEADERS }).then(r => r.text())
    const events = []

    // 月ヘッダーの位置を全取得
    const headerPositions = []
    const hRe = /c-ttl-set-calender">(\d{4})年0?(\d{1,2})月/g
    let hm
    while ((hm = hRe.exec(html)) !== null) {
      headerPositions.push({ pos: hm.index, year: parseInt(hm[1]), month: parseInt(hm[2]) })
    }

    // テーブルの位置を全取得
    const tablePositions = []
    const tRe = /<table/g
    let tm
    while ((tm = tRe.exec(html)) !== null) {
      tablePositions.push(tm.index)
    }

    // 各テーブルに直前の月ヘッダーを対応付け
    for (const tablePos of tablePositions) {
      const header = [...headerPositions].reverse().find(h => h.pos < tablePos)
      if (!header || header.year !== year || header.month !== month) continue

      // テーブル内容を取得
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
          // 施設見学ツアー（/dome/visit/）はスキップ
          if (block.includes('/dome/visit/')) continue
          const name = block.replace(/<[^>]+>/g, '').trim()
          if (!name) continue
          events.push({ name, area: '文京区', venue: '東京ドーム', cap: 55000, end: '21:00', level: 'high', _source: 'dome' })
        }
      }
      break // 今月のテーブルは1つだけ
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
              // チーム名をaltから取得してvsで結ぶ
              let name = ev.category || '試合'
              if (ev.value?.length > 0) {
                const v = ev.value[0]
                const t1 = (v.team1 || '').match(/alt='([^']+)'/)
                const t2 = (v.team2 || '').match(/alt='([^']+)'/)
                if (t1 && t2) name = `${t1[1]} vs ${t2[1]}`
              }
              // 開始時刻から終演を推定（野球約3h、大学試合約4h）
              const end = estimateEnd(ev.time, ev.category)
              events.push({ name, area: '新宿区', venue: '神宮球場', cap: 30000, end, level: 'mid', _source: 'jingu' })
            }
          }
        }
      }
    }
    return events
  } catch { return [] }
}

// 有明ガーデンシアター（東京ガーデンシアター）
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
      // ジャンルの次がアーティスト名→イベント名、次の日付で切る
      const nameMatch = chunk.match(/\d{2} \d{2} \w+\.(?:\s+\d{2} \d{2} \w+\.)?\s+(?:コンサート・ショー|会議・式典・セミナー|スポーツ)\s+\S+\s+(.+?)(?=\s+\d{2} \d{2} |\s*$)/)
      if (!nameMatch) continue
      // 重複した単語を除去（アーティスト名がイベント名に入ることがある）
      const name = nameMatch[1].trim().split(/\s+/).filter((w, i, a) => i === 0 || w !== a[i - 1]).join(' ')
      if (name && !seen.has(name)) {
        seen.add(name)
        events.push({ name, area: '江東区', venue: '有明ガーデンシアター', cap: 8000, end: '21:00', level: 'mid', _source: 'garden' })
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
        events.push({ name, area: '江東区', venue: '有明アリーナ', cap: 15000, end: '21:00', level: 'high', _source: 'ariake' })
      }
    }
  } catch { }
  return events
}

// 代々木体育館（第一・第二体育館）
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
          events.push({ name, area, venue: label, cap: 12000, end: '21:00', level: 'mid', _source: 'yoyogi' })
        }
      }
    }
  } catch { }
  return events
}

// 国立競技場（MUFGスタジアム）
async function fetchKokuritsuEvents(day, month, year) {
  const events = []
  try {
    const html = await fetch('https://jns-e.com/event/', { headers: HEADERS }).then(r => r.text())
    // 日付フォーマット: 202606/06 または 6/6のような形式
    const MM = String(month).padStart(2, '0')
    const DD = String(day).padStart(2, '0')
    const datePattern = new RegExp(`${year}${MM}/${DD}|${month}/${day}[^\\d]`)

    // <a>タグブロックで分割
    const blocks = html.split(/<a\s/i).slice(1)
    const seen = new Set()
    for (const block of blocks) {
      if (!datePattern.test(block)) continue
      // テキスト抽出
      const text = block.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      // イベント名: "日程" や "スポーツ" "音楽" の後の長いテキストを抽出
      const nameMatch = text.match(/(?:スポーツ|音楽|その他)\s+(.{4,60?})(?:\s+日程|\s+開始|\s+主催|$)/)
        || text.match(/\d{4}[\d\/]+[月火水木金土日]\s+(.{4,60?})(?:\s+日程|\s+開始|\s+主催|$)/)
      if (!nameMatch) continue
      const name = nameMatch[1].replace(/\s+/g, ' ').trim()
      // 終演時刻推定（キックオフ時間＋2.5h、開演時間＋2.5h）
      const timeMatch = text.match(/(\d{1,2}):(\d{2})\s*(?:キックオフ|開演|開始)/)
      let end = '22:00'
      if (timeMatch) {
        const endH = (parseInt(timeMatch[1]) + 2) % 24
        end = `${String(endH).padStart(2, '0')}:${timeMatch[2]}`
      }
      if (name && !seen.has(name)) {
        seen.add(name)
        events.push({ name, area: '新宿区', venue: '国立競技場', cap: 68000, end, level: 'high', _source: 'kokuritsu' })
      }
    }
  } catch { }
  return events
}

// 東京体育館（メインアリーナ）
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
      // フォーマット: "メインアリーナ 2026年6月6日（土） イベント名 有 主催団体"
      const nameMatch = text.match(/\d{4}年\d+月\d+日[（(][^)）]+[)）]\s+(.+?)(?:\s+(?:有|無|公式HP|特設サイト)|$)/)
      const name = nameMatch ? nameMatch[1].trim() : null
      if (name && !seen.has(name)) {
        seen.add(name)
        events.push({ name, area: '渋谷区', venue: '東京体育館', cap: 10000, end: '21:00', level: 'mid', _source: 'gym' })
      }
    }
  } catch { }
  return events
}

function estimateEnd(startTime, category = '') {
  if (!startTime || startTime === '0000') return '21:00'
  const [h, m] = startTime.split(':').map(Number)
  // 野球は平均3時間、大学トーナメントは複数試合で4時間
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
    // 会場＋名前（先頭12文字正規化）でキー生成
    const key = e.venue + ':' + normalize(e.name).slice(0, 12)
    if (seen.has(key)) return false
    seen.add(key)
    // 同じ会場で既存エントリーの名前に含まれる場合も重複扱い
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
  // 30分キャッシュ（より新鮮に）
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=300')

  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
  const day = now.getDate(), month = now.getMonth() + 1, year = now.getFullYear()

  // 各会場を直接スクレイピング（確実）
  const [domeEvents, jinguEvents, gardenEvents, ariakeEvents, yoyogiEvents, gymEvents, kokuritsuEvents] = await Promise.all([
    fetchTokyoDomeEvents(day, month, year),
    fetchJinguEvents(day, month, year),
    fetchGardenTheaterEvents(day, month),
    fetchAriakeArenaEvents(day, month),
    fetchYoyogiEvents(day, month, year),
    fetchTokyoGymEvents(day, month, year),
    fetchKokuritsuEvents(day, month, year),
  ])

  const venueEvents = dedup([...domeEvents, ...jinguEvents, ...gardenEvents, ...ariakeEvents, ...yoyogiEvents, ...gymEvents, ...kokuritsuEvents])

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(200).json({ events: venueEvents, updatedAt: new Date().toISOString() })
  }

  const today = now.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
  const currentMonth = now.getMonth() + 1
  const dateKey = `${year}-${month}-${day}`

  // キャッシュヒット → AI呼び出しをスキップ
  if (aiCache.dateKey === dateKey && aiCache.events) {
    const all = dedup([...venueEvents, ...aiCache.events])
    return res.status(200).json({ events: all, updatedAt: new Date().toISOString() })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 2 }],
        system: `今日（${today}）の東京都内イベントをJSON配列のみで返す。前置き不要。
[{"name":"イベント名","area":"エリア","venue":"会場名","cap":人数(数値),"end":"終演時刻HH:MM","level":"high または mid"}]
該当なしは[]。levelはcap5万人以上をhigh、未満をmid。東京ドーム・神宮球場・国立競技場は除外。

【検索対象会場】日本武道館, 有明アリーナ, 有明ガーデンシアター, 代々木体育館, 東京体育館

【参考カレンダー】
${getRelevantEvents(currentMonth)}`,
        messages: [{ role: 'user', content: `${today}の都内イベントをJSON配列で返してください。` }]
      })
    })

    const data = await response.json()
    const text = data.content?.find(b => b.type === 'text')?.text || '[]'
    const match = text.match(/\[[\s\S]*\]/)
    const claudeEvents = match ? JSON.parse(match[0]) : []
    aiCache = { dateKey, events: claudeEvents }

    const all = dedup([...venueEvents, ...claudeEvents])
    res.status(200).json({ events: all, updatedAt: new Date().toISOString() })
  } catch (e) {
    // Claude失敗でも会場スクレイピング分は返す
    res.status(200).json({ events: venueEvents, updatedAt: new Date().toISOString() })
  }
}
