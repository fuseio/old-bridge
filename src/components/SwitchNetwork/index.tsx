import { useEffect, useState } from 'react'
import { Flex, Text, Button } from 'rebass/styled-components'

import Logo from '../Logo'
import Modal from '../Modal'
import { useWeb3 } from '../../hooks'
import Card from '../../collections/Card'
import useAddChain from '../../hooks/useAddChain'
import { CHAIN_MAP, ChainId } from '../../constants/chains'

import SwitchNetworkFuseLogo from '../../assets/svg/fuse-logos/switch-network.svg'

/**
 * This is necessary because the modal needs a "onDismiss" and "onClose" function
 */
const emptyFunction = () => {
  // eslint no empty function warning fix
}

function SwitchNetwork() {
  const { addChain } = useAddChain()
  const [showModal, setShowModal] = useState(false)
  const { wallet, chainId, disconnectWallet } = useWeb3()

  useEffect(() => {
    const userConnectedToFuse = chainId === ChainId.FUSE
    if (userConnectedToFuse) {
      setShowModal(false)
    } else {
      setShowModal(true)
    }
  }, [chainId])

  return (
    <Modal width={'min-content'} isOpen={showModal} onDismiss={emptyFunction} onClose={emptyFunction}>
      <Card width={['317px', '400px']}>
        <Card.Header>
          <Flex justifyContent={'space-between'} alignItems={'center'}>
            <Text fontSize={4}>You are in the wrong network</Text>
          </Flex>
        </Card.Header>

        <Card.Body>
          <Flex flexDirection={'column'} justifyContent={'center'} alignItems={'center'}>
            <Text fontSize={2}>Please switch to the Fuse chain to continue using this page</Text>
            <Flex py={4}>
              <Logo srcs={[SwitchNetworkFuseLogo]} />
            </Flex>

            <Button
              onClick={() => {
                addChain(CHAIN_MAP[ChainId.FUSE])
              }}
              mt={2}
              bg="highlight"
              color={'primary'}
              px={5}
              width={'317px'}
            >
              Switch to Fuse chain
            </Button>
            <Button
              onClick={() => {
                disconnectWallet(wallet)
              }}
              mt={2}
              bg="secondary"
              color={'white'}
              px={5}
              width={'317px'}
            >
              Disconnect Wallet
            </Button>
          </Flex>
        </Card.Body>
      </Card>
    </Modal>
  )
}

export default SwitchNetwork
