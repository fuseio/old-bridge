import '../components/errorReporting/sentry'
import { AnimatePresence } from 'framer-motion'
import { Suspense, lazy, useEffect } from 'react'
import { useAccountCenter } from '@web3-onboard/react'
import { BrowserRouter as Router, Switch, useLocation } from 'react-router-dom'

import { preset } from '../theme/preset'
import Popups from '../components/Popups'
import { RedirectToDefault } from './redirects'
import useMediaQuery from '../hooks/useMediaQuery'
import { RpcLoader } from '../components/RpcLoader'
import AnalyticsReporter from '../components/analytics/AnalyticsReporter'
import { SentryRoute } from '../components/errorReporting/sentry'

const Bridge = lazy(() => import('./Bridge'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    const body = document?.querySelector('#root')
    body?.scrollIntoView()
  }, [pathname])
  return null
}

const UpdateAccountCenter = () => {
  const updateAccountCenter = useAccountCenter()
  const isDesktop = useMediaQuery(`(min-width: ${preset.breakpoints[2]})`)
  const isMobile = useMediaQuery(`(max-width: ${preset.breakpoints[0]})`)
  const isTablet = useMediaQuery(`(max-width: ${preset.breakpoints[1]})`)

  useEffect(() => {
    if (isMobile) {
      return updateAccountCenter({
        position: 'topLeft',
        minimal: true,
        enabled: true,
      })
    }
    if (isTablet || isDesktop) {
      return updateAccountCenter({
        position: 'topLeft',
        minimal: false,
        enabled: false,
      })
    }
  }, [isTablet, isDesktop, isMobile])

  return <div></div>
}

export default function App() {
  return (
    <AnimatePresence exitBeforeEnter>
      <Router>
        <Popups />
        <ScrollToTop />
        <UpdateAccountCenter />

        <SentryRoute component={AnalyticsReporter} />
        <Suspense>
          <Switch>
            <SentryRoute exact path="/" component={Bridge} />
            <SentryRoute component={RedirectToDefault} />
          </Switch>
        </Suspense>

        <RpcLoader />
      </Router>
    </AnimatePresence>
  )
}
