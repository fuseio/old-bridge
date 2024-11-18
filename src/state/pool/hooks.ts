import { useCallback, useEffect, useState } from 'react'
import { voltageSubgraphV2Client } from '../../graphql/client'
import { USER_PAIR_LIQUIDITY } from '../../graphql/queries'
import { useWeb3 } from '../../hooks'
import { useBlockNumber } from '../../state/application/hooks'

const getUserLiquidityPositions = async (userId) => {
  const result = await voltageSubgraphV2Client.query({
    query: USER_PAIR_LIQUIDITY,
    variables: {
      id: userId.toLowerCase(),
    },
    fetchPolicy: 'cache-first',
  })
  return result?.data?.user?.liquidityPositions.map(
    ({ liquidityTokenBalance, pair: { totalSupply, id, reserve0, reserve1, token0, token1 } }) => {
      return {
        id,
        liquidityTokenBalance: parseFloat(liquidityTokenBalance),
        token0,
        token1,
        balance0: (parseFloat(reserve0) / parseFloat(totalSupply)) * parseFloat(liquidityTokenBalance),
        balance1: (parseFloat(reserve1) / parseFloat(totalSupply)) * parseFloat(liquidityTokenBalance),
        shareOfPool: parseFloat(liquidityTokenBalance) / parseFloat(totalSupply),
      }
    }
  )
}

export const useUserLiquidityPositions = () => {
  const { account } = useWeb3()

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const blockNumber = useBlockNumber()

  const fetchUserLiquidityPositions = useCallback(async () => {
    setLoading(true)
    if (account) {
      setData(await getUserLiquidityPositions(account))
    }
    setLoading(false)
  }, [account, blockNumber])

  useEffect(() => {
    fetchUserLiquidityPositions()
  }, [account, blockNumber])
  return [data, loading]
}
