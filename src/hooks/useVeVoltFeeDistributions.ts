import { clientVeVoltStakeHolders } from '../graphql/client'
import { GET_VEVOLT_FEE_DISTRIBUTIONS } from '../graphql/queries'
import { useMemo } from 'react'
import useSWR from 'swr'

async function getFeeDistributions(numberOfDistributions: number) {
  const result = await clientVeVoltStakeHolders.query({
    query: GET_VEVOLT_FEE_DISTRIBUTIONS,
    variables: {
      distributions: numberOfDistributions,
    },
  })

  return result.data && result.data
}

export function useVeVoltFeeDistributions(distributions: number) {
  const { data } = useSWR('vevoltFeeDistributions', () => getFeeDistributions(distributions))

  return useMemo(() => {
    if (!data) return 0
    return data.servingDayDatas.reduce((result, element) => result + Number(element.voltServed), 0)
  }, [data])
}
