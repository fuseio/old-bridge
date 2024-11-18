import { injected } from '../../connectors'
import { SUPPORTED_WALLETS } from '../../constants'

export const getConnector = (connector) => {
  const { ethereum } = window
  const isMetaMask = !!(ethereum && ethereum.isMetaMask)
  return Object.keys(SUPPORTED_WALLETS)
    .filter(
      (k) =>
        SUPPORTED_WALLETS[k].connector === connector && (connector !== injected || isMetaMask === (k === 'METAMASK'))
    )
    .map((k) => SUPPORTED_WALLETS[k])[0]
}
