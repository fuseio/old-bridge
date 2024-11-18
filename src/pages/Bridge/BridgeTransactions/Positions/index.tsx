import { ChainId } from '@voltage-finance/sdk-core'
import { useCallback } from 'react'
import { Button, Card, Flex, Link, Text } from 'rebass/styled-components'
import { ETH_FUSE_FOREIGN_AMB, FUSE_NATIVE_TO_ERC677_BRIDGE_FOREIGN_ADDRESS } from '../../../../constants'
import { ETH_CHAIN } from '../../../../constants/chains'
import { useWeb3 } from '../../../../hooks'
import { useTransactionRejectedNotification } from '../../../../hooks/notifications/useTransactionRejectedNotification'
import useAddChain from '../../../../hooks/useAddChain'
import { useTransactionAdder } from '../../../../state/transactions/hooks'
import {
  getExplorerLink,
  getForeignAmbContract,
  getForeignBridgeNativeToErcContract,
  getNativeTransactionSignatures,
  packSignatures,
} from '../../../../utils'
import BridgeTransactionAmount from '../Amount'

function BridgeClaim({ message, foreignTxHash, isNative }: any) {
  const { library, account, chainId } = useWeb3()

  const rejectTransaction = useTransactionRejectedNotification()

  const addTransaction = useTransactionAdder()

  const { addChain } = useAddChain()

  const onClaimErc20 = useCallback(async () => {
    if (!library || !account || !message) return

    try {
      const foreignAmb = getForeignAmbContract(ETH_FUSE_FOREIGN_AMB, library, account)
      const response = await foreignAmb.executeSignatures(message.msgData, packSignatures(message.signatures))

      addTransaction(response, {
        summary: 'Claimed bridge tokens',
      })
    } catch (e: any) {
      if (e?.code === 4001 || e?.code === 'ACTION_REJECTED') {
        rejectTransaction()
      }
      console.error(e)
    }
  }, [library, account, message, addTransaction, rejectTransaction])

  const onClaimNative = useCallback(async () => {
    if (!library || !account || !message) return

    try {
      const foreignNativebridge = getForeignBridgeNativeToErcContract(
        FUSE_NATIVE_TO_ERC677_BRIDGE_FOREIGN_ADDRESS,
        library,
        account
      )

      const [v, r, s] = getNativeTransactionSignatures(message.signatures)
      const response = await foreignNativebridge.executeSignatures(v, r, s, message.msgData)

      addTransaction(response, {
        summary: 'Claimed bridge tokens',
      })
    } catch (e) {
      console.error(e)
    }
  }, [library, account, message, addTransaction])

  if (!foreignTxHash) {
    return chainId === ChainId.MAINNET ? (
      <Button
        fontWeight={600}
        fontSize={0}
        px={[2, 4]}
        ml="auto"
        width={'fit-content'}
        display={'block'}
        variant={'tertiary'}
        onClick={() => (!isNative ? onClaimErc20() : onClaimNative())}
      >
        Claim
      </Button>
    ) : (
      <Button fontWeight={600} fontSize={0} px={[2, 3]} variant={'tertiary'} onClick={() => addChain(ETH_CHAIN)}>
        Switch to Ethereum
      </Button>
    )
  } else {
    return (
      <Link
        ml="auto"
        color="white"
        width={'fit-content'}
        fontSize={[0, 2]}
        display={'block'}
        href={getExplorerLink(ChainId.MAINNET, foreignTxHash, 'transaction')}
      >
        {foreignTxHash.slice(0, 3)}...{foreignTxHash.slice(-3)}
      </Link>
    )
  }
}

const Positions = ({ row: { message, homeTxHash, foreignTxHash, amount, tokenAddress, isNative } }: any) => {
  return (
    <Card bg="transparent" width={'100%'} height={'100%'}>
      <Flex justifyContent={'space-between'} flexDirection={'column'} style={{ gap: '8px' }} py={1}>
        <Flex alignItems={'center'} width={'100%'} justifyContent={'space-between'}>
          <Text opacity={0.7} fontSize={0}>
            Home Txn
          </Text>

          <Link color="black" fontSize={[0, 1]} href={getExplorerLink(ChainId.FUSE, homeTxHash, 'transaction')}>
            {homeTxHash.slice(0, 4)}...{homeTxHash.slice(-4)}
          </Link>
        </Flex>
        <Flex minHeight={30} alignItems={'center'} justifyContent={'space-between'}>
          <Text opacity={0.7} fontSize={0}>
            Tokens
          </Text>
          <BridgeTransactionAmount amount={amount} foreignTokenAddress={tokenAddress} isNative={isNative} />
        </Flex>
      </Flex>
      <Flex py={2} justifyContent={'end'} width={'100%'} style={{ gap: '8px' }}>
        <BridgeClaim message={message} foreignTxHash={foreignTxHash} isNative={isNative} />
      </Flex>
    </Card>
  )
}
export default Positions
