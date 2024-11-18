import JSBI from 'jsbi'
import { useDispatch } from 'react-redux'
import { formatUnits } from 'ethers/lib/utils'
import { ADDRESS_ZERO } from '@voltage-finance/v3-sdk'
import { useCallback, useEffect, useState } from 'react'

import { useWeb3 } from '../../hooks'
import { Chef } from '../chefs/hooks'
import { fetchChefFarm } from './hooks'
import { getPool } from '../../hooks/usePools'
import { ChainId } from '../../constants/chains'
import { VOLT_ADDRESS } from '../../constants/addresses'
import { useAllTransactions } from '../transactions/hooks'
import { getUserV3LiquidityPositions } from '../pool/updater'
import { appendV2, getToken0Amount, getToken1Amount } from '../../utils'
import { getMasterChefV3Farms } from '../../graphql/queries/masteChefV3Subgraph'
import { getV4FarmPositions, getV4Farms } from '../../graphql/queries/masterChefV4Subgraph'
import { addExpiredFarms, addFarms, addMyFarms, addV3Farms, setFarmsLoading } from './actions'
import { getFusePrice, getTokenPrice, getVoltPrice, tokenPriceQuery } from '../../graphql/queries'

export function useFetchV3Farms() {
  const { account, chainId } = useWeb3()
  const [data, setData] = useState([])
  const transactions = useAllTransactions()

  const fetchV3Farms = useCallback(async () => {
    try {
      const userAddress = !!account ? account?.toLowerCase() : ''

      const v4Farms = await getV4Farms(userAddress)
      const userV3Positions = await getUserV3LiquidityPositions(userAddress)

      const farms = await Promise.all(
        v4Farms.map(async (farm) => {
          const userFarmPostions = farm.userPositions.filter((p) => p.user.id === userAddress)

          const v3Positions = userV3Positions.filter((position) => {
            const found = userFarmPostions.find((p) => Number(p.id) === Number(position.id))
            return position.pool === farm.v3Pool && !found
          })

          const positions = userFarmPostions.concat(v3Positions.map((p) => ({ ...p, isStaked: false })))

          const hasStaked = !!positions.find((p) => p.isStaked)

          const pool = await getPool(farm.v3Pool)

          const allFarmPositions = (await getV4FarmPositions(farm.v3Pool)).filter((p) => p.isStaked)

          const currentTick = pool.tick.toString()
          const sqrtRatio = JSBI.BigInt(pool.sqrtPriceX96.toString())

          let totalToken0 = JSBI.BigInt('0')
          let totalToken1 = JSBI.BigInt('0')

          for (const pos of allFarmPositions) {
            const token0 = getToken0Amount(
              +currentTick,
              +pos.tickLower,
              +pos.tickUpper,
              sqrtRatio,
              JSBI.BigInt(pos.liquidity)
            )

            const token1 = getToken1Amount(
              +currentTick,
              +pos.tickLower,
              +pos.tickUpper,
              sqrtRatio,
              JSBI.BigInt(pos.liquidity)
            )

            totalToken0 = JSBI.add(totalToken0, token0)
            totalToken1 = JSBI.add(totalToken1, token1)

            const foundPos = positions.findIndex((p) => p.id === pos.id)

            if (foundPos !== -1) {
              positions[foundPos].token0Amount = token0.toString()
              positions[foundPos].token1Amount = token1.toString()
            }
          }

          const token0Price = await getTokenPrice(tokenPriceQuery, {
            id: farm.token0.id.toLowerCase(),
          })
          const token1Price = await getTokenPrice(tokenPriceQuery, {
            id: farm.token1.id.toLowerCase(),
          })

          const token0USD = Number(formatUnits(totalToken0.toString(), farm.token0.decimals)) * token0Price
          const token1USD = Number(formatUnits(totalToken1.toString(), farm.token1.decimals)) * token1Price

          const voltPrice = await getVoltPrice()
          const voltRewardsPerYear = farm.voltPerSec * 60 * 60 * 24 * 365
          const voltRewardsPerYearUSD = voltRewardsPerYear * voltPrice

          const fusePrice = await getFusePrice()
          const fuseRewardsPerYear = farm.wfusePerSec * 60 * 60 * 24 * 365
          const fuseRewardsPerYearUSD = fuseRewardsPerYear * fusePrice

          const tvl = token0USD + token1USD
          const totalRewardsUSD = voltRewardsPerYearUSD + fuseRewardsPerYearUSD

          const apr = totalRewardsUSD / tvl

          return {
            ...farm,
            token0: {
              ...farm?.token0,
              symbol: appendV2(farm?.token0?.id, farm?.token0?.symbol),
            },
            token1: {
              ...farm?.token1,
              symbol: appendV2(farm?.token1?.id, farm?.token1?.symbol),
            },
            token0Price,
            token1Price,
            positions,
            tvl,
            apr,
            hasStaked,
            version: 'v3',
          }
        })
      )

      return farms
    } catch (error) {
      console.error(error)
    }
  }, [account])

  useEffect(() => {
    let canceled = false

    fetchV3Farms().then((farms) => {
      if (!canceled) {
        setData(farms)
      }
    })

    return () => {
      canceled = true
    }
  }, [account, chainId, fetchV3Farms, transactions])

  return data
}

function useFetchFarms() {
  const { account } = useWeb3()
  const [data, setData] = useState([])

  const fetchFarms = useCallback(async (acc?: string) => {
    try {
      const chefV3Farms = await getMasterChefV3Farms()
      const chefFarms = await Promise.all(
        chefV3Farms.map(
          async (farm: any) =>
            await fetchChefFarm(
              {
                ...farm,
                token0: {
                  ...farm?.token0,
                  symbol: appendV2(farm?.token0?.id, farm?.token0?.symbol),
                },
                token1: {
                  ...farm?.token1,
                  symbol: appendV2(farm?.token1?.id, farm?.token1?.symbol),
                },
                chef: Chef.MASTERCHEF_V3,
                version: 'v2',
              },
              acc
            )
        )
      )
      return chefFarms.filter((farm) => farm.id !== '26' && farm.id !== '27' && farm.id !== '28' && farm.id !== '29' && farm.id !== '30')
    } catch (error) {
      console.error(error)
    }
  }, [])

  useEffect(() => {
    let canceled = false

    fetchFarms(account).then((farms) => {
      if (!canceled) {
        setData(farms)
      }
    })

    return () => {
      canceled = true
    }
  }, [account, fetchFarms])

  return data
}

export default function Updater(): null {
  const VOLT_TOKEN_ID = VOLT_ADDRESS[ChainId.FUSE].toLowerCase()

  const dispatch = useDispatch()

  const v2Farms = useFetchFarms()
  const v3Farms = useFetchV3Farms()

  useEffect(() => {
    dispatch(setFarmsLoading(true))
    if (v2Farms?.length !== 0) {
      dispatch(setFarmsLoading(false))
    }
  }, [dispatch, v2Farms])

  useEffect(() => {
    if (!v2Farms || v2Farms?.length === 0) {
      return
    }

    const { active, expired } = (v2Farms as any).reduce(
      (acc, farm) => {
        if (farm.isExpired) {
          return { ...acc, expired: [...acc.expired, farm] }
        } else {
          return { ...acc, active: [...acc.active, farm] }
        }
      },
      { active: [], expired: [] }
    )

    const farms = [
      ...active.filter(({ tokens }: any) =>
        tokens.filter(Boolean).some((token: { id: string }) => token.id === VOLT_TOKEN_ID)
      ),
      ...active.filter(({ tokens }: any) =>
        tokens.filter(Boolean).every((token: { id: string }): any => token.id !== VOLT_TOKEN_ID)
      ),
    ].filter((farm) => farm.id !== '26')

    dispatch(addV3Farms(v3Farms))
    dispatch(addFarms(farms))
    dispatch(addExpiredFarms(expired))
    dispatch(
      addMyFarms(
        [...farms, ...v3Farms, ...expired].filter((farm) => {
          if (farm?.version === 'v2') {
            return Number(farm?.totalStaked) != 0
          } else if (farm?.version === 'v3') {
            return farm.hasStaked
          }
        })
      )
    )
  }, [dispatch, v2Farms, v3Farms])

  return null
}
