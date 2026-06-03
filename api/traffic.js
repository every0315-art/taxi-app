export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  // 首都高渋滞情報はJSレンダリングのため直接取得不可
  // 出入口閉鎖情報は /api/shutoko で取得
  res.status(200).json({ traffic: [], updatedAt: new Date().toISOString() })
}
