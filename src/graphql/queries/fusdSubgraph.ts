import { gql } from '@apollo/client'

import { fusdClient } from '../client'

export const GET_FUSD_TVL_QUERY = gql`
  query ($from: Int!, $first: Int!) {
    dayDatas(orderBy: date, orderDirection: desc, first: $first, where: { date_gte: $from }) {
      timestamp
      balance
      volume
      balanceUSD
      volumeUSD
      priceUSD
    }
  }
`

const GET_DAY_DATAS = gql`
  query ($first: Int!) {
    dayDatas(orderBy: timestamp, orderDirection: desc, first: $first) {
      timestamp
      balanceUSD
      volumeUSD
    }
  }
`

export const getFusdDayDatas = async (numberOfElements) => {
  const response = await fusdClient.query({
    query: GET_DAY_DATAS,
    variables: {
      first: numberOfElements,
    },
  })

  return response?.data?.dayDatas
}
