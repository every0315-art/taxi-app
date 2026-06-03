export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API key not configured', delayed: [] })

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
        max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: `東京・関東の鉄道運行情報をウェブ検索し、遅延・運休・見合わせ中の路線のみ以下のJSON形式で返してください。前置き不要。
[{"name":"路線名","status":"遅延|運休|見合わせ|運転状況","detail":"詳細"}]
問題なければ []`,
        messages: [{ role: 'user', content: '現在の東京・関東の電車遅延・運休情報をJSON形式で返してください。' }]
      })
    })

    const data = await response.json()
    const text = data.content?.find(b => b.type === 'text')?.text || '[]'
    const match = text.match(/\[[\s\S]*\]/)
    const delayed = match ? JSON.parse(match[0]) : []

    res.status(200).json({ delayed, updatedAt: new Date().toISOString() })
  } catch (e) {
    res.status(500).json({ error: e.message, delayed: [] })
  }
}
