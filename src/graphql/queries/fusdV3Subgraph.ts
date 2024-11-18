import { gql } from '@apollo/client'

import { fusdClientV3 } from '../client'

const GET_DAY_DATAS = gql`
  query ($first: Int!) {
    dayDatas(orderBy: timestamp, orderDirection: desc, first: $first) {
      timestamp
      balanceUSD
      volumeUSD
    }
  }
`

export const getFusdV3DayDatas = async (numberOfElements) => {
  const response = await fusdClientV3.query({
    query: GET_DAY_DATAS,
    variables: {
      first: numberOfElements,
    },
  })

  return response?.data?.dayDatas
}
