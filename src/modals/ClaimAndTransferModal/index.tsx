import React, { useEffect, useMemo, useState } from 'react'
import { ReactComponent as BridgeIcon } from '../../assets/svg/bridge-icon2.svg'
import { getMessageFromTxHash, getStatusFromTxHash } from '../../graphql/queries'
import { getForeignAmbSubgraph, getHomeAmbSubgraph } from '../../graphql/utils'
import { useWeb3 } from '../../hooks'
import { TYPE } from '../../theme'
import { getChainIds, getForeignAmbAddress, getForeignAmbContract, packSignatures } from '../../utils'
import { NETWORK_LABELS } from '../../components/Header'
import ModalLegacy from '../../components/ModalLegacy'
import { Button, Box } from 'rebass/styled-components'

import { useTransactionAdder } from '../../state/transactions/hooks'
import { BridgeTransaction } from '../../state/bridge/reducer'

interface ClaimAmbTransferModalProps {
  isOpen: boolean
  onDismiss: () => void
  bridgeTransaction: BridgeTransaction
}

export default function ClaimAmbTransferModal({
  isOpen,
  onDismiss,
  bridgeTransaction: { homeTxHash, bridgeDirection }
}: ClaimAmbTransferModalProps) {
  const { chainId, account, library } = useWeb3()
  const [message, setMessage] = useState<any>(null)
  const [executionStatus, setExecutionStatus] = useState<any>(false)

  const chains = useMemo(() => getChainIds(bridgeDirection), [bridgeDirection])
  const foreignAmbAddress = useMemo(() => getForeignAmbAddress(bridgeDirection), [bridgeDirection])

  const addTransaction = useTransactionAdder()

  useEffect(() => {
    async function getMessage() {
      const msg = await getMessageFromTxHash(homeTxHash, getHomeAmbSubgraph(bridgeDirection))
      if (msg && msg.signatures) {
        setMessage(msg)
      }
    }

    let intervalId: any

    if (homeTxHash && !message) {
      intervalId = setInterval(getMessage, 5000)
    }

    return () => clearInterval(intervalId)
  }, [bridgeDirection, message, homeTxHash])

  useEffect(() => {
    async function getStatus() {
      if (message && message.msgId) {
        const status = await getStatusFromTxHash(message.msgId, getForeignAmbSubgraph(bridgeDirection))
        if (status) {
          setExecutionStatus(status)
        }
      }
    }

    getStatus()
  }, [bridgeDirection, message])

  async function onClaim() {
    if (!library || !account || !message || !foreignAmbAddress || !homeTxHash || executionStatus) return
    try {
      const foreignAmb = getForeignAmbContract(foreignAmbAddress, library, account)
      const response = await foreignAmb.executeSignatures(message.msgData, packSignatures(message.signatures))

      addTransaction(response, {
        summary: 'Claimed bridge tokens'
      })

      setMessage(null)
      setExecutionStatus(false)
      onDismiss()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <ModalLegacy width={350} isOpen={isOpen} onDismiss={onDismiss}>
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
                {message ? (
                  !executionStatus ? (
                    <Button variant="primary" onClick={() => onClaim()}>
                      Claim
                    </Button>
                  ) : (
                    <TYPE.main>Already executed</TYPE.main>
                  )
                ) : (
                  <TYPE.main>Waiting for signatures</TYPE.main>
                )}
              </>
            ) : (
              <TYPE.main>Switch to {NETWORK_LABELS[chains.foreignChain]}</TYPE.main>
            )
          ) : (
            <div></div>
          )}
        </Box>
      </ModalLegacy.Actions>
    </ModalLegacy>
  )
}
