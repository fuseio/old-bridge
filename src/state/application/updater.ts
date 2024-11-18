import { useDispatch } from 'react-redux'
import { useCallback, useEffect, useState } from 'react'

import { useWeb3 } from '../../hooks'
import { useAllTransactions } from '../transactions/hooks'
import useIsWindowVisible from '../../hooks/useIsWindowVisible'
import { setConnectedStatus, updateBlockNumber } from './actions'

export default function Updater(): null {
  const dispatch = useDispatch()
  const { library, chainId } = useWeb3()
  const allTransactions = useAllTransactions()

  const windowVisible = useIsWindowVisible()

  const [state, setState] = useState<{ chainId: number | undefined; blockNumber: number | null }>({
    chainId,
    blockNumber: null,
  })

  const blockNumberCallback = useCallback(
    async (blockNumber: number) => {
      setState((state) => {
        if (chainId === state.chainId) {
          if (typeof state.blockNumber !== 'number')
            return {
              chainId,
              blockNumber,
            }
          return {
            chainId,
            blockNumber: Math.max(blockNumber, state.blockNumber),
          }
        }
        return state
      })
    },
    [chainId, setState]
  )

  // attach/detach listeners
  useEffect(() => {
    if (!library || !chainId || !windowVisible) {
      return undefined
    }

    setState({ chainId, blockNumber: null })

    library
      .getBlockNumber()
      .then(async (blockNumber) => {
        dispatch(setConnectedStatus({ connected: 'CONNECTED' }))
        blockNumberCallback(blockNumber)
      })
      .catch((error: any) => {
        dispatch(setConnectedStatus({ connected: 'ERROR' }))
        console.error(`Failed to get block number for chainId: ${chainId}`, error)
      })

    library.on('block', blockNumberCallback)

    return () => {
      library.removeListener('block', blockNumberCallback)
    }
  }, [dispatch, chainId, library, blockNumberCallback, windowVisible])

  useEffect(() => {
    if (!state.chainId || !state.blockNumber || !windowVisible) {
      return
    }

    const chainId = state.chainId
    const blockNumber = state.blockNumber

    dispatch(updateBlockNumber({ chainId, blockNumber }))
  }, [allTransactions, windowVisible, dispatch, state.chainId, state.blockNumber])

  return null
}
