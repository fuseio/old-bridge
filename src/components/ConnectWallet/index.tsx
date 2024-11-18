import { useCallback } from 'react'
import { Button } from 'rebass/styled-components'

import { useWeb3 } from '../../hooks'
import { useWalletModalToggle } from '../../state/application/hooks'

export default function ConnectWallet({ ...props }: { fontSize?: number; bg?: string }) {
  const toggleWalletModal = useWalletModalToggle()
  const { connectWallet } = useWeb3()

  const toggle = useCallback(async () => {
    await connectWallet()
  }, [toggleWalletModal])

  return (
    <Button bg="secondary" {...props} onClick={toggle} data-testid="connect-wallet">
      Connect
    </Button>
  )
}
