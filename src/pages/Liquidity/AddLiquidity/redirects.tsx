import React from 'react'
import { Redirect, RouteComponentProps } from 'react-router-dom'
import AddLiquidity from './index'
import Zap from '../../Zap'
import AddLiquidityV3 from '../AddLiquidityV3'
import { PAIR_VERSION } from '../../../state/pool/updater'

export function RedirectToAddLiquidity(isZap?: boolean) {
  return isZap ? <Redirect to="/zap/add/" /> : <Redirect to="/add/" />
}

const OLD_PATH_STRUCTURE = /^(0x[a-fA-F0-9]{40})-(0x[a-fA-F0-9]{40})$/
export function RedirectOldAddLiquidityPathStructure(
  props: RouteComponentProps<{ currencyIdA: string; isZap: string }>
) {
  const {
    match: {
      params: { currencyIdA, isZap },
    },
    location: { search },
  } = props
  const version = new URLSearchParams(search)?.get('version')

  const match = currencyIdA.match(OLD_PATH_STRUCTURE)

  if (match?.length) {
    return isZap ? (
      <Redirect to={`zap/add/${match[1]}/${match[2]}/true`} />
    ) : (
      <Redirect to={`/add/${match[1]}/${match[2]}`} />
    )
  }

  return isZap ? <Zap /> : version !== PAIR_VERSION.V3 ? <AddLiquidity {...props} /> : <AddLiquidityV3 {...props} />
}

export function RedirectDuplicateTokenIds(
  props: RouteComponentProps<{ currencyIdA: string; currencyIdB: string; isZap?: string }>
) {
  const {
    match: {
      params: { currencyIdA, currencyIdB, isZap },
    },
    location: { search },
  } = props
  const version = new URLSearchParams(search)?.get('version')

  if (currencyIdA.toLowerCase() === currencyIdB.toLowerCase()) {
    return isZap ? <Redirect to={`zap/add/${currencyIdA}/true`} /> : <Redirect to={`/add/${currencyIdA}`} />
  }
  return isZap ? <Zap /> : version !== PAIR_VERSION.V3 ? <AddLiquidity {...props} /> : <AddLiquidityV3 {...props} />
}
