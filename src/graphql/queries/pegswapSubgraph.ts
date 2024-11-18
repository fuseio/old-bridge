import { gql } from '@apollo/client'
import { pegswapClient } from '../client'

const GET_TOKENS_AND_DAY_DATAS = gql`
  query ($first: Int!) {
    tokens {
      id
      name
      dayData(orderBy: timestamp, first: $first, orderDirection: desc) {
        balanceUSD
        volumeUSD
        priceUSD
        timestamp
      }
    }
  }
`

export const getPegswapTokensAndDayDatas = async (numberOfDays) => {
  const response = await pegswapClient.query({
    query: GET_TOKENS_AND_DAY_DATAS,
    variables: { first: numberOfDays },
  })

  return response?.data?.tokens
}
