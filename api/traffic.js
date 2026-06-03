export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const response = await fetch('https://search.shutoko-eng.jp/traffic/kisei.json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        'Referer': 'https://search.shutoko-eng.jp/',
      },
    })
    const data = await response.json()

    const traffic = []
    const closures = []

    ;(data.item || []).forEach(item => {
      // item: [路線名, ID, 方向, 地点, 区間終点, 原因, 規制種別, 時刻, ?, ?]
      const [route, , direction, point, endPoint, cause, type] = item
      const name = `${route} ${direction}` + (point ? ` ${point}` : '')

      if (type === '入口閉鎖' || type === '出口閉鎖') {
        closures.push({ name: name.trim() })
      } else if (type && type !== '規制なし' && !type.includes('車線規制')) {
        const detail = [cause, endPoint ? `〜${endPoint}` : ''].filter(Boolean).join(' ')
        const level = type.includes('通行止') ? 'bad' : 'mid'
        traffic.push({
          road: route,
          status: type,
          detail: detail.slice(0, 30),
          level,
        })
      }
    })

    res.status(200).json({ traffic, closures, updatedAt: data.update || new Date().toISOString() })
  } catch (e) {
    res.status(500).json({ error: e.message, traffic: [], closures: [] })
  }
}
