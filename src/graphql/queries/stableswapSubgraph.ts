import { gql } from '@apollo/client'
import { stableswapSubgraphClient } from '../client'

const GET_WEEKLY_DATAS = gql`
  query ($first: Int!) {
    weeklyVolumes(orderBy: timestamp, orderDirection: desc, first: $first) {
      volume
    }
  }
`

export const getStableswapDayDatas = async (numberOfElements) => {
  const response = await stableswapSubgraphClient.query({
    query: GET_WEEKLY_DATAS,
    variables: {
      first: numberOfElements,
    },
  })

  return response?.data?.weeklyVolumes
}
