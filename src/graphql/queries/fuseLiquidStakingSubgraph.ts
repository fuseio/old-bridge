import moment from 'moment'
import { gql } from '@apollo/client'

import { fuseLiquidStakingClient } from '../client'

const GET_DAY_DATAS = gql`
  query ($from: Int!, $first: Int!) {
    dayDatas(orderBy: timestamp, orderDirection: desc, first: $first, where: { timestamp_gte: $from }) {
      timestamp
      balanceUSD
      volumeUSD
      priceUSD
    }
  }
`

export const getFuseLiquidStakingDayDatas = async (numberOfDays) => {
  const now = moment().utc()

  const response = await fuseLiquidStakingClient.query({
    query: GET_DAY_DATAS,
    variables: {
      from: now.clone().subtract(numberOfDays, 'day').unix(),
      first: numberOfDays,
    },
  })

  return response?.data?.dayDatas
}
