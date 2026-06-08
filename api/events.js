// 東京都内大規模イベント静的データベース（年間固定イベント）
// m=月, d1=開始日, d2=終了日
const EVENTS_DB = [
  // 1月
  { name: '浅草寺初詣', area: '浅草', venue: '浅草寺', m: 1, d1: 1, d2: 3, cap: 3000000, end: '21:00', level: 'high' },
  { name: '東京オートサロン', area: '幕張', venue: '幕張メッセ', m: 1, d1: 9, d2: 11, cap: 300000, end: '20:00', level: 'high' },
  { name: '世田谷ボロ市', area: '世田谷', venue: '世田谷', m: 1, d1: 15, d2: 16, cap: 200000, end: '20:00', level: 'mid' },
  // 2月
  { name: '節分会', area: '浅草・池上', venue: '浅草寺・池上本門寺ほか', m: 2, d1: 3, d2: 3, cap: 100000, end: '20:00', level: 'mid' },
  { name: 'ワンダーフェスティバル冬', area: '幕張', venue: '幕張メッセ', m: 2, d1: 8, d2: 8, cap: 50000, end: '17:00', level: 'mid' },
  // 3月
  { name: '東京マラソン', area: '都心部', venue: '東京都心一円', m: 3, d1: 1, d2: 1, cap: 38000, end: '18:00', level: 'high' },
  { name: '桜まつり', area: '目黒・上野ほか', venue: '目黒川・上野公園', m: 3, d1: 25, d2: 31, cap: 300000, end: '22:00', level: 'high' },
  { name: '東京モーターサイクルショー', area: '有明', venue: '東京ビッグサイト', m: 3, d1: 27, d2: 29, cap: 150000, end: '17:00', level: 'mid' },
  { name: 'AnimeJapan', area: '有明', venue: '東京ビッグサイト', m: 3, d1: 28, d2: 29, cap: 156000, end: '17:00', level: 'high' },
  // 4月
  { name: '桜まつり', area: '目黒・上野ほか', venue: '目黒川・上野公園', m: 4, d1: 1, d2: 10, cap: 300000, end: '22:00', level: 'high' },
  { name: 'ニコニコ超会議', area: '幕張', venue: '幕張メッセ', m: 4, d1: 25, d2: 26, cap: 130000, end: '18:00', level: 'high' },
  // 5月
  { name: 'くらやみ祭', area: '府中', venue: '大國魂神社', m: 5, d1: 3, d2: 6, cap: 500000, end: '22:00', level: 'high' },
  { name: '神田祭', area: '神田', venue: '神田明神', m: 5, d1: 9, d2: 10, cap: 200000, end: '21:00', level: 'high' },
  { name: '三社祭', area: '浅草', venue: '浅草神社', m: 5, d1: 15, d2: 17, cap: 1800000, end: '21:00', level: 'high' },
  { name: 'メトロック', area: '江東区', venue: '海の森公園', m: 5, d1: 16, d2: 17, cap: 80000, end: '22:00', level: 'high' },
  { name: 'デザインフェスタ春', area: '有明', venue: '東京ビッグサイト', m: 5, d1: 16, d2: 17, cap: 60000, end: '17:00', level: 'mid' },
  { name: '日比谷オクトーバーフェスト', area: '日比谷', venue: '日比谷公園', m: 5, d1: 14, d2: 31, cap: 50000, end: '22:00', level: 'mid' },
  // 6月
  { name: '鳥越祭', area: '蔵前', venue: '鳥越神社', m: 6, d1: 6, d2: 8, cap: 100000, end: '22:00', level: 'mid' },
  { name: '山王祭（本祭）', area: '赤坂', venue: '日枝神社', m: 6, d1: 8, d2: 17, cap: 200000, end: '21:00', level: 'high' },
  { name: '81 MUSIC FESTIVAL', area: 'お台場', venue: 'TOYOTA ARENA TOKYO', m: 6, d1: 27, d2: 27, cap: 50000, end: '22:00', level: 'mid' },
  { name: '東京みなと祭', area: '有明', venue: '東京国際クルーズターミナル', m: 6, d1: 27, d2: 28, cap: 100000, end: '21:00', level: 'mid' },
  // 7月
  { name: 'World DJ Festival Japan', area: '江東区', venue: '海の森水上競技場', m: 7, d1: 4, d2: 5, cap: 50000, end: '23:00', level: 'mid' },
  { name: '入谷朝顔市', area: '入谷', venue: '入谷鬼子母神', m: 7, d1: 6, d2: 8, cap: 50000, end: '23:00', level: 'mid' },
  { name: 'ほおずき市', area: '浅草', venue: '浅草寺', m: 7, d1: 9, d2: 10, cap: 50000, end: '22:00', level: 'mid' },
  { name: 'みたままつり', area: '九段', venue: '靖国神社', m: 7, d1: 13, d2: 16, cap: 300000, end: '22:00', level: 'high' },
  { name: 'ハンドメイドインジャパンフェス', area: '有明', venue: '東京ビッグサイト', m: 7, d1: 18, d2: 19, cap: 50000, end: '17:00', level: 'mid' },
  { name: '隅田川花火大会', area: '浅草・両国', venue: '隅田川', m: 7, d1: 26, d2: 26, cap: 1000000, end: '20:30', level: 'high' },
  { name: 'TOKYO IDOL FESTIVAL', area: 'お台場', venue: 'お台場', m: 7, d1: 31, d2: 31, cap: 30000, end: '22:00', level: 'mid' },
  // 8月
  { name: 'TOKYO IDOL FESTIVAL', area: 'お台場', venue: 'お台場', m: 8, d1: 1, d2: 2, cap: 30000, end: '22:00', level: 'mid' },
  { name: '深川八幡祭り', area: '門前仲町', venue: '富岡八幡宮', m: 8, d1: 13, d2: 15, cap: 200000, end: '21:00', level: 'high' },
  { name: '神宮外苑花火大会', area: '神宮外苑', venue: '神宮外苑', m: 8, d1: 15, d2: 15, cap: 100000, end: '21:00', level: 'high' },
  { name: 'コミックマーケット夏', area: '有明', venue: '東京ビッグサイト', m: 8, d1: 15, d2: 16, cap: 200000, end: '16:00', level: 'high' },
  { name: 'サマーソニック', area: '幕張', venue: '幕張メッセ', m: 8, d1: 15, d2: 16, cap: 60000, end: '22:00', level: 'high' },
  { name: '高円寺阿波おどり', area: '高円寺', venue: '高円寺駅周辺', m: 8, d1: 29, d2: 30, cap: 1000000, end: '20:30', level: 'high' },
  { name: '原宿表参道元氣祭スーパーよさこい', area: '原宿', venue: '原宿・表参道', m: 8, d1: 29, d2: 30, cap: 150000, end: '20:00', level: 'high' },
  // 9月
  { name: 'ULTRA JAPAN', area: 'お台場', venue: 'お台場', m: 9, d1: 12, d2: 13, cap: 60000, end: '23:00', level: 'high' },
  { name: '東京ゲームショウ', area: '幕張', venue: '幕張メッセ', m: 9, d1: 17, d2: 21, cap: 260000, end: '17:00', level: 'high' },
  // 10月
  { name: 'TOKYO ISLAND', area: '江東区', venue: '海の森公園', m: 10, d1: 10, d2: 12, cap: 50000, end: '22:00', level: 'mid' },
  { name: '東京レガシーハーフマラソン', area: '国立競技場', venue: '国立競技場発着', m: 10, d1: 18, d2: 18, cap: 20000, end: '14:00', level: 'mid' },
  { name: 'ジャパンモビリティショー', area: '有明', venue: '東京ビッグサイト', m: 10, d1: 25, d2: 31, cap: 200000, end: '18:00', level: 'high' },
  // 11月
  { name: '酉の市（一の酉）', area: '浅草', venue: '鷲神社・花園神社', m: 11, d1: 7, d2: 8, cap: 100000, end: '23:00', level: 'high' },
  { name: 'デザインフェスタ秋', area: '有明', venue: '東京ビッグサイト', m: 11, d1: 14, d2: 15, cap: 60000, end: '17:00', level: 'mid' },
  { name: '七五三', area: '明治神宮・日枝神社ほか', venue: '都内各神社', m: 11, d1: 14, d2: 16, cap: 50000, end: '16:00', level: 'mid' },
  { name: '酉の市（二の酉）', area: '浅草', venue: '鷲神社・花園神社', m: 11, d1: 19, d2: 20, cap: 100000, end: '23:00', level: 'high' },
  // 12月
  { name: '羽子板市', area: '浅草', venue: '浅草寺', m: 12, d1: 17, d2: 19, cap: 80000, end: '21:00', level: 'mid' },
  { name: 'ジャンプフェスタ', area: '幕張', venue: '幕張メッセ', m: 12, d1: 19, d2: 20, cap: 100000, end: '17:00', level: 'high' },
  { name: 'コミックマーケット冬', area: '有明', venue: '東京ビッグサイト', m: 12, d1: 29, d2: 31, cap: 200000, end: '16:00', level: 'high' },
]

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600')

  const [year, month, day] = new Date()
    .toLocaleDateString('en-CA', { timeZone: 'Asia/Tokyo' })
    .split('-')
    .map(Number)

  const events = EVENTS_DB
    .filter(ev => ev.m === month && day >= ev.d1 && day <= ev.d2)
    .map(({ name, area, venue, cap, end, level }) => ({ name, area, venue, cap, end, level }))

  res.status(200).json({ events, updatedAt: new Date().toISOString() })
}
