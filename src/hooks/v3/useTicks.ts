import { useCallback, useEffect, useState } from 'react'
import { voltageSubgraphV3Client } from '../../graphql/client'
import { gql } from '@apollo/client'

export const useTicks = (poolAddress: string) => {
  const [data, setData] = useState([])
  const fetchTicks = useCallback(async () => {
    const { data } = await voltageSubgraphV3Client.query({
      query: gql`
        query allPoolTicks($poolAddress: String!) {
          ticks(where: { poolAddress: $poolAddress }) {
            id
          }
        }
      `,
      variables: {
        poolAddress: poolAddress.toLowerCase(),
      },
    })
    setData(data?.ticks)
  }, [poolAddress])
  useEffect(() => {
    fetchTicks()
  }, [fetchTicks])
  return data
}
