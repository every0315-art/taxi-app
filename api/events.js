export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  // 1時間キャッシュ（CDN経由なら1時間に1回のみAPI呼び出し）
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600')

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured', events: [] })
  }

  const today = new Date().toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  })

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
        system: `今日（${today}）の東京都内のイベントをウェブ検索し、以下のJSON配列のみ返してください。説明・前置き・Markdownは不要です。
[{"name":"イベント名","area":"エリア","venue":"会場名","cap":人数(数値),"end":"終演時刻HH:MM","level":"high または mid"}]
見つからない場合は[]のみ。

【必ず個別に確認する会場】
東京ドーム、神宮球場、有明アリーナ、有明ガーデンシアター、国立競技場、代々木体育館、東京体育館、日本武道館、サントリーホール、東京オペラシティ

これら以外の1万人規模以上のイベントも含めること。levelはcap5万人以上をhigh、それ未満をmid。`,
        messages: [{ role: 'user', content: '今日の都内イベントをJSON形式で返してください。' }]
      })
    })

    const data = await response.json()
    const text = data.content?.find(b => b.type === 'text')?.text || '[]'
    const match = text.match(/\[[\s\S]*\]/)
    const events = match ? JSON.parse(match[0]) : []

    res.status(200).json({ events, updatedAt: new Date().toISOString() })
  } catch (e) {
    res.status(500).json({ error: e.message, events: [] })
  }
}
