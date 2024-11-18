import moment from 'moment'
import { gql } from '@apollo/client'

import { voltageSubgraphV2Client } from '../client'

const GET_VOLTAGE_V2_TOKENS = gql`
  query ($from: Int!, $first: Int!, $id: String!) {
    tokens(where: { id: $id, liquidity_gt: 0 }) {
      id
      liquidity
      dayData(orderBy: date, orderDirection: desc, first: $first, where: { date_gte: $from }) {
        date
        priceUSD
      }
    }
  }
`

const GET_VOLTAGE_V2_PAIRS = gql`
  query ($from: Int!, $first: Int!, $token0: Bytes!, $token1: Bytes!) {
    pairs(where: { token0: $token0, token1: $token1, reserveUSD_gt: 0 }) {
      token0 {
        id
      }
      reserveUSD
      dayData(orderBy: date, orderDirection: desc, first: $first, where: { date_gte: $from }) {
        date
        reserve0
        reserve1
      }
    }
  }
`

const GET_VOLTAGE_V2_PAIRS_POOL_PAGE = gql`
  query pairs($from: Int!) {
    pairs(orderDirection: desc, where: { reserveUSD_gt: 1000, txCount_gt: 150 }) {
      id
      reserveUSD
      dayData(where: { date_gte: $from }) {
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

export const getVoltageV2Tokens = async (numberOfDays, token) => {
  const now = moment().utc()

  const response = await voltageSubgraphV2Client.query({
    query: GET_VOLTAGE_V2_TOKENS,
    variables: {
      from: now.clone().subtract(numberOfDays, 'day').unix(),
      first: numberOfDays,
      id: token.address.toLowerCase(),
    },
  })

  return response?.data?.tokens
}

export const getVoltageV2Pairs = async (numberOfDays, token0, token1) => {
  const now = moment().utc()

  const token0Address = token0.address < token1.address ? token0.address : token1.address
  const token1Address = token0.address < token1.address ? token1.address : token0.address

  const response = await voltageSubgraphV2Client.query({
    query: GET_VOLTAGE_V2_PAIRS,
    variables: {
      from: now.clone().subtract(numberOfDays, 'day').unix(),
      first: numberOfDays,
      token0: token0Address.toLocaleLowerCase(),
      token1: token1Address.toLocaleLowerCase(),
    },
  })

  return response?.data?.pairs
}

export const getVoltageV2PairsPoolPage = async (from) => {
  const response = await voltageSubgraphV2Client.query({
    query: GET_VOLTAGE_V2_PAIRS_POOL_PAGE,
    variables: {
      from,
    },
  })

  return response?.data?.pairs
}
