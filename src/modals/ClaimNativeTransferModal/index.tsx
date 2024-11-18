import React, { useEffect, useMemo, useState } from 'react'
import { ReactComponent as BridgeIcon } from '../../assets/svg/bridge-icon2.svg'
import { getChainIds, getForeignBridgeNativeToErcContract, getNativeTransactionSignatures } from '../../utils'
import { TYPE } from '../../theme'
import { NETWORK_LABELS } from '../../components/Header'
import ModalLegacy from '../../components/ModalLegacy'
import { Button } from 'rebass/styled-components'
import { BridgeTransaction } from '../../state/bridge/reducer'
import { useWeb3 } from '../../hooks'
import { getNativeStatusFromTxHash, getUserRequestFromTxHash } from '../../graphql/queries'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useBridgeActionHandlers } from '../../state/bridge/hooks'
import { ethFuseNativeSubgraphClient, fuseEthNativeSubgraphClient } from '../../graphql/client'
import { FUSE_NATIVE_TO_ERC677_BRIDGE_FOREIGN_ADDRESS } from '../../constants'
import { Box } from 'rebass/styled-components'
interface ClaimNativeTransferModalProps {
  isOpen: boolean
  onDismiss: () => void
  bridgeTransaction: BridgeTransaction
}

export default function ClaimNativeTransferModal({
  isOpen,
  onDismiss,
  bridgeTransaction: { homeTxHash, bridgeDirection }
}: ClaimNativeTransferModalProps) {
  const [userRequest, setUserRequest] = useState<any>()
  const [executionStatus, setExecutionStatus] = useState<any>()
  const { chainId, account, library } = useWeb3()

  const chains = useMemo(() => getChainIds(bridgeDirection), [bridgeDirection])

  const addTransaction = useTransactionAdder()
  const { onSetCurrentBridgeTransaction, onFinalizeBridgeTransaction } = useBridgeActionHandlers()

  useEffect(() => {
    async function getUserRequest() {
      const request = await getUserRequestFromTxHash(homeTxHash, fuseEthNativeSubgraphClient)
      if (request && request.signatures) {
        setUserRequest(request)
      }
    }

    let intervalId: any

    if (homeTxHash && !userRequest) {
      intervalId = setInterval(getUserRequest, 5000)
    }

    return () => clearInterval(intervalId)
  }, [homeTxHash, userRequest])

  useEffect(() => {
    async function getStatus() {
      if (userRequest && homeTxHash) {
        const status = await getNativeStatusFromTxHash(homeTxHash, ethFuseNativeSubgraphClient)
        if (status) {
          setExecutionStatus(status)
        }
      }
    }

    getStatus()
  }, [homeTxHash, userRequest])

  async function onClaim() {
    if (!library || !account || !userRequest || !homeTxHash || executionStatus) return

    try {
      const foreignNativebridge = getForeignBridgeNativeToErcContract(
        FUSE_NATIVE_TO_ERC677_BRIDGE_FOREIGN_ADDRESS,
        library,
        account
      )

      const [v, r, s] = getNativeTransactionSignatures(userRequest.signatures)
      const response = await foreignNativebridge.executeSignatures(v, r, s, userRequest.message)

      addTransaction(response, {
        summary: 'Claimed bridge tokens'
      })

      setUserRequest(null)
      setExecutionStatus(false)
      onSetCurrentBridgeTransaction(null)
      onFinalizeBridgeTransaction(homeTxHash, response.hash)
      onDismiss()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <ModalLegacy isOpen={isOpen} onDismiss={onDismiss}>
      <ModalLegacy.Header>
        <Box textAlign={'center'}>Claim your tokens</Box>
      </ModalLegacy.Header>
      <ModalLegacy.Content>
        <Box mx="auto" width={'fit-content'}>
          <BridgeIcon width="120px" />
        </Box>
      </ModalLegacy.Content>
      <ModalLegacy.Actions>
        <Box textAlign={'center'}>
          {chains ? (
            chainId === chains.foreignChain ? (
              <>
                {userRequest ? (
                  !executionStatus ? (
                    <Button variant="primary" onClick={() => onClaim()}>
                      Claim
                    </Button>
                  ) : (
                    <TYPE.body fontSize={18} fontWeight={500}>
                      Already executed
                    </TYPE.body>
                  )
                ) : (
                  <TYPE.body fontSize={18} fontWeight={500}>
                    Waiting for signatures
                  </TYPE.body>
                )}
              </>
            ) : (
              <TYPE.body fontSize={18} fontWeight={500}>
                Switch to {NETWORK_LABELS[chains.foreignChain]}
              </TYPE.body>
            )
          ) : (
            <div></div>
          )}
        </Box>
      </ModalLegacy.Actions>
    </ModalLegacy>
  )
}
