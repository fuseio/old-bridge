import moment from 'moment'
import { gql } from '@apollo/client'
import { Pair } from '@voltage-finance/sdk'

import { voltageSubgraphClient } from '../client'
import { FACTORY_ADDRESS, FUSE_GRAPH_TOKEN } from '../../constants'

const GET_VOLTAGE_V2_PAIR_DAY_DATAS = gql`
  query ($from: Int!, $first: Int!, $id: Bytes!) {
    pairDayDatas(
      orderBy: date
      orderDirection: desc
      first: $first
      where: { pairAddress: $id, date_gte: $from, reserve0_gt: 1, reserve1_gt: 1 }
    ) {
      token0 {
        id
      }
      token1 {
        id
      }
      date
      reserve0
      reserve1
      pairAddress
    }
  }
`

const GET_VOLTAGE_V2_TOKENS = gql`
  query ($from: Int!, $first: Int!, $id: String!) {
    tokens(orderDirection: desc, where: { id: $id }) {
      id
      totalLiquidity
      tokenDayData(
        orderBy: date
        orderDirection: desc
        first: $first
        where: { date_gte: $from, totalLiquidityUSD_gt: 0 }
      ) {
        date
        priceUSD
      }
    }
  }
`

export const GET_VOLTAGE_TOKENS_BY_TXCOUNT = gql`
  query ($from: Int!, $first: Int!) {
    tokens(orderBy: txCount, orderDirection: desc) {
      name
      id
      symbol
      totalSupply
      totalLiquidity
      derivedETH
      tradeVolumeUSD
      tokenDayData(
        orderBy: date
        orderDirection: desc
        first: $first
        where: { date_gte: $from, totalLiquidityUSD_gte: 2000 }
      ) {
        dailyVolumeUSD
        totalLiquidityUSD
        date
        priceUSD
      }
    }
  }
`

const GET_VOLTAGE_FACTORY_DATA = gql`
{
  uniswapFactory(id: "${FACTORY_ADDRESS.toLowerCase()}") {
    pairCount
    totalVolumeUSD
    totalLiquidityUSD
  }
}
`

export const getVoltagePairDayDatas = async (numberOfDays, token0, token1) => {
  const now = moment().utc()

  const response = await voltageSubgraphClient.query({
    query: GET_VOLTAGE_V2_PAIR_DAY_DATAS,
    variables: {
      from: now.clone().subtract(numberOfDays, 'day').unix(),
      first: numberOfDays,

      // TODO: check if it makes sense always using FUSE token (other FUSE tokens might exist)
      id: Pair.getAddress(
        token0?.symbol === 'FUSE' ? FUSE_GRAPH_TOKEN : token0,
        token1?.symbol === 'FUSE' ? FUSE_GRAPH_TOKEN : token1
      ),
    },
  })

  return response?.data?.pairDayDatas
}

export const getVoltageTokens = async (numberOfDays, token) => {
  const now = moment().utc()

  const response = await voltageSubgraphClient.query({
    query: GET_VOLTAGE_V2_TOKENS,
    variables: {
      from: now.clone().subtract(numberOfDays, 'day').unix(),
      first: numberOfDays,
      // TODO: check if it makes sense always using FUSE token (other FUSE tokens might exist)
      id: token?.symbol === 'FUSE' ? FUSE_GRAPH_TOKEN.address.toLowerCase() : token?.address?.toLowerCase(),
    },
  })

  return response?.data?.tokens
}

export const getVoltageFactoryData = async () => {
  const result = await voltageSubgraphClient.query({
    query: GET_VOLTAGE_FACTORY_DATA,
  })

  return result?.data?.uniswapFactory
}
