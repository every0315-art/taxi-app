import { useState } from 'react'

export default function SalesRecord({ onAdd }) {
  const [amount, setAmount] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const num = parseInt(amount, 10)
    if (!num || num <= 0) return
    onAdd(num)
    setAmount('')
  }

  return (
    <div className="card">
      <h2>売上を追加</h2>
      <form className="sales-form" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <span className="input-prefix">¥</span>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="金額を入力"
            min="1"
          />
        </div>
        <button type="submit" className="btn-add">追加</button>
      </form>
    </div>
  )
}
