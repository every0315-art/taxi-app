import { useState } from 'react'

// ─── データ ───────────────────────────────────────────
const TERMINALS = [
  {
    id: 't1', label: '第1T', sublabel: '国内線', color: '#3b82f6',
    stops: [
      { num: '1',   type: 'limousine', name: '京急バス/リムジン',           dest: '東京・横浜方面',          loc: '1F 南ウイング 到着口外' },
      { num: '2',   type: 'express',   name: 'エアポートバス東京・横浜',     dest: '東京駅・横浜（格安）',     loc: '1F 南ウイング 到着口外' },
      { num: '3',   type: 'limousine', name: '東京空港交通',                 dest: '新宿・池袋・都内ホテル',   loc: '1F 南ウイング 到着口外' },
      { num: '8',   type: 'shuttle',   name: 'ターミナル間循環バス（無料）', dest: '第2T・第3T 4〜8分間隔',  loc: '1F 到着ロビー 8番のりば' },
      { num: '🏨', type: 'hotel',    name: '団体・ホテル送迎バス専用エリア', dest: '各ホテル直行送迎',       loc: '1F 9〜10番乗り場付近の横断歩道を渡った先（専用エリア）' },
      { num: '🏨', type: 'hotel',    name: '羽田エクセルホテル東急',       dest: 'ホテル直行送迎',           loc: '1F 横断歩道渡った先 団体・ホテル専用エリア' },
      { num: '🏨', type: 'hotel',    name: 'プレミアホテル CABIN 羽田',   dest: 'ホテル直行送迎',           loc: '1F 横断歩道渡った先 団体・ホテル専用エリア' },
      { num: '🏨', type: 'hotel',    name: 'ホテルメトロポリタン 羽田',    dest: 'ホテル直行送迎',           loc: '1F 横断歩道渡った先 団体・ホテル専用エリア' },
    ],
  },
  {
    id: 't2', label: '第2T', sublabel: '国内線', color: '#22c55e',
    stops: [
      { num: '1',   type: 'limousine', name: '京急バス/リムジン',           dest: '東京・横浜方面',          loc: '1F 南側 到着口外' },
      { num: '2',   type: 'express',   name: 'エアポートバス東京・横浜',     dest: '東京駅・横浜（格安）',     loc: '1F 南側 到着口外' },
      { num: '3',   type: 'limousine', name: '東京空港交通',                 dest: '新宿・池袋・都内ホテル',   loc: '1F 南側 到着口外' },
      { num: '9',   type: 'shuttle',   name: 'ターミナル間循環バス（無料）', dest: '第1T・第3T 4〜8分間隔',  loc: '1F 到着ロビー 9番のりば' },
      { num: '🏨', type: 'hotel',    name: 'ホテルJALシティ羽田 東京',    dest: 'ホテル直行送迎',           loc: '1F 南側 ホテル送迎' },
      { num: '🏨', type: 'hotel',    name: 'ヴィラフォンテーヌ羽田',       dest: 'ホテル直行送迎',           loc: '1F 南側 ホテル送迎' },
      { num: '🏨', type: 'hotel',    name: 'hotel MONday 羽田空港',        dest: 'ホテル直行送迎',           loc: '1F 南側 ホテル送迎' },
    ],
  },
  {
    id: 't3', label: '第3T', sublabel: '国際線', color: '#f97316',
    stops: [
      { num: '0',   type: 'shuttle',   name: 'ターミナル間循環バス（無料）', dest: '第1T・第2T 4〜8分間隔',  loc: '1F 旅客ターミナルビル 0番のりば' },
      { num: '1・2',type: 'limousine', name: '京急バス/リムジン',           dest: '東京・横浜方面',          loc: '1F 到着ロビー外' },
      { num: '3',   type: 'express',   name: 'エアポートバス東京・横浜',     dest: '東京駅・横浜（格安）',     loc: '1F 到着ロビー外' },
      { num: '4-6', type: 'limousine', name: '東京空港交通',                 dest: '都内ホテル・新宿・成田',   loc: '1F 到着ロビー外' },
      { num: '🏨', type: 'hotel',    name: 'ヴィラフォンテーヌ プレミア 羽田空港', dest: 'ターミナル直結', loc: '1F 連絡通路直結' },
      { num: '🏨', type: 'hotel',    name: '京急EXイン羽田',               dest: 'ホテル直行送迎',           loc: '1F ホテル送迎乗り場' },
      { num: '🏨', type: 'hotel',    name: 'ファーストキャビン羽田',        dest: 'ホテル直行送迎',           loc: '1F ホテル送迎乗り場' },
    ],
  },
]

const TYPE_STYLE = {
  limousine: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
  express:   { bg: 'rgba(34,197,94,0.15)',  text: '#22c55e' },
  shuttle:   { bg: 'rgba(168,85,247,0.15)', text: '#a855f7' },
  hotel:     { bg: 'rgba(249,115,22,0.15)', text: '#f97316' },
}

// ─── 各ターミナルの1F外フロアマップ SVG ──────────────────
const FLOOR_MAPS = {
  t1: {
    color: '#3b82f6',
    stops: [
      { x: 12,  label: '1番', type: 'limousine', desc: 'リムジン\n東京・横浜' },
      { x: 68,  label: '2番', type: 'express',   desc: '格安バス\n東京・横浜' },
      { x: 124, label: '3番', type: 'limousine', desc: '空港交通\n新宿・池袋' },
      { x: 182, label: '8番', type: 'shuttle',   desc: '循環バス\n第2T・3T' },
      { x: 238, label: '9番', type: 'limousine', desc: '一般路線\n各方面' },
      { x: 294, label: '10番', type: 'limousine', desc: '一般路線\n各方面' },
      { x: 356, label: '🏨', type: 'hotel',     desc: 'ホテル\n送迎専用' },
    ],
    crosswalk: true,
    note: '← 到着口　　　　9・10番付近 ＝ 横断歩道 → ホテル専用エリア',
  },
  t2: {
    color: '#22c55e',
    stops: [
      { x: 20,  label: '1番', type: 'limousine', desc: 'リムジン\n東京・横浜' },
      { x: 90,  label: '2番', type: 'express',   desc: '格安バス\n東京・横浜' },
      { x: 160, label: '3番', type: 'limousine', desc: '空港交通\n新宿・池袋' },
      { x: 232, label: '9番', type: 'shuttle',   desc: '循環バス\n第1T・3T' },
      { x: 308, label: '🏨', type: 'hotel',     desc: 'ホテル\n送迎' },
    ],
    note: '← 南側（到着口）　　　　　　　　　　　　　　　　→',
  },
  t3: {
    color: '#f97316',
    stops: [
      { x: 15,  label: '0番', type: 'shuttle',   desc: '循環バス\n第1・2T' },
      { x: 65,  label: '1番', type: 'limousine', desc: 'リムジン\n東京方面' },
      { x: 115, label: '2番', type: 'limousine', desc: 'リムジン\n横浜方面' },
      { x: 165, label: '3番', type: 'express',   desc: '格安バス\n東京・横浜' },
      { x: 215, label: '4-5', type: 'limousine', desc: '空港交通\n都内ホテル' },
      { x: 272, label: '6番', type: 'limousine', desc: '空港交通\n新宿・成田' },
      { x: 326, label: '🏨', type: 'hotel',     desc: 'ホテル\n送迎' },
    ],
    note: '← 到着ロビー（1F 中央）　　　　　　　　　　　　→',
  },
}

const STOP_COLOR = {
  limousine: '#3b82f6',
  express:   '#22c55e',
  shuttle:   '#a855f7',
  hotel:     '#f97316',
}

function FloorMap({ termId }) {
  const map = FLOOR_MAPS[termId]
  const tc = map.color
  const isT1 = termId === 't1'
  const isT3 = termId === 't3'
  const vw = isT1 ? 420 : isT3 ? 380 : 370

  return (
    <svg viewBox={`0 0 ${vw} 185`} className="busmap-svg" xmlns="http://www.w3.org/2000/svg">
      {/* 背景 */}
      <rect width={vw} height="185" fill="var(--surface-2)" rx="10"/>

      {/* T1: ホテル送迎専用エリア（横断歩道の向こう） */}
      {isT1 && (
        <>
          <rect x="352" y="10" width="58" height="155" fill="rgba(249,115,22,0.08)" rx="6"/>
          <rect x="352" y="10" width="58" height="18" fill="#f97316" rx="6"/>
          <rect x="352" y="22" width="58" height="6" fill="#f97316"/>
          <text x="381" y="22" fontSize="7" fontWeight="800" fill="#fff" textAnchor="middle">🏨 専用</text>
          <text x="381" y="35" fontSize="6" fill="#f97316" textAnchor="middle" fontWeight="700">団体・ホテル</text>
          <text x="381" y="43" fontSize="6" fill="#f97316" textAnchor="middle" fontWeight="700">送迎バス</text>
          {/* 横断歩道シマシマ */}
          {[0,5,10,15,20,25,30,35,40,45].map(dy => (
            <rect key={dy} x="340" y={68+dy*1.8} width="10" height="2.5" fill="#fff" opacity="0.85" rx="0.5"/>
          ))}
          <text x="345" y="63" fontSize="5.5" fill="#d1d5db" textAnchor="middle" fontWeight="600">横断</text>
          <text x="345" y="69" fontSize="5.5" fill="#d1d5db" textAnchor="middle" fontWeight="600">歩道</text>
        </>
      )}

      {/* ターミナルビル（上部） */}
      <rect x="10" y="10" width={isT1 ? 326 : isT3 ? 360 : 350} height="36" fill={tc} rx="6"/>
      <rect x="10" y="36" width={isT1 ? 326 : isT3 ? 360 : 350} height="10" fill={tc} opacity="0.6"/>
      <text x={isT1 ? 173 : 185} y="29" fontSize="13" fontWeight="800" fill="#fff" textAnchor="middle">1F 到着ロビー</text>
      <text x={isT1 ? 173 : 185} y="42" fontSize="8" fontWeight="600" fill="rgba(255,255,255,0.85)" textAnchor="middle">↓ 到着口（自動ドア）</text>

      {/* 歩道 */}
      <rect x="10" y="50" width={isT1 ? 326 : isT3 ? 360 : 350} height="18" fill="#e5e7eb" rx="0"/>
      <text x={isT1 ? 173 : 185} y="62" fontSize="7" fill="#6b7280" textAnchor="middle" fontWeight="600">歩　道</text>

      {/* 車道 */}
      <rect x="10" y="68" width={isT1 ? 326 : isT3 ? 360 : 350} height="28" fill="#374151" rx="0"/>
      <line x1="10" y1="82" x2={isT1 ? 336 : isT3 ? 370 : 360} y2="82" stroke="#fbbf24" strokeWidth="1" strokeDasharray="12 6"/>
      <text x="15" y="89" fontSize="6.5" fill="#9ca3af">← 出発方向</text>
      <text x={isT1 ? 255 : 295} y="78" fontSize="6.5" fill="#9ca3af">到着方向 →</text>

      {/* 乗り場プラットフォーム */}
      <rect x="10" y="96" width={isT1 ? 326 : isT3 ? 360 : 350} height="8" fill="#d1d5db" rx="0"/>

      {/* バス停マーカー（ホテル専用エリア内のものは除外） */}
      {map.stops.filter(s => !(isT1 && s.type === 'hotel')).map((s, i) => {
        const col = STOP_COLOR[s.type]
        const lines = s.desc.split('\n')
        const mx = s.x + 20
        return (
          <g key={i}>
            <rect x={s.x} y="97" width="40" height="7" fill={col} opacity="0.25" rx="1"/>
            <rect x={mx - 1.5} y="96" width="3" height="22" fill={col} rx="1"/>
            <rect x={s.x} y="96" width="40" height="22" fill={col} rx="5"/>
            <text x={mx} y="111" fontSize="9.5" fontWeight="900" fill="#fff" textAnchor="middle">{s.label}</text>
            {lines.map((line, li) => (
              <text key={li} x={mx} y={124 + li*10} fontSize="6.5" fill="var(--text-secondary)" textAnchor="middle" fontWeight="600">{line}</text>
            ))}
          </g>
        )
      })}

      {/* T1: ホテル専用エリア内の🏨マーク */}
      {isT1 && (
        <text x="381" y="115" fontSize="20" textAnchor="middle">🏨</text>
      )}

      {/* 注釈 */}
      <text x={isT1 ? 173 : 185} y="175" fontSize="6" fill="var(--text-tertiary)" textAnchor="middle">{map.note}</text>

      {/* 凡例 */}
      {[
        { col: '#3b82f6', label: 'リムジン', x: 15 },
        { col: '#22c55e', label: '格安バス', x: 75 },
        { col: '#a855f7', label: '循環バス', x: 137 },
        { col: '#f97316', label: 'ホテル送迎', x: 199 },
      ].map((l, i) => (
        <g key={i}>
          <rect x={l.x} y="165" width="7" height="5" fill={l.col} rx="1"/>
          <text x={l.x+9} y="171" fontSize="6.5" fill="var(--text-secondary)">{l.label}</text>
        </g>
      ))}
    </svg>
  )
}

// ─── メインコンポーネント ──────────────────────────────
export default function BusMap() {
  const [active, setActive] = useState('t1')
  const t = TERMINALS.find(t => t.id === active)
  const tc = { t1: '#3b82f6', t2: '#22c55e', t3: '#f97316' }[active]

  return (
    <div className="busmap-wrap">

      {/* タブ */}
      <div className="busmap-tabs">
        {TERMINALS.map(term => (
          <button
            key={term.id}
            className={`busmap-tab ${active === term.id ? 'busmap-tab-active' : ''}`}
            style={active === term.id ? { borderColor: tc, color: tc } : {}}
            onClick={() => setActive(term.id)}
          >
            {term.label}
            <span className="busmap-tab-sub">{term.sublabel}</span>
          </button>
        ))}
      </div>

      {/* フロアマップ */}
      <FloorMap termId={active} />

      {/* のりば一覧 */}
      <div className="busmap-stops-list">
        {t.stops.map((s, i) => (
          <div key={i} className="busmap-stop-row">
            <div className="busmap-stop-num" style={{ background: TYPE_STYLE[s.type].bg, color: TYPE_STYLE[s.type].text }}>
              {s.num}{s.type !== 'hotel' ? '番' : ''}
            </div>
            <div className="busmap-stop-detail">
              <div className="busmap-stop-name">{s.name}</div>
              <div className="busmap-stop-dest">{s.dest}</div>
              <div className="busmap-stop-loc">📍 {s.loc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="fare-source">参考情報 / 各ホテルの運行状況は公式サイトでご確認ください</div>
    </div>
  )
}
