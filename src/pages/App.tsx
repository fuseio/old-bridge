import '../components/errorReporting/sentry'
import { AnimatePresence } from 'framer-motion'
import { Suspense, lazy, useEffect } from 'react'
import { useAccountCenter } from '@web3-onboard/react'
import { BrowserRouter as Router, Switch, useLocation } from 'react-router-dom'

import Menu from '../components/Menu'
import { preset } from '../theme/preset'
import Loader from '../components/Loader'
import Popups from '../components/Popups'
import { RedirectToDefault } from './redirects'
import MobileNav from '../components/MobileNav'
import useMediaQuery from '../hooks/useMediaQuery'
import { RpcLoader } from '../components/RpcLoader'
import { RedirectPathToSwapOnly } from './Swap/redirects'
import AnalyticsReporter from '../components/analytics/AnalyticsReporter'
import { RedirectOldRemoveLiquidityPathStructure } from './Liquidity/RemoveLiquidity/redirects'
import {
  RedirectDuplicateTokenIds,
  RedirectOldAddLiquidityPathStructure,
  RedirectToAddLiquidity,
} from './Liquidity/AddLiquidity/redirects'
import { SentryRoute } from '../components/errorReporting/sentry'
import SimpleStaking from './Stake/SimpleStaking'
import { USDC_FARM_PID, USDC_V2, WETH_FARM_PID, WETH_V2 } from '../constants'
import { isHomePage } from '../utils'

const Home = lazy(() => import('./Home'))
const VoltApp = lazy(() => import('./VoltApp'))
const Swap = lazy(() => import('./Swap'))
const Pool = lazy(() => import('./Pool'))
const AddLiquidity = lazy(() => import('./Liquidity/AddLiquidity'))
const RemoveLiquidity = lazy(() => import('./Liquidity/RemoveLiquidity'))
const Bridge = lazy(() => import('./Bridge'))
const Migrate = lazy(() => import('./Migrate'))
const Farms = lazy(() => import('./Farms'))
const xVOLT = lazy(() => import('./Stake/xVOLT'))
const sFUSE = lazy(() => import('./Stake/SFuse'))
const StakeOptions = lazy(() => import('./Stake'))
const Zap = lazy(() => import('./Zap'))
const Mint = lazy(() => import('./Mint'))
const VeVolt = lazy(() => import('./Stake/Page/VeVolt'))
const Mobile = lazy(() => import('./Mobile'))
const Launchpad = lazy(() => import('./Launchpad'))
const Analytics = lazy(() => import('./Analytics'))
const Launch = lazy(() => import('./Launchpad/Launch'))
const RemoveLiquidityV3 = lazy(() => import('./Liquidity/RemoveLiquidityV3'))
const AdjustLiquidityV3 = lazy(() => import('./Liquidity/AdjustLiquidityV3'))

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

function Nav() {
  const location = useLocation()
  if (!isHomePage(location)) {
    return (
      <>
        <Menu />
        <MobileNav />
      </>
    )
  }
}

export default function App() {
  return (
    <AnimatePresence exitBeforeEnter>
      <Router>
        <Popups />
        <ScrollToTop />
        <UpdateAccountCenter />

        <SentryRoute component={AnalyticsReporter} />
        <Suspense fallback={<Loader />}>
          <Nav />
          <Switch>
            <SentryRoute exact strict path="/mobile" component={Mobile} />

            <SentryRoute exact strict path="/home" component={Home} />
            <SentryRoute exact strict path="/app" component={VoltApp} />
            <SentryRoute exact strict path="/swap" component={Swap} />
            <SentryRoute exact path="/swap/:outputCurrency" component={Swap} />
            <SentryRoute exact strict path="/send" component={RedirectPathToSwapOnly} />
            <SentryRoute exact strict path="/pool" component={Pool} />
            <SentryRoute exact path="/launch/:id" component={Launch} />
            <SentryRoute exact strict path="/launch" component={Launchpad} />
            <SentryRoute exact strict path="/analytics" component={Analytics} />

            <SentryRoute exact path="/create" component={RedirectToAddLiquidity} />
            <SentryRoute exact path="/add" component={AddLiquidity} />
            <SentryRoute
              exact
              path="/adjust/v3/:currencyIdA/:currencyIdB/:feeAmount/:tokenId"
              component={AdjustLiquidityV3}
            />

            <SentryRoute exact path="/add/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
            <SentryRoute exact path="/add/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
            <SentryRoute exact path="/remove/:tokens" component={RedirectOldRemoveLiquidityPathStructure} />
            <SentryRoute exact path="/remove/v3/:tokenId/:feeAmount" component={RemoveLiquidityV3} />
            <SentryRoute exact path="/remove/:currencyIdA/:currencyIdB" component={RemoveLiquidity} />

            <SentryRoute exact path="/bridge" component={Bridge} />
            <SentryRoute exact path="/migrate" component={Migrate} />
            <SentryRoute exact path="/farms" component={Farms} />
            <SentryRoute exact path="/stake" component={StakeOptions} />
            <SentryRoute exact strict path="/stake/sFUSE" component={sFUSE} />
            <SentryRoute exact strict path="/stake/xVOLT" component={xVOLT} />
            <SentryRoute exact strict path="/stake/vevolt" component={VeVolt} />
            <SentryRoute
              exact
              strict
              path="/stake/usdc"
              render={() => <SimpleStaking poolId={USDC_FARM_PID} stakeToken={USDC_V2} />}
            />
            <SentryRoute
              exact
              strict
              path="/stake/eth"
              render={() => <SimpleStaking poolId={WETH_FARM_PID} stakeToken={WETH_V2} />}
            />

            <SentryRoute exact strict path="/mint" component={Mint} />
            <SentryRoute exact path="/zap" component={Zap} />
            <SentryRoute component={RedirectToDefault} />
          </Switch>
        </Suspense>

        <RpcLoader />
      </Router>
    </AnimatePresence>
  )
}
