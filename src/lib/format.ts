import { format } from 'date-fns'
import { enGB } from 'date-fns/locale'

export function formatMoney(amount: number | null | undefined): string {
  const n = Number(amount ?? 0)
  const whole = Number.isInteger(Math.round(n * 100) / 100)
  const num = n.toLocaleString('en-NG', {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  })
  return `₦${num}`
}

const NIGERIA = { dial: '+234', lengths: [10] }
const E164_PATTERN = /^\+[1-9][0-9]{7,14}$/

export function formatPhoneForDisplay(e164: string | null | undefined) {
  if (!e164 || !E164_PATTERN.test(e164)) return e164 ?? ''
  if (!e164.startsWith(NIGERIA.dial)) return e164
  const national = e164.slice(NIGERIA.dial.length)
  if (!NIGERIA.lengths.includes(national.length)) return e164
  const groups = [national.slice(0, 3), national.slice(3, 6), national.slice(6)]
  return `${NIGERIA.dial} ${groups.join(' ')}`
}

export function parseDbDate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    return new Date(value.replace(' ', 'T') + 'Z')
  }
  return new Date(value)
}

export function daysAgo(date: string | Date) {
  const d = typeof date === 'string' ? parseDbDate(date) : date
  const today = new Date(new Date().toDateString())
  const day = new Date(d.toDateString())
  const n = Math.round((today.getTime() - day.getTime()) / 864e5)
  if (n <= 0) return 'Today'
  if (n === 1) return 'Yesterday'
  if (n < 14) return `${n} days ago`
  if (n < 60) return `${Math.floor(n / 7)} weeks ago`
  return format(d, 'd MMM', { locale: enGB })
}

export function formatDateTime(value: string) {
  return format(parseDbDate(value), 'EEE d MMM yyyy, h:mm a', {
    locale: enGB,
  })
}
