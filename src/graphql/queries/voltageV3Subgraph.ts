import moment from 'moment'
import { gql } from '@apollo/client'

import { voltageSubgraphV3Client } from '../client'
import { FACTORY_V3_ADDRESS } from '../../constants'

const GET_VOLTAGE_V3_TOKENS = gql`
  query ($from: Int!, $first: Int!, $tokenAddress: String!) {
    tokens(where: { id: $tokenAddress, totalValueLockedUSD_gt: 0 }) {
      totalValueLockedUSD
      tokenDayData(orderBy: date, orderDirection: desc, first: $first, where: { date_gte: $from }) {
        date
        priceUSD
      }
    }
  }
`

const GET_VOLTAGE_V3_POOLS = gql`
  query ($from: Int!, $first: Int!, $token0: Bytes!, $token1: Bytes!, $fee: BigInt!) {
    pools(where: { token0: $token0, token1: $token1, feeTier: $fee, liquidity_gt: 0 }) {
      token0 {
        id
      }
      totalValueLockedUSD
      poolDayData(orderBy: date, orderDirection: desc, first: $first, where: { date_gte: $from }) {
        date
        token0Price
        token1Price
      }
    }
  }
`

const GET_VOLTAGE_V3_POOLS_POOL_PAGE = gql`
  query topPairs($from: Int!) {
    pools(orderDirection: desc, where: { totalValueLockedUSDUntracked_gt: 1000 }) {
      id
      feeTier
      totalValueLockedUSD
      totalValueLockedUSDUntracked
      poolDayData(where: { date_gte: $from }) {
        volumeUSD
      }
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
    }
  }
`

export const GET_V3_PAIRS_QUERY = gql`
  query v3Pairs($from: Int!) {
    pools {
      id
      feeTier
      totalValueLockedUSD
      volumeUSD
      token0Price

      token0 {
        name
        symbol
        id
        derivedETH
      }

      token1 {
        name
        symbol
        id
        derivedETH
      }

      poolDayData(orderBy: date, orderDirection: desc, first: 365, where: { date_gte: $from }) {
        id
        date
        volumeUSD
        tvlUSD
        token0Price
      }
    }
  }
`

export const POOLS_CHART_QUERY = gql`
  query pools {
    pools {
      id
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
      feeTier
      poolDayData(orderBy: date, orderDirection: asc, first: 365) {
        date
        volumeUSD
        tvlUSD
      }
    }
  }
`

export const TOP_PAIRS_QUERY = gql`
  query topPairs($blockNumber: Int!) {
    poolsNow: pools {
      id

      token0 {
        id
        symbol
      }

      token1 {
        id
        symbol
      }

      feeTier
      totalValueLockedUSD
      volumeUSD
    }

    poolsPast: pools(block: { number: $blockNumber }) {
      id

      token0 {
        id
        symbol
      }

      token1 {
        id
        symbol
      }

      feeTier
      totalValueLockedUSD
      volumeUSD
    }
  }
`

export const GET_PAIR_DAY_DATAS_QUERY = gql`
  query pairs($from: Int!, $pairAddress: String!) {
    pairDayDatas(orderBy: date, orderDirection: desc, where: { date_gte: $from, pairAddress: $pairAddress }) {
      id
      date
      dailyVolumeUSD
      reserveUSD
      pairAddress
      token0 {
        id
        symbol
        name
        derivedETH
      }
      token1 {
        id
        symbol
        name
        derivedETH
      }
    }
  }
`

const POPULAR_TOKENS_SWAP_LIST = gql`
  query popularTokens {
    tokens(where: { totalValueLockedUSD_gt: 1000 }, orderBy: volumeUSD, first: 10) {
      id
      name
      volumeUSD
    }
  }
`

const GET_VOLTAGE_V3_FACTORY_DATA = gql`
{
  factory(id: "${FACTORY_V3_ADDRESS}") {
    id
    txCount
    poolCount
    totalVolumeUSD
  }
}
`

export const getVoltageV3Tokens = async (numberOfDays, token) => {
  const now = moment().utc()

  const response = await voltageSubgraphV3Client.query({
    query: GET_VOLTAGE_V3_TOKENS,
    variables: {
      from: now.clone().subtract(numberOfDays, 'day').unix(),
      first: numberOfDays,
      tokenAddress: token.address.toLowerCase(),
    },
  })

  return response?.data?.tokens
}

export const getVoltageV3Pools = async (numberOfDays, token0, token1, fee) => {
  const now = moment().utc()

  const token0Address = token0.address < token1.address ? token0.address : token1.address
  const token1Address = token0.address < token1.address ? token1.address : token0.address

  const response = await voltageSubgraphV3Client.query({
    query: GET_VOLTAGE_V3_POOLS,
    variables: {
      from: now.clone().subtract(numberOfDays, 'day').unix(),
      first: numberOfDays,
      token0: token0Address.toLocaleLowerCase(),
      token1: token1Address.toLocaleLowerCase(),
      fee: fee.toString(),
    },
  })

  return response?.data?.pools
}

export const getVoltageV3PoolsPoolPage = async (from) => {
  const response = await voltageSubgraphV3Client.query({
    query: GET_VOLTAGE_V3_POOLS_POOL_PAGE,
    variables: {
      from,
    },
  })

  return response?.data?.pools
}

export const getVoltageV3PopularTokensSwapList = async () => {
  const response = await voltageSubgraphV3Client.query({
    query: POPULAR_TOKENS_SWAP_LIST,
  })

  return response?.data?.tokens
}

export const getVoltageV3FactoryData = async () => {
  const result = await voltageSubgraphV3Client.query({
    query: GET_VOLTAGE_V3_FACTORY_DATA,
  })

  return result?.data?.factory
}
