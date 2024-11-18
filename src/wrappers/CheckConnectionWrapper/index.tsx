import { useSelector } from 'react-redux'
import { Button } from 'rebass/styled-components'

import { useWeb3 } from '../../hooks'
import useAddChain from '../../hooks/useAddChain'
import ConnectWallet from '../../components/ConnectWallet'
import { ChainId, FUSE_CHAIN } from '../../constants/chains'

export const CheckConnectionWrapper = ({ children }: { children: any }) => {
  const { addChain } = useAddChain()
  const { chainId, account } = useWeb3()
  const application = useSelector((state: any) => state?.application)

  if (!account) {
    return <ConnectWallet />
  }

  if (application?.connected === 'ERROR') {
    return (
      <Button width={'100%'} variant="error">
        Failed to Load: Check Network
      </Button>
    )
  }

  if (account && chainId !== ChainId.FUSE && chainId !== ChainId.SPARK) {
    return (
      <Button
        onClick={() => {
          addChain(FUSE_CHAIN)
        }}
      >
        Switch to Fuse
      </Button>
    )
  }
  return children
}
