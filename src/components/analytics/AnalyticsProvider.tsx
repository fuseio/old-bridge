import ReactGA from 'react-ga4'
import { isMobile } from 'react-device-detect'
import * as amplitude from '@amplitude/analytics-browser'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

import { AMPLITUDE_API_KEY, AMPLITUDE_SERVER_URL, GOOGLE_ANALYTICS_ID } from '../../constants/config'

const AnalyticsContext = createContext<any>({})

interface Props {
  children?: ReactNode
}

/**
 * Initializes analytics
 */
export default function AnalyticsProvider({ children }: Props) {
  const [analytics, setAnalytics] = useState<any>({})

  useEffect(() => {
    // Init Amplitude
    if (AMPLITUDE_API_KEY !== '') {
      amplitude.init(AMPLITUDE_API_KEY, undefined, {
        serverUrl: AMPLITUDE_SERVER_URL,
        defaultTracking: { sessions: true, pageViews: true, formInteractions: true, fileDownloads: true },
      })
    }

    // Init GA
    if (GOOGLE_ANALYTICS_ID !== '') {
      ReactGA.initialize(GOOGLE_ANALYTICS_ID)
      ReactGA.set({
        customBrowserType: !isMobile
          ? 'desktop'
          : 'web3' in window || 'ethereum' in window
          ? 'mobileWeb3'
          : 'mobileRegular',
      })

      window.addEventListener('error', (error) => {
        ReactGA.send({
          hitType: 'exception',
          description: `${error.message} @ ${error.filename}:${error.lineno}:${error.colno}`,
          fatal: true,
        })
      })
    }

    setAnalytics({ amplitude })
  }, [])

  return <AnalyticsContext.Provider value={analytics}>{children}</AnalyticsContext.Provider>
}

export function useAnalyticsProvider() {
  return useContext(AnalyticsContext)
}
