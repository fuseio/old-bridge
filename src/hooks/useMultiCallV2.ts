import { BigNumber } from 'ethers'
import { flattenDeep } from 'lodash'
import { useMemo, useState } from 'react'
import { ContractCallResults, Multicall } from 'ethereum-multicall'

import { useWeb3 } from '.'
import { fuseReadProvider } from '../connectors'

export const useMultiCallV2 = (calls: any, options?: any, reload?: Array<any>) => {
  reload = reload || []
  const [data, setData] = useState([])
  const { account, chainId } = useWeb3()
  const multicall = new Multicall({
    ethersProvider: fuseReadProvider,
    tryAggregate: true,
    ...options,
  })

  useMemo(() => {
    ;(async () => {
      const { results }: ContractCallResults = await multicall.call(calls)
      const resData = Object.keys(results).map((key) => {
        return results[key].callsReturnContext.map(({ reference, success, returnValues, ...props }) => ({
          reference,
          success,
          ...props,
          result: returnValues.map((value) => {
            if (value?.type === 'BigNumber') {
              return BigNumber.from(value?.hex)
            }
            return value
          }),
        }))
      })
      setData(flattenDeep(resData))
    })()
  }, [account, chainId, ...reload])
  return data
}
