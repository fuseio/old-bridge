import ReactGA from 'react-ga4'
import { useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'

import useAnalytics from '../../hooks/useAnalytics'

// Fires a Amplitude/GA page view every time the route changes
export default function AnalyticsReporter({ location: { pathname, search } }: RouteComponentProps): null {
  const { sendEvent } = useAnalytics()

  useEffect(() => {
    sendEvent('View', { page: `${pathname}${search}` })
    ReactGA.send({ hitType: 'pageview', page: `${pathname}${search}` })
  }, [pathname, search])
  return null
}
