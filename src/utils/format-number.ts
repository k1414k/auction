export const formatNumber = (value: number | string): string => {
  const num = Number(value)
  if (Number.isNaN(num)) return "0"
  return num.toLocaleString("ja-JP")
}
