export function formatDate(date) {
  if (!date) return ''
  // 支持直接传字符串或 Date
  const d = date instanceof Date ? date : new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatDateTime(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  const base = formatDate(d)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${base} ${h}:${m}:${s}`
}

export function formatLocalDateTime(raw) {
  if (!raw) return ''
  return String(raw).replace('T', ' ')
}
