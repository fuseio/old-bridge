import { gql } from '@apollo/client'

import { masterChefV4Client } from '../client'

const GET_V4_FARMS_OF_USER = gql`
  query ($userAddress: Bytes!) {
    pools {
      id
      v3Pool
      timestamp
      wfusePerSec
      voltPerSec
      token0 {
        id
        symbol
        decimals
      }
      token1 {
        id
        symbol
        decimals
      }
      userPositions(where: { user_contains: $userAddress }) {
        id
        liquidity
        isStaked
        pool {
          v3Pool
          token0 {
            id
            symbol
            decimals
          }
          token1 {
            id
            symbol
            decimals
          }
        }
        user {
          id
        }
      }
    }
  }
`

const GET_V4_FARMS_OF_POOL = gql`
  query getFarms($address: Bytes!) {
    pools(where: { v3Pool_contains: $address }) {
      userPositions {
        id
        tickLower
        tickUpper
        liquidity
        isStaked
      }
    }
  }
`

export const getV4Farms = async (userAddress) => {
  const { data } = await masterChefV4Client.query({
    query: GET_V4_FARMS_OF_USER,
    variables: {
      userAddress: userAddress.toLowerCase(),
    },
    fetchPolicy: 'no-cache',
  })

  return data?.pools || []
}

export const getV4FarmPositions = async (poolAddress: string) => {
  const { data } = await masterChefV4Client.query({
    query: GET_V4_FARMS_OF_POOL,
    variables: {
      address: poolAddress,
    },
    fetchPolicy: 'no-cache',
  })
  return data?.pools?.[0]?.userPositions || []
}
