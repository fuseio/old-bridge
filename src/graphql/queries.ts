import { ApolloClient, gql } from '@apollo/client/core'

import { getTokenPriceV3 } from '../hooks/useUSDPrice'
import {
  sFUSE,
  FUSD,
  FUSE_BUSD,
  FUSE_USDC,
  FUSE_USDT,
  VOLT_ADDRESS,
  XVOLT_ADDRESS,
} from '../constants'
import {
  fusdClient,
  blockClient,
  fusdClientV3,
  voltBarClient,
  masterChefV3Client,
  voltageSubgraphClient,
  fuseswapSubgraphClient,
  fuseEthAmbSubgraphClient,
  ethFuseAmbSubgraphClient,
  stableswapSubgraphClient,
  ethFuseNativeSubgraphClient,
  fuseEthNativeSubgraphClient,
  voltageSubgraphV2Client,
} from './client'

interface Variables {
  [key: string]: any
}

export const getMessageFromTxHash = async (txHash: string | undefined, subgraph: ApolloClient<any> | null) => {
  if (!subgraph || !txHash) return null

  const result = await subgraph.query({
    query: gql`
      {
        userRequestForSignatures(where: { txHash_contains: "${txHash}" }, first: 1) {
          recipient
          message {
            msgId
            msgData
            signatures
          }
        }
      }
    `,
    fetchPolicy: 'no-cache',
  })

  return result.data &&
    result.data.userRequestForSignatures &&
    result.data.userRequestForSignatures.length > 0 &&
    result.data.userRequestForSignatures[0].message
    ? {
        ...result.data.userRequestForSignatures[0].message,
        ...result.data.userRequestForSignatures[0],
      }
    : null
}

export const getUserRequests = async (account: string | undefined) => {
  if (!account) return []

  const result = await fuseEthAmbSubgraphClient.query({
    query: gql`
      {
        userRequestForSignatures(first: 15, where: { recipient_contains: "${account}" }, orderBy: timestamp, orderDirection: desc) {
          id
          message {
            msgId
            msgData
            signatures
          }
          timestamp
        }
      }
    `,
    fetchPolicy: 'no-cache',
  })

  return result.data && result.data.userRequestForSignatures && result.data.userRequestForSignatures.length > 0
    ? result.data.userRequestForSignatures
    : []
}

export const getNativeUserRequests = async (account: string | undefined) => {
  if (!account) return []

  const result = await fuseEthNativeSubgraphClient.query({
    query: gql`
      {
        userRequestForSignatures(first: 15, where: { recipient_contains: "${account}" }, orderBy: timestamp, orderDirection: desc) {
          id
          recipient
          value
          txHash
          timestamp
          signatures
          message
        }
      }
    `,
    fetchPolicy: 'no-cache',
  })

  return result.data && result.data.userRequestForSignatures && result.data.userRequestForSignatures.length > 0
    ? result.data.userRequestForSignatures
    : []
}

export const getUserRelayedMessages = async (messageIds: Array<string>) => {
  if (!(messageIds.length > 0)) return []

  const result = await ethFuseAmbSubgraphClient.query({
    query: gql`
      {
        relayedMessages(where: { messageId_in: [${messageIds.map((id) => `"${id}"`).join()}] }) {
          id
          status
          messageId
        }
      }
    `,
    fetchPolicy: 'no-cache',
  })

  return result.data && result.data.relayedMessages && result.data.relayedMessages.length > 0
    ? result.data.relayedMessages
    : []
}

export const getNativeUserRelayedMessages = async (homeTxHashes: Array<string>) => {
  if (!(homeTxHashes.length > 0)) return []

  const result = await ethFuseNativeSubgraphClient.query({
    query: gql`
      {
        relayedMessages(where: { homeTxHash_in: [${homeTxHashes.map((hash) => `"${hash}"`).join()}] }) {
          id
          recipient
          value
          homeTxHash
        }
      }
    `,
    fetchPolicy: 'no-cache',
  })

  return result.data && result.data.relayedMessages && result.data.relayedMessages.length > 0
    ? result.data.relayedMessages
    : []
}

export const getUserRequestFromTxHash = async (txHash: string | undefined, subgraph: ApolloClient<any> | null) => {
  if (!subgraph || !txHash) return null

  const result = await subgraph.query({
    query: gql`
      {
        userRequestForSignatures(where: { txHash_contains: "${txHash}" }, first: 1) {
          message
          signatures
        }
      }
    `,
    fetchPolicy: 'no-cache',
  })

  return result.data &&
    result.data.userRequestForSignatures &&
    result.data.userRequestForSignatures.length > 0 &&
    result.data.userRequestForSignatures[0].signatures
    ? {
        ...result.data.userRequestForSignatures[0],
      }
    : null
}

export const getStatusFromTxHash = async (messageId: string, subgraph: ApolloClient<any> | null) => {
  if (!subgraph) return null

  const result = await subgraph.query({
    query: gql`
      {
        relayedMessages(where: { messageId_contains: "${messageId}" }, first: 1) {
          id
        }
      }
    `,
    fetchPolicy: 'no-cache',
  })

  return result.data && result.data.relayedMessages && result.data.relayedMessages.length > 0
    ? result.data.relayedMessages[0]
    : null
}

export const getNativeStatusFromTxHash = async (homeTxHash: string, subgraph: ApolloClient<any> | null) => {
  if (!subgraph) return null

  const result = await subgraph.query({
    query: gql`
      {
        relayedMessages(where: { homeTxHash_contains: "${homeTxHash}" }, first: 1) {
          id
        }
      }
    `,
    fetchPolicy: 'no-cache',
  })

  return result.data && result.data.relayedMessages && result.data.relayedMessages.length > 0
    ? result.data.relayedMessages[0]
    : null
}

export const tokenPriceQuery = gql`
  query tokenPriceQuery($id: String!) {
    token(id: $id) {
      id
      derivedETH
    }
  }
`

const bundleFields = gql`
  fragment bundleFields on Bundle {
    id
    ethPrice
  }
`

const fusePriceQuery = gql`
  query ethPriceQuery($id: Int! = 1, $block: Block_height) {
    bundles(id: $id, block: $block) {
      ...bundleFields
    }
  }

  ${bundleFields}
`

const stableswapTokenBalancesQuery = gql`
  {
    swaps {
      id
      balances
      tokens {
        id
      }
    }
  }
`

const voltBarStatsQuery = gql`
  query tokenPriceQuery($start: String!, $length: Int!) {
    bars(first: 1) {
      id
      ratio
      totalSupply
      usersCnt
    }
    histories(first: $length, orderDirection: asc, orderBy: id, where: { id_gte: $start }) {
      id
      ratio
    }
    voltBalanceHistories(first: $length, orderDirection: asc, orderBy: id, where: { id_gte: $start }) {
      id
      balance
      balanceUSD
      totalVoltStaked
    }
  }
`

export const getVoltBarStats = async (variables: any) => {
  const result = await voltBarClient.query({ query: voltBarStatsQuery, variables })
  return result.data
}

export const getStableswapTokenBalances = async (query = stableswapTokenBalancesQuery) => {
  const result = await stableswapSubgraphClient.query({ query })

  return result.data?.swaps
}

export const getBundle = async (query = fusePriceQuery, variables = { id: 1 }) => {
  const result = await voltageSubgraphV2Client.query({
    query,
    variables,
  })

  return result.data?.bundles ? result.data?.bundles[0]?.ethPrice : null
}

export const getNativePrice = async (variables?: any) => {
  const result = await getBundle(undefined, variables)
  return result
}

export const getTokenPrice = async (query: any, variables: Variables) => {
  const nativePrice = await getNativePrice()

  const result = await voltageSubgraphClient.query({
    query,
    variables,
  })

  return nativePrice && result.data?.token ? result.data?.token?.derivedETH * nativePrice : 0
}

export const getVoltPrice = async () => {
  return getTokenPrice(tokenPriceQuery, {
    id: VOLT_ADDRESS.toLowerCase(),
  })
}

export const getSFusePrice = async () => {
  return getTokenPriceV3(sFUSE.address.toLowerCase())
}

export const getXVoltPrice = async () => {
  return getTokenPrice(tokenPriceQuery, {
    id: XVOLT_ADDRESS,
  })
}

export const getFusePrice = async (variables?: Variables) => {
  return getNativePrice(variables)
}

export const getMasterChefV3Pool = async (pid: string) => {
  const result = await masterChefV3Client.query({
    query: gql`
    {
      pool(id: "${pid}") {
        id
        balance
        pair
        allocPoint
        owner {
          id
          voltPerSec
          totalAllocPoint
        }
        rewarder {
          rewardToken
          tokenPerSec
        }
      }
    }
  `,
  })

  return result?.data?.pool ? result?.data?.pool : null
}

export const getMasterChefV3PoolAndUser = async (pid: string, userAddress?: string) => {
  if (userAddress) {
    const result = await masterChefV3Client.query<{
      users: Array<{
        amount: string
      }>
      pool: {
        balance: string
        pair: string
        rewarder: {
          rewardToken: string
          tokenPerSec: string
        }
      }
    }>({
      query: gql`
        query getChefPool($id: String!, $userAddress: Bytes!) {
          users(where: { pool: $id, address: $userAddress }) {
            amount
          }
          pool(id: $id) {
            balance
            pair
            rewarder {
              rewardToken
              tokenPerSec
            }
          }
        }
      `,
      variables: {
        id: pid,
        userAddress,
      },
      fetchPolicy: 'no-cache',
    })

    return { user: result.data?.users?.[0] ?? null, pool: result.data?.pool ?? null }
  } else {
    const result = await masterChefV3Client.query<any, any>({
      query: gql`
        query getChefPool($id: String!) {
          pool(id: $id) {
            balance
            pair
            rewarder {
              rewardToken
              tokenPerSec
            }
          }
        }
      `,
      variables: {
        id: pid,
      },
      fetchPolicy: 'no-cache',
    })

    return { user: null, pool: result.data?.pool ?? null }
  }
}

export const getBlock = async (variables?: any) => {
  const result = await blockClient.query({
    query: gql`
      query blockQuery($timestampFrom: Int, $timestampTo: Int) {
        blocks(
          first: 1
          where: { timestamp_gt: $timestampFrom, timestamp_lt: $timestampTo }
          orderBy: timestamp
          orderDirection: desc
        ) {
          id
          number
          timestamp
        }
      }
    `,
    variables,
  })
  return { number: Number(result?.data?.blocks?.[0]?.number) }
}

export const getFactory = async (variables: any) => {
  const query = variables
    ? gql`
        {
          uniswapFactories(first: 1, block: { number: ${variables.blockNumber} }) {
            id
            totalVolumeUSD
            totalLiquidityUSD
          }
        }
      `
    : gql`
        {
          uniswapFactories(first: 1) {
            id
            totalVolumeUSD
            totalLiquidityUSD
          }
        }
      `

  const result = await voltageSubgraphClient.query({
    query,
    fetchPolicy: 'no-cache',
  })

  return result?.data?.uniswapFactories ? result?.data?.uniswapFactories?.[0] : null
}

export const getFuseswapLiquidityPositions = async (variables: any) => {
  const result = await fuseswapSubgraphClient.query({
    query: gql`
      {
      liquidityPositions(where: { user_contains: "${variables.account.toLowerCase()}" }) {
          pair {
            id
            token0 {
              id
              name
              symbol
            }
            token1 {
              id
              name
              symbol
            }
          }
          liquidityTokenBalance
        }
      }
    `,
  })

  return result?.data?.liquidityPositions
}

export const getDayDatas = async (variables?: any) => {
  if (!variables.days) return []

  const result = await voltageSubgraphClient.query({
    query: gql`
      {
        uniswapDayDatas(orderBy: date, first: ${variables.days}, orderDirection: desc) {
          dailyVolumeUSD
          date
        }
      }
    `,
  })

  return result?.data?.uniswapDayDatas
}

export const getLPTokensByVolume = async () => {
  const result = await voltageSubgraphClient.query({
    query: gql`
      {
        pairs(first: 10, orderBy: volumeUSD, orderDirection: desc) {
          id
          volumeToken0
          volumeToken1
          totalSupply
          volumeUSD
          reserve0
          reserve1
          token0 {
            address: id
            name
            symbol
            decimals
          }
          token1 {
            address: id
            name
            symbol
            decimals
          }
        }
      }
    `,
  })

  return result.data.pairs
}

export const getLPPrice = async (variables: any) => {
  if (!variables?.lpAddress) return

  const result = await voltageSubgraphClient.query({
    query: gql`
      {
        pair(id: "${variables?.lpAddress?.toLowerCase()}") {
          reserveUSD
          totalSupply
        }
      }
    `,
  })

  return result.data?.pair?.reserveUSD / result.data?.pair?.totalSupply
}

export const getFusdLiquidityV3 = async () => {
  const result = await fusdClientV3.query({
    query: gql`
      {
        fusd: masset(id: "0xce86a1cf3cff48139598de6bf9b1df2e0f79f86f") {
          totalSupply {
            simple
          }
        }

        usdc: basset(id: "0x28c3d1cd466ba22f6cae51b1a4692a831696391a") {
          vaultBalance {
            simple
          }
        }
        usdt: basset(id: "0x68c9736781e9316ebf5c3d49fe0c1f45d2d104cd") {
          vaultBalance {
            simple
          }
        }
      }
    `,
  })

  return {
    totalLiquidity: result.data?.fusd?.totalSupply?.simple,
    usdcLiquidity: result.data?.usdc?.vaultBalance?.simple,
    usdtLiquidity: result.data?.usdt?.vaultBalance?.simple,
    busdLiquidity: undefined,
  }
}

export const getFusdLiquidity = async () => {
  const result = await fusdClient.query({
    query: gql`
      {   
        fusd: masset(id: "${FUSD.address.toLowerCase()}") {
          totalSupply {
            simple
          }
        }
        busd: basset(id: "${FUSE_BUSD.address.toLowerCase()}") {
          vaultBalance {
            simple
          }
        }
        usdc: basset(id: "${FUSE_USDC.address.toLowerCase()}") {
          vaultBalance {
            simple
          }
        }
        usdt: basset(id: "${FUSE_USDT.address.toLowerCase()}") {
          vaultBalance {
            simple
          }
        }
      }
    `,
  })

  return {
    totalLiquidity: result.data?.fusd?.totalSupply?.simple,
    busdLiquidity: result.data?.busd?.vaultBalance?.simple,
    usdcLiquidity: result.data?.usdc?.vaultBalance?.simple,
    usdtLiquidity: result.data?.usdt?.vaultBalance?.simple,
  }
}

export const USER_PAIR_LIQUIDITY = gql`
  query userLiquidityPositions($id: String!) {
    user(id: $id) {
      liquidityPositions(where: { liquidityTokenBalance_gt: 0 }) {
        id

        liquidityTokenBalance
        pair {
          id
          totalSupply
          name
          reserve0
          reserve1
          reserveUSD
          volumeUSD
          token0 {
            id
            symbol
            name
            decimals
          }
          token1 {
            id
            symbol
            name
            decimals
          }
        }
      }
    }
  }
`

export const USER_V3_POOL_POSITIONS = gql`
  query userV3Positions($id: String!) {
    positions(where: { owner_contains: $id, liquidity_gt: "0" }) {
      id
      token0 {
        id
        name
        symbol
        decimals
      }
      token1 {
        id
        name
        symbol
        decimals
      }
      liquidity
      pool {
        liquidity
        feeTier
        id
        tick
      }
      tickLower {
        tickIdx
      }
      tickUpper {
        tickIdx
      }
    }
  }
`

export const GET_VEVOLT_FEE_DISTRIBUTIONS = gql`
  query getVeVoltFeeDistributions($distributions: Int) {
    servingDayDatas(first: $distributions, orderBy: date, orderDirection: desc) {
      id
      voltServed
      voltServedUSD
    }
  }
`

export const GET_VOLT_TOKEN_HOLDERS_AMOUNT = gql`
  {
    systemInfos(first: 5) {
      id
      userCount
    }
  }
`
