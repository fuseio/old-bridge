import { Route } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import { beforeSend } from '../../utils/errors'

const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN ?? ''
const SENTRY_ENVIRONMENT = process.env.REACT_APP_APP_MODE ?? ''

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration(), Sentry.browserProfilingIntegration()],
  tracesSampleRate: 1.0,
  tracePropagationTargets: ['voltage.finance'],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: SENTRY_ENVIRONMENT,
  beforeSend,
})

export const SentryRoute = Sentry.withSentryRouting(Route)
