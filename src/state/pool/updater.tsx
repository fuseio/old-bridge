import { useDispatch } from 'react-redux'
import { useEffect, useMemo } from 'react'

import { useWeb3 } from '../../hooks'
import { appendV2, isV2 } from '../../utils'
import { useAllSwapTokens } from '../../hooks/Tokens'
import { useAllTransactions } from '../transactions/hooks'
import { getClaimableForAll, getMerklPairs } from '../../hooks/useMerklApi'
import { getVoltageV3PoolsPoolPage } from '../../graphql/queries/voltageV3Subgraph'
import { getVoltageV2PairsPoolPage } from '../../graphql/queries/voltageV2Subgraph'
import { USER_PAIR_LIQUIDITY, USER_V3_POOL_POSITIONS } from '../../graphql/queries'
import { voltageSubgraphV3Client, voltageSubgraphV2Client } from '../../graphql/client'
import { SUBGRAPH_WHITELIST } from '../../constants'
import { addMerklPairs, addTokenPairs, addUserMerklPairs, addUserTokenPairs, setLoadingPairs } from './actions'

export enum PAIR_VERSION {
  V2 = 'v2',
  V3 = 'v3',
}

const millisecondsPerDay = 24 * 60 * 60 * 1000

const fetchV2PairsInfo = async (tokenAddresses: Array<string>) => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const sevenDaysAgo = new Date(now.getTime() - 7 * millisecondsPerDay)
  const oneWeek = Math.floor(sevenDaysAgo.getTime() / 1000)
  const pairsOneWeek = await getVoltageV2PairsPoolPage(oneWeek)

  const formattedV2PairInfo = pairsOneWeek
    ?.map(({ id, reserveUSD, dayData, token0, token1 }) => {
      const volume24Hours = parseFloat(dayData[dayData?.length - 1]?.volumeUSD) || 0
      const volume7Days = dayData.reduce((accumulator, object) => {
        return accumulator + parseFloat(object.volumeUSD)
      }, 0)

      return {
        id,
        name: `${token0?.symbol}-${token1?.symbol}`,
        symbol: `${token0?.symbol}-${token1?.symbol}`,
        liquidity: parseFloat(reserveUSD),
        volume24Hours,
        volume7Days,
        token0,
        token1,
        version: PAIR_VERSION.V2,
      }
    })
    .sort((a, b) => {
      const sortPropertyA = a.liquidity || 0
      const sortPropertyB = b.liquidity || 0
      return sortPropertyB - sortPropertyA
    })

  return formattedV2PairInfo?.filter(
    (pool) => tokenAddresses.includes(pool.token0.id) && tokenAddresses.includes(pool.token1.id)
  )
}

const fetchV3PairsInfo = async (tokenAddresses: Array<string>) => {
  const now = new Date()

  now.setHours(0, 0, 0, 0)

  const sevenDaysAgo = new Date(now.getTime() - 7 * millisecondsPerDay)
  const oneWeek = Math.floor(sevenDaysAgo.getTime() / 1000)
  const poolsOneWeek = await getVoltageV3PoolsPoolPage(oneWeek)

  const v3Pools = poolsOneWeek
    ?.map(({ id, totalValueLockedUSD, totalValueLockedUSDUntracked, poolDayData, token0, token1, feeTier }) => {
      const volume24Hours = parseFloat(poolDayData[poolDayData?.length - 1]?.volumeUSD) || 0
      const volume7Days = poolDayData.reduce((accumulator, object) => {
        return accumulator + parseFloat(object.volumeUSD)
      }, 0)

      const isV2Pool = isV2(token0.id) || isV2(token1.id)

      const isBothWhitelisted = SUBGRAPH_WHITELIST.includes(token0.id) && SUBGRAPH_WHITELIST.includes(token1.id)

      return {
        id,
        name: `${token0?.symbol}-${token1?.symbol} ${isV2Pool ? 'V2' : ''}`,
        symbol: `${token0?.symbol}-${token1?.symbol} ${isV2Pool ? 'V2' : ''}`,
        feeTier,
        volume7Days,
        volume24Hours,
        liquidity: isBothWhitelisted ? parseFloat(totalValueLockedUSD) : parseFloat(totalValueLockedUSDUntracked),
        token0: {
          ...token0,
          name: appendV2(token0?.id, token0?.name),
        },
        token1: {
          ...token1,
          name: appendV2(token1?.id, token1?.name),
        },
        version: PAIR_VERSION.V3,
      }
    })
    .sort((a, b) => {
      const sortPropertyA = a.liquidity || 0
      const sortPropertyB = b.liquidity || 0
      return sortPropertyB - sortPropertyA
    })

  return v3Pools?.filter((pool) => tokenAddresses.includes(pool.token0.id) && tokenAddresses.includes(pool.token1.id))
}

const getUserLiquidityPositions = async (userId) => {
  const result = await voltageSubgraphV2Client.query({
    query: USER_PAIR_LIQUIDITY,
    variables: {
      id: userId.toLowerCase(),
    },
    fetchPolicy: 'no-cache',
  })

  if (result?.data?.user?.liquidityPositions) {
    return result?.data?.user?.liquidityPositions.map(
      ({ liquidityTokenBalance, pair: { totalSupply, id, reserve0, reserveUSD, reserve1, token0, token1 } }) => {
        return {
          id,
          liquidityTokenBalance: parseFloat(liquidityTokenBalance),
          token0: {
            ...token0,
            name: appendV2(token0?.id, token0?.name),
          },
          token1: {
            ...token1,
            name: appendV2(token1?.id, token1?.name),
          },
          balance0: (parseFloat(reserve0) / parseFloat(totalSupply)) * parseFloat(liquidityTokenBalance),
          balance1: (parseFloat(reserve1) / parseFloat(totalSupply)) * parseFloat(liquidityTokenBalance),
          balanceUSD: (parseFloat(reserveUSD) / parseFloat(totalSupply)) * parseFloat(liquidityTokenBalance),
          shareOfPool: parseFloat(liquidityTokenBalance) / parseFloat(totalSupply),
          version: PAIR_VERSION.V2,
        }
      }
    )
  } else {
    return []
  }
}

export const getUserV3LiquidityPositions = async (userId) => {
  if (!userId) return []

  const result = await voltageSubgraphV3Client.query({
    query: USER_V3_POOL_POSITIONS,
    variables: {
      id: userId?.toLowerCase(),
    },
    fetchPolicy: 'no-cache',
  })

  return result?.data?.positions
    .map((position) => ({
      id: Number(position.id),
      tokenId: position.id,
      token0: {
        ...position.token0,
        name: appendV2(position.token0?.id, position.token0?.name),
      },
      token1: {
        ...position.token1,
        name: appendV2(position?.token1?.id, position.token0?.name),
      },
      feeTier: position.pool.feeTier,
      pool: position.pool.id,
      outOfRange:
        Number(position.pool.tick) < Number(position.tickLower.tickIdx) ||
        Number(position.pool.tick) > Number(position.tickUpper.tickIdx),
      version: PAIR_VERSION.V3,
    }))
    .sort((a, b) => a.id - b.id)
}

export const fetchUserCampaigns = async (account) => {
  const campaigns = await getClaimableForAll(account)
  // eslint-disable-next-line prefer-const
  let formattedCampaigns: { [key: string]: any[] } = {}
  if (!campaigns) {
    return {}
  }
  Object.keys(campaigns).forEach((campaignId) => {
    Object.values(campaigns[campaignId]).forEach((campaign) => {
      if (!formattedCampaigns[campaign.mainParameter]) {
        formattedCampaigns[campaign.mainParameter] = []
      }
      const tokenIndex = formattedCampaigns[campaign.mainParameter].findIndex((c) => c.token === campaign.token)
      if (tokenIndex === -1) {
        formattedCampaigns[campaign.mainParameter].push({
          token: campaign.token,
          accumulated: campaign.accumulated,
          unclaimed: campaign.unclaimed,
          decimals: campaign.decimals,
          symbol: campaign.symbol,
        })
      } else {
        formattedCampaigns[campaign.mainParameter][tokenIndex].accumulated = (
          BigInt(formattedCampaigns[campaign.mainParameter][tokenIndex].accumulated) + BigInt(campaign.accumulated)
        ).toString()
        formattedCampaigns[campaign.mainParameter][tokenIndex].unclaimed = (
          BigInt(formattedCampaigns[campaign.mainParameter][tokenIndex].unclaimed) + BigInt(campaign.unclaimed)
        ).toString()
      }
    })
  })
  return formattedCampaigns
}

export default function Updater(): null {
  const dispatch = useDispatch()
  const { account } = useWeb3()
  const transactions = useAllTransactions()

  const tokens = useAllSwapTokens()
  const tokenAddresses = useMemo(() => Object.keys(tokens).map((token) => token.toLowerCase()), [tokens])

  useEffect(() => {
    const fetchPairs = async () => {
      const v2Pairs = await fetchV2PairsInfo(tokenAddresses)
      const v3Pairs = await fetchV3PairsInfo(tokenAddresses)

      if (v2Pairs?.length > 0 && v3Pairs?.length) {
        const pairs = [...v2Pairs, ...v3Pairs]
        dispatch(addTokenPairs(pairs))
        dispatch(setLoadingPairs(false))
      }
    }

    fetchPairs()
  }, [account, dispatch, tokenAddresses, tokens])

  useEffect(() => {
    const fetchUserLiquidityPositions = async () => {
      if (!account) {
        return
      }

      const userV2Positions = await getUserLiquidityPositions(account)
      const userV3Positions = await getUserV3LiquidityPositions(account) // TODO: Check if it's better be better to use --> import { useV3Positions } from '../../hooks/useV3Positions'

      const userPositions = [...userV2Positions, ...userV3Positions]
      dispatch(addUserTokenPairs(userPositions))
    }

    fetchUserLiquidityPositions()
  }, [account, transactions, dispatch])

  useEffect(() => {
    const fetchUserMerklPairs = async () => {
      if (!account) {
        return
      }

      const userMerklPairs = await fetchUserCampaigns(account)
      let userMerklPairsArray = []
      Object.keys(userMerklPairs).forEach((key) => {
        userMerklPairsArray = [
          ...userMerklPairsArray,
          ...userMerklPairs[key].map((campaign) => ({
            token: campaign.token,
            accumulated: campaign.accumulated,
            unclaimed: campaign.unclaimed,
            decimals: campaign.decimals,
            symbol: campaign.symbol,
            mainParameter: key.toLowerCase(),
          })),
        ]
      })
      dispatch(addUserMerklPairs(userMerklPairsArray))
    }

    fetchUserMerklPairs()
  }, [account, dispatch])

  useEffect(() => {
    const fetchMerklPairs = async () => {
      const pairs = await getMerklPairs()
      dispatch(addMerklPairs(pairs))
    }
    fetchMerklPairs()
  }, [dispatch])

  return null
}
