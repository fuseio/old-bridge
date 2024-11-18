export const VOLTAGE_FINANCE_API_ROUTER = 'https://router.voltage.finance/swap/v1/quote'
export const AMPLITUDE_SERVER_URL = 'https://analytics.fuse.io/amplitude'

export enum APP_MODE_TYPES {
  development = 'development',
  production = 'production',
  staging = 'staging',
}

export const APP_MODE: APP_MODE_TYPES = (process.env.REACT_APP_APP_MODE as APP_MODE_TYPES) || APP_MODE_TYPES.development

export const AMPLITUDE_API_KEY = process.env.REACT_APP_AMPLITUDE_API_KEY ?? ''
export const GOOGLE_ANALYTICS_ID = process.env.REACT_APP_GOOGLE_ANALYTICS_ID ?? ''
