export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

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
        system: `今日（${today}）の東京都内で開催される1万人規模以上のイベントをウェブ検索し、以下のJSON配列のみ返してください。説明・前置き・Markdownは不要です。
[{"name":"イベント名","area":"エリア","venue":"会場名","cap":人数(数値),"end":"終演時刻","level":"high"}]
見つからない場合は[]のみ。`,
        messages: [{ role: 'user', content: '今日の都内大規模イベントをJSON形式で返してください。' }]
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
