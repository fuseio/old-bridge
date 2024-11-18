import { useCallback } from 'react'

import { useAnalyticsProvider } from '../components/analytics/AnalyticsProvider'

interface AnalyticsProviders {
  amplitude: boolean
  ga?: boolean
}

export default function useAnalytics() {
  const { amplitude } = useAnalyticsProvider()

  const sendEvent = useCallback(
    (eventName: string, eventProperties?: any, providers: AnalyticsProviders = { amplitude: true }) => {
      if (!Boolean(process.env.REACT_APP_INTERNAL_ANALYTICS)) {
        return
      }

      if (providers.amplitude && amplitude) {
        try {
          amplitude.track(eventName, eventProperties)
        } catch (e) {
          console.log(`[Amplitude]: ${e}`)
        }
      }
    },
    [amplitude]
  )

  return { sendEvent }
}
