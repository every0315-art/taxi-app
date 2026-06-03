export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const response = await fetch(
      `https://tokyo-haneda.com/app_resource/common/data/parking.json?${Date.now()}`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' } }
    )
    const data = await response.json()

    const LOTS = ['P1', 'P2', 'P3', 'P4', 'P5']
    const TERMINAL = { P1: '第1T', P2: '第1T', P3: '第1T', P4: '第2T', P5: '第3T(国際)' }

    const parking = LOTS.map(key => ({
      name: key,
      terminal: TERMINAL[key],
      status: data[key] || 'エラー',
    }))

    res.status(200).json({ parking, updatedAt: data.last_upd || new Date().toISOString() })
  } catch (e) {
    res.status(500).json({ error: e.message, parking: [] })
  }
}
