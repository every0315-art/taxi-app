import { parse } from 'node-html-parser'

// 年間大規模イベントリスト（Notionデータベースより）
const ANNUAL_EVENTS = `
【1月】浅草寺初詣(1/1-3 浅草寺 数百万人), 東京オートサロン(1/9-11 幕張メッセ), 世田谷ボロ市(1/15-16 世田谷)
【2月】節分会(2/3 浅草寺・池上本門寺ほか), ワンダーフェスティバル冬(2/8 幕張メッセ)
【3月】東京マラソン(3/1 都心部3万人超), 桜まつり(3月下旬-4月上旬 目黒川ほか), 東京モーターサイクルショー(3/27-29 東京ビッグサイト), AnimeJapan(3/28-29 東京ビッグサイト 約15.6万人)
【4月】ニコニコ超会議(4/25-26 幕張メッセ 13万人超)
【5月】くらやみ祭(5/3-6 府中 大國魂神社), 東京コミティア(5月上旬 東京ビッグサイト), 神田祭(5/9ほか 神田明神), 三社祭(5/15-17 浅草神社 約180万人), メトロック(5/16-17 海の森公園), デザインフェスタ春(5/16-17 東京ビッグサイト), 日比谷オクトーバーフェスト(5月中旬 日比谷公園)
【6月】鳥越祭(6月上旬 鳥越神社), 山王祭(6/14神幸祭 日枝神社 2026年は本祭), 81 MUSIC FESTIVAL(6/27 お台場 TOYOTA ARENA TOKYO), 東京みなと祭(6/27-28 東京国際クルーズターミナル)
【7月】World DJ Festival Japan(7/4-5 海の森水上競技場), 入谷朝顔市(7/6-8 入谷鬼子母神), ほおずき市(7/9-10 浅草寺), みたままつり(7/13-16 靖国神社), ハンドメイドインジャパンフェス(7/18-19 東京ビッグサイト), 隅田川花火大会(7/25 隅田川 約100万人), TOKYO IDOL FESTIVAL(7/31-8/2 お台場 約9万人)
【8月】神宮外苑花火大会(8月中旬 神宮外苑), サマーソニック(8/15-16 幕張ほか), コミックマーケット夏(8/15-16 東京ビッグサイト), 深川八幡祭り(8月中旬 富岡八幡宮), 高円寺阿波おどり(8/29-30 高円寺 約100万人), 原宿表参道元氣祭スーパーよさこい(8/29-30 原宿・表参道)
【9月】ROCK IN JAPAN FESTIVAL(9/12-13・19-21 千葉市 5日間30万人), ULTRA JAPAN(9/12-13 お台場), 東京ゲームショウ(9/17-21 幕張メッセ 約26万人), 根津神社例大祭(9月下旬 根津神社)
【10月】TOKYO ISLAND(10/10-12 海の森公園), 雑司ヶ谷鬼子母神御会式(10月中旬), 東京レガシーハーフマラソン(10/18 国立競技場発着), 東京よさこい(10月 池袋), ジャパンモビリティショー(10月下旬 東京ビッグサイト 130万人超)
【11月】酉の市(一の酉11/7・二の酉11/19 鷲神社・花園神社など), デザインフェスタ秋(11/14-15 東京ビッグサイト), 七五三参拝シーズン(11/15 明治神宮ほか)
【12月】羽子板市(12/17-19 浅草寺), ジャンプフェスタ(12/19-20 幕張メッセ), コミックマーケット冬(12/29-31 東京ビッグサイト), カウントダウン年末イベント(12/31 都内各所)
`

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
        const titles = [...row.matchAll(/calender__links">([\s\S]*?)<\/p>/g)]
          .map(([, t]) => t.replace(/<[^>]+>/g, '').trim()).filter(Boolean)
        for (const name of titles) {
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
              const end = ev.time ? ev.time : '21:00'
              events.push({ name, area: '新宿区', venue: '神宮球場', cap: 30000, end, level: 'mid', _source: 'jingu' })
            }
          }
        }
      }
    }
    return events
  } catch { return [] }
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

  // 東京ドーム・神宮球場は直接スクレイピング（確実）
  const [domeEvents, jinguEvents] = await Promise.all([
    fetchTokyoDomeEvents(day, month, year),
    fetchJinguEvents(day, month, year),
  ])

  const venueEvents = dedup([...domeEvents, ...jinguEvents])

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(200).json({ events: venueEvents, updatedAt: new Date().toISOString() })
  }

  const today = now.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })

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
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: `今日（${today}）に東京都内で開催されるイベントを調べ、以下のJSON配列のみ返してください。説明・前置き・Markdownは不要です。
[{"name":"イベント名","area":"エリア","venue":"会場名","cap":人数(数値),"end":"終演・終了時刻HH:MM","level":"high または mid"}]
該当なしの場合は[]のみ。levelはcap5万人以上をhigh、それ未満をmid。

【参考：東京年間大規模イベントカレンダー（Notionデータより）】
${ANNUAL_EVENTS}

【確認済み会場（スキップ可）】東京ドーム・神宮球場は別途取得済み。以下を検索すること：
有明アリーナ、有明ガーデンシアター、国立競技場、代々木体育館、東京体育館、日本武道館、サントリーホール、東京オペラシティ
上記カレンダーに該当する祭り・フェス・花火も含めること。`,
        messages: [{ role: 'user', content: '今日の都内イベントをJSON形式で返してください。' }]
      })
    })

    const data = await response.json()
    const text = data.content?.find(b => b.type === 'text')?.text || '[]'
    const match = text.match(/\[[\s\S]*\]/)
    const claudeEvents = match ? JSON.parse(match[0]) : []

    const all = dedup([...venueEvents, ...claudeEvents])
    res.status(200).json({ events: all, updatedAt: new Date().toISOString() })
  } catch (e) {
    // Claude失敗でも会場スクレイピング分は返す
    res.status(200).json({ events: venueEvents, updatedAt: new Date().toISOString() })
  }
}
