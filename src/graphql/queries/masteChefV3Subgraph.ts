import { gql } from '@apollo/client'

import { masterChefV3Client } from '../client'

const GET_MASTERCHEFV3_FARMS = gql`
  query poolsV2Query(
    $first: Int! = 1000
    $skip: Int! = 0
    $orderBy: String! = "id"
    $orderDirection: String! = "desc"
  ) {
    pools(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      pair
      allocPoint
      flpBalance
      owner {
        id
        totalAllocPoint
      }
      rewarder {
        id
        rewardToken
        tokenPerSec
      }
    }
  }
`

const GET_MASTERCHEFV3_APY = gql`
  query poolsV2Query($pid: Int!, $orderBy: String! = "id", $orderDirection: String! = "desc") {
    pools(where: { id: $pid }) {
      balance
      rewarder {
        tokenPerSec
      }
    }
  }
`

export const getMasterChefV3Farms = async () => {
  const { data } = await masterChefV3Client.query({
    query: GET_MASTERCHEFV3_FARMS,
    fetchPolicy: 'no-cache',
  })

  masterChefV3Client.cache.writeQuery({ query: GET_MASTERCHEFV3_FARMS, data })

  return data.pools || []
}

export const getMasterChefV3Apy = async (pid) => {
  const { data } = await masterChefV3Client.query({
    query: GET_MASTERCHEFV3_APY,
    variables: {
      pid: pid,
    },
  })

  return data?.pools
}
