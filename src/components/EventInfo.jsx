// 1万人規模以上のみ掲載（Notion・各公式サイト調査）
const EVENTS = [
  { isoDate: '2026-05-30', name: '足立の花火 第48回', area: '足立・千住', venue: '荒川河川敷', cap: 700000, end: '20:20頃', level: 'high' },
  { isoDate: '2026-05-30', name: '日比谷音楽祭 2026', area: '日比谷', venue: '日比谷公園／東京国際フォーラム', cap: 145000, end: '20:30頃', level: 'high' },
  { isoDate: '2026-05-30', name: 'ベトナムフェスティバル 2026', area: '原宿', venue: '代々木公園 イベント広場', cap: 100000, end: '20:00頃', level: 'high' },
  { isoDate: '2026-05-30', name: 'プロ野球 巨人 vs 阪神', area: '水道橋', venue: '東京ドーム', cap: 55000, end: '21:30頃', level: 'high' },
  { isoDate: '2026-05-30', name: 'Jリーグ FC東京 vs 川崎', area: '調布', venue: '味の素スタジアム', cap: 50000, end: '21:00頃', level: 'high' },
  { isoDate: '2026-05-31', name: '日比谷音楽祭 2026', area: '日比谷', venue: '日比谷公園／東京国際フォーラム', cap: 145000, end: '20:30頃', level: 'high' },
  { isoDate: '2026-05-31', name: 'ベトナムフェスティバル 2026', area: '原宿', venue: '代々木公園 イベント広場', cap: 100000, end: '20:00頃', level: 'high' },
  { isoDate: '2026-05-31', name: 'サッカー日本代表 vs アイスランド', area: '千駄ヶ谷', venue: '国立競技場', cap: 68000, end: '21:30頃', level: 'high' },
  { isoDate: '2026-05-31', name: 'ARASHI LIVE TOUR', area: '水道橋', venue: '東京ドーム', cap: 55000, end: '21:30頃', level: 'high' },
  { isoDate: '2026-05-31', name: 'デザインフェスタ Vol.61', area: '有明', venue: '東京ビッグサイト 西展示棟', cap: 30000, end: '17:00頃', level: 'high' },
  { isoDate: '2026-05-31', name: 'K-POP フェスタ 2026', area: '有明', venue: '有明アリーナ', cap: 15000, end: '20:30頃', level: 'high' },
].sort((a, b) => a.isoDate.localeCompare(b.isoDate) || b.cap - a.cap)

const DAYS = ['日', '月', '火', '水', '木', '金', '土']

function formatDate(isoDate) {
  const d = new Date(isoDate + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekday = DAYS[d.getDay()]
  const label = d.getTime() === today.getTime() ? '今日 ' : d.getTime() === tomorrow.getTime() ? '明日 ' : ''
  return `${label}${month}/${day}(${weekday})`
}

const levelLabel = { high: '混雑予想', mid: '注目イベント' }
const levelClass = { high: 'badge-high', mid: 'badge-mid' }

export default function EventInfo() {
  return (
    <div>
      <div className="event-list">
        {EVENTS.map((ev, i) => (
          <div key={i} className="event-item">
            <div className="event-date">{formatDate(ev.isoDate)}</div>
            <div className="event-detail">
              <div className="event-name">{ev.name}</div>
              <div className="event-area">📍{ev.area}　{ev.venue}</div>
              <div className="event-end">終演 {ev.end}　👥 {ev.cap.toLocaleString()}人規模</div>
            </div>
            <span className={`badge ${levelClass[ev.level]}`}>{levelLabel[ev.level]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
