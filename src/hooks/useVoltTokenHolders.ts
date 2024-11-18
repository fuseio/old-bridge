import { useCallback, useEffect, useState } from 'react'
import { clientVoltTokenHolders } from '../graphql/client'
import { GET_VOLT_TOKEN_HOLDERS_AMOUNT } from '../graphql/queries'

export const useVoltTokenHolders = () => {
  const [voltTokenHolders, setVoltTokenHolders] = useState(null)

  const queryVoltTokenHolders = useCallback(async () => {
    const tokenHolders = await clientVoltTokenHolders.query({
      query: GET_VOLT_TOKEN_HOLDERS_AMOUNT,
    })
    setVoltTokenHolders(tokenHolders.data?.systemInfos[0]?.userCount)
  }, [])

  useEffect(() => {
    queryVoltTokenHolders()
  }, [queryVoltTokenHolders])

  return voltTokenHolders
}
