import { useEffect, useState } from 'react'
import moment from 'moment'
import { isNumber } from 'lodash'

export const useCountdown = (targetTimestamp) => {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    status: 'NOT STARTED',
  })

  useEffect(() => {
    if (isNumber(targetTimestamp) && targetTimestamp !== 0) {
      const targetDate = moment.unix(targetTimestamp)

      const updateCountdown = () => {
        const now = moment()
        const duration = moment.duration(targetDate.diff(now))

        if (duration.asMilliseconds() <= 0) {
          setCountdown({
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            status: 'FINISHED',
          })
          return
        }

        const days = Math.floor(duration.asDays())
        const hours = duration.hours()
        const minutes = duration.minutes()
        const seconds = duration.seconds()

        setCountdown({
          days,
          hours,
          minutes,
          seconds,
          status: 'IN PROGRESS',
        })
      }

      const interval = setInterval(updateCountdown, 1000)

      // Cleanup on component unmount
      return () => clearInterval(interval)
    } else {
      return
    }
  }, [targetTimestamp])

  return countdown
}
