import { TokenList } from '@fuseio/token-lists'

import { APP_MODE, APP_MODE_TYPES } from './config'
import PROD_BRIDGE_LIST from '@voltage-finance/bridge-default-token-list'

// the Voltage Finance Default token list lives here
const PROD_BRIDGE_DEFAULT_TOKEN_LIST_URL =
  'https://raw.githubusercontent.com/voltfinance/bridge-default-token-list/master/build/voltage-bridge-default.tokenlist.json'
const STAGING_BRIDGE_DEFAULT_TOKEN_LIST_URL =
  'https://raw.githubusercontent.com/voltfinance/bridge-default-token-list/master/build/voltage-bridge-default.tokenlist.json'
const DEVELOPMENT_BRIDGE_DEFAULT_TOKEN_LIST_URL =
  'https://raw.githubusercontent.com/voltfinance/bridge-default-token-list/master/build/voltage-bridge-default.tokenlist.json'

export const SWAP_DEFAULT_TOKEN_LIST_URL =
  'https://raw.githubusercontent.com/voltfinance/swap-default-token-list/master/build/voltage-swap-default.tokenlist.json'

export const VOLTAGE_FINANCE_LOGOS_URL =
  'https://raw.githubusercontent.com/voltfinance/swap-default-token-list/master/logos'

function getBridgeListURL(env: APP_MODE_TYPES): string {
  switch (env) {
    case APP_MODE_TYPES.production:
      return PROD_BRIDGE_DEFAULT_TOKEN_LIST_URL

    case APP_MODE_TYPES.staging:
      return STAGING_BRIDGE_DEFAULT_TOKEN_LIST_URL

    case APP_MODE_TYPES.development:
    default:
      return DEVELOPMENT_BRIDGE_DEFAULT_TOKEN_LIST_URL
  }
}

export function getBridgeList(env: string): TokenList {
  switch (env) {
    case 'development':
      return PROD_BRIDGE_LIST
    case 'production':
      return PROD_BRIDGE_LIST
    case 'beta':
      return PROD_BRIDGE_LIST
    default:
      return PROD_BRIDGE_LIST
  }
}

export const BRIDGE_DEFAULT_TOKEN_LIST = getBridgeList(APP_MODE)
export const BRIDGE_DEFAULT_TOKEN_LIST_URL = getBridgeListURL(APP_MODE)
export const BRIDGE_DEFAULT_LIST_OF_LISTS: string[] = [BRIDGE_DEFAULT_TOKEN_LIST_URL]
export const SWAP_DEFAULT_LIST_OF_LISTS: string[] = [SWAP_DEFAULT_TOKEN_LIST_URL]
