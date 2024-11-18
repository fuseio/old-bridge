import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import weekOfYear from 'dayjs/plugin/weekOfYear'

dayjs.extend(utc)
dayjs.extend(weekOfYear)

export function unixToDate(unix: number, format = 'YYYY-MM-DD'): string {
  return dayjs.unix(unix).utc().format(format)
}

export function unixToType(unix: number, type: 'month' | 'week') {
  const date = dayjs.unix(unix).utc()

  switch (type) {
    case 'month':
      return date.format('YYYY-MM')
    case 'week':
      let week = String(date.week())
      if (week.length === 1) {
        week = `0${week}`
      }
      return `${date.year()}-${week}`
  }
}