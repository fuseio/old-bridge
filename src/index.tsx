import './components/errorReporting/sentry'
import 'inter-ui'

import { Provider } from 'react-redux'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from 'styled-components'
import { Slide, ToastContainer } from 'react-toastify'
import { Web3OnboardProvider, init } from '@web3-onboard/react'

import './i18n'
import store from './state'
import App from './pages/App'
import { preset } from './theme/preset'
import { FixedGlobalStyle } from './theme'
import { getChains } from './constants/chains'
// import UserUpdater from './state/user/updater'
import ListsUpdater from './state/lists/updater'
import MulticallUpdater from './state/multicall/updater'
import ApplicationUpdater from './state/application/updater'
import TransactionUpdater from './state/transactions/updater'
import AnalyticsProvider from './components/analytics/AnalyticsProvider'
import {
  coinbaseWalletSdk,
  enrkyptModule,
  gnosis,
  injected,
  mewWalletModule,
  trezor,
  walletConnect,
} from './connectors/onboard'

import Bolt from './assets/svg/bolt.svg'
import LogoIcon from './assets/svg/fusefi-wordmark.svg'

import './theme/toast.css'
import './theme/onboard.css'

const web3Onboard = init({
  apiKey: '4cf93d6b-79de-431e-ae1f-a2d6a79dea57',
  wallets: [injected, coinbaseWalletSdk, walletConnect, trezor, gnosis, enrkyptModule, mewWalletModule],
  theme: {
    '--w3o-background-color': 'white',
    '--w3o-foreground-color': 'white',
    '--w3o-text-color': 'black',
    '--w3o-border-color': 'rgb(60, 61, 65,0.3)',
    '--w3o-action-color': 'rgb(60, 61, 65,0.3)',
    '--w3o-border-radius': '16px',
  },
  connect: {
    autoConnectLastWallet: true,
    showSidebar: false,
    removeWhereIsMyWalletWarning: true,
  },

  appMetadata: {
    name: 'Voltage.Finance',
    icon: Bolt,
    logo: LogoIcon,
    description: 'Connect to the Voltage.Finance',
    explore: 'https://app.voltage.finance',
    recommendedInjectedWallets: [
      { name: 'Coinbase', url: 'https://wallet.coinbase.com/' },
      { name: 'MetaMask', url: 'https://metamask.io' },
    ],
    agreement: {
      version: '1.0.0',
      termsUrl: 'https://docs.voltage.finance/voltage/volt-app/terms-of-service',
      privacyUrl: 'https://docs.voltage.finance/voltage/volt-app/privacy-policy',
    },
  },
  chains: getChains(),
})

function Updaters() {
  return (
    <>
      {/* <UserUpdater />  Currently only manages dark/light mode*/}
      <ListsUpdater />
      <ApplicationUpdater />
      <TransactionUpdater />
      <MulticallUpdater />
    </>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <>
    <FixedGlobalStyle />
    <div id="accountCenterContainer"></div>
    <AnalyticsProvider>
      <Provider store={store}>
        <Web3OnboardProvider web3Onboard={web3Onboard}>
          <Updaters />
          <ThemeProvider theme={preset}>
            <ToastContainer transition={Slide} />
            <App />
          </ThemeProvider>
        </Web3OnboardProvider>
      </Provider>
    </AnalyticsProvider>
  </>
)
