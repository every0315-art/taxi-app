export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API key not configured', traffic: [], closures: [] })

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
        system: `首都高速道路の現在の渋滞・規制情報をウェブ検索し、以下のJSON形式のみ返してください。前置き不要。
{"traffic":[{"road":"路線名","status":"渋滞|混雑|通行止め","detail":"詳細","level":"bad|mid"}],"closures":[{"name":"出入口名"}]}
問題なければ {"traffic":[],"closures":[]}`,
        messages: [{ role: 'user', content: '首都高速の現在の渋滞・通行止め情報をJSON形式で返してください。' }]
      })
    })

    const data = await response.json()
    const text = data.content?.find(b => b.type === 'text')?.text || '{}'
    const match = text.match(/\{[\s\S]*\}/)
    const result = match ? JSON.parse(match[0]) : { traffic: [], closures: [] }

    res.status(200).json({ ...result, updatedAt: new Date().toISOString() })
  } catch (e) {
    res.status(500).json({ error: e.message, traffic: [], closures: [] })
  }
}
