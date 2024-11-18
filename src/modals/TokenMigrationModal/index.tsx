import { Currency, Token as TokenEntity } from '@voltage-finance/sdk-core'
import React, { useContext, useState } from 'react'
import { ArrowRight } from 'react-feather'
import { Box, Button, Flex } from 'rebass/styled-components'
import { ThemeContext } from 'styled-components'
import { TOKEN_MIGRATOR_ADDRESS } from '../../constants'
import { useWeb3, useUpgradedTokenAddress } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { WrappedTokenInfo } from '../../state/lists/hooks'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { TYPE } from '../../theme'
import { addTokenToWallet, calculateGasMargin, getTokenMigrationContract } from '../../utils'
import ModalLegacy from '../../components/ModalLegacy'
import { Dots } from '../../components/swap/styleds'
import Token from './Token'

enum MigrationState {
  INITIAL = 0,
  PENDING = 1,
  MIGRATED = 2
}

export default function TokenMigrationModal({
  token: deprecatedToken,
  isOpen,
  onDismiss,
  listType
}: {
  token: Currency | undefined
  isOpen: boolean
  onDismiss: () => void
  listType: CurrencyListType
}) {
  const { account, library } = useWeb3()
  const theme = useContext(ThemeContext)

  const wrappedDeprecatedToken = deprecatedToken as WrappedTokenInfo
  const upgradedTokenAddress = useUpgradedTokenAddress(wrappedDeprecatedToken)

  const upgradedToken = useCurrency(upgradedTokenAddress, listType)
  const wrappedUpgradedToken = upgradedToken as WrappedTokenInfo

  const balance = useTokenBalance(account ?? undefined, deprecatedToken as TokenEntity)
  const [approval, approveCallback] = useApproveCallback(balance, TOKEN_MIGRATOR_ADDRESS)

  const [migrationState, setMigrationState] = useState<MigrationState>(MigrationState.INITIAL)

  const addTransaction = useTransactionAdder()

  async function onMigrate() {
    if (!balance || !library || !account) return

    const tokenMigrator = getTokenMigrationContract(library, account)
    const args = [wrappedDeprecatedToken.address, balance.quotient.toString()]

    try {
      setMigrationState(MigrationState.PENDING)
      const estimatedGas = await tokenMigrator.estimateGas.migrateTokens(...args)
      const response = await tokenMigrator.migrateTokens(...args, { gasLimit: calculateGasMargin(estimatedGas) })

      addTransaction(response, { summary: `Migrate ${deprecatedToken?.symbol}` })
      setMigrationState(MigrationState.MIGRATED)

      if (wrappedUpgradedToken) {
        await addTokenToWallet(wrappedUpgradedToken, library)
      }
    } catch (e) {
      setMigrationState(MigrationState.INITIAL)
      console.log(e)
    }
  }

  return (
    <ModalLegacy isOpen={isOpen} width={500} onDismiss={onDismiss}>
      <ModalLegacy.Header>
        <Box textAlign={'center'}>Migrate Token</Box>
      </ModalLegacy.Header>
      <ModalLegacy.Content>
        <Flex flexDirection={'column'}>
          <Flex py={3} alignItems={'center'} justifyContent={'space-around'}>
            <Token token={deprecatedToken} addressColor={theme.red1} />
            <ArrowRight />
            <Token token={upgradedToken ?? undefined} addressColor="#008fff" />
          </Flex>
          <Box>
            <TYPE.main>
              {migrationState === MigrationState.MIGRATED
                ? `You received ${balance?.toSignificant()} ${
                    upgradedToken?.symbol
                  } tokens. New token address is at{' '}
                  ${wrappedUpgradedToken?.address}}`
                : `Due to recent changes in fuse contracts architecture, the token you selected is deprecated. Please
                  migrate your token and receive a new one`}
            </TYPE.main>
          </Box>
        </Flex>
        <ModalLegacy.Actions>
          {(approval === ApprovalState.NOT_APPROVED || approval === ApprovalState.PENDING) && (
            <Button variant="primary" onClick={approveCallback} disabled={approval === ApprovalState.PENDING}>
              {approval === ApprovalState.PENDING ? (
                <Dots>Approving {deprecatedToken?.symbol}</Dots>
              ) : (
                'Approve ' + deprecatedToken?.symbol
              )}
            </Button>
          )}
          <Box py={1}></Box>
          <Button
            variant="primary"
            onClick={() => (migrationState === MigrationState.MIGRATED ? onDismiss() : onMigrate())}
            disabled={approval !== ApprovalState.APPROVED}
            // error={approval !== ApprovalState.APPROVED}
          >
            {migrationState === MigrationState.INITIAL && 'Migrate'}
            {migrationState === MigrationState.PENDING && 'Migrating...'}
            {migrationState === MigrationState.MIGRATED && 'Done'}
          </Button>
        </ModalLegacy.Actions>
      </ModalLegacy.Content>
    </ModalLegacy>
  )
}
