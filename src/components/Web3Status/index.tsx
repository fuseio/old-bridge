import { useRef } from 'react'
import { Box, Button, Flex } from 'rebass/styled-components'

import { useWeb3 } from '../../hooks'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { CustomAccountCenter } from '../../wrappers/CustomAccountCenter'

export default function Web3Status() {
  const { wallet, connectWallet, disconnectWallet } = useWeb3()

  const ref = useRef()
  useOnClickOutside(ref, () => {
    //setCodeOpen(false)
  })

  return (
    <>
      <CustomAccountCenter />

      {!wallet && (
        <Flex sx={{ gap: 2, zIndex: 10 }}>
          <Box sx={{ position: 'relative', zIndex: 4 }}>
            <Button
              id="connect-wallet"
              bg="secondary"
              color="white"
              fontSize={0}
              fontWeight={700}
              minHeight={30}
              width={120}
              onClick={() => (wallet ? disconnectWallet(wallet) : connectWallet())}
            >
              Connect
            </Button>
          </Box>
        </Flex>
      )}
    </>
  )
}
