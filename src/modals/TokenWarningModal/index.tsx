import { Token } from '@voltage-finance/sdk-core'
import { useMemo } from 'react'
import { AlertTriangle } from 'react-feather'
import { Box, Button, Flex, Text } from 'rebass/styled-components'
import CurrencyLogo from '../../components/Logo/CurrencyLogo'
import ModalLegacy from '../../components/ModalLegacy'
import { useWeb3 } from '../../hooks'
import { useAllSwapTokens } from '../../hooks/Tokens'
import { TYPE } from '../../theme'
import { getExplorerLink, getExplorerLinkText, shortenAddress } from '../../utils'

interface TokenWarningCardProps {
  token?: Token
}

function TokenWarningCard({ token }: TokenWarningCardProps) {
  const { chainId } = useWeb3()

  const tokenSymbol = token?.symbol?.toLowerCase() ?? ''
  const tokenName = token?.name?.toLowerCase() ?? ''

  const allTokens = useAllSwapTokens()

  const duplicateNameOrSymbol = useMemo(() => {
    if (!token || !chainId) return false

    return Object.keys(allTokens).some((tokenAddress) => {
      const userToken = allTokens[tokenAddress]
      if (userToken.equals(token)) {
        return false
      }
      return userToken.symbol?.toLowerCase() === tokenSymbol || userToken.name?.toLowerCase() === tokenName
    })
  }, [token, chainId, allTokens, tokenSymbol, tokenName])

  if (!token) return null

  return (
    <Box px={3} py={2} variant={'outline'} bg="gray" opacity={duplicateNameOrSymbol ? '0.7' : 1}>
      <Flex alignItems={'center'} style={{ gap: '8px' }}>
        <CurrencyLogo currency={token} size={'28px'} />

        <Flex flexDirection={'column'} justifyContent={'flex-start'}>
          <TYPE.main>
            {token && token.name && token.symbol && token.name !== token.symbol
              ? `${token.name} (${token.symbol})`
              : token.name || token.symbol}{' '}
          </TYPE.main>
          {chainId && (
            <TYPE.link
              onClick={() => {
                window.open(getExplorerLink(chainId, token.address, 'token'))
              }}
            >
              {shortenAddress(token.address)} ({getExplorerLinkText(chainId)})
            </TYPE.link>
          )}
        </Flex>
      </Flex>
    </Box>
  )
}

export default function TokenWarningModal({
  isOpen,
  tokens,
  onConfirm,
  handleDismiss,
}: {
  isOpen: boolean
  handleDismiss: () => void
  tokens: Token[]
  onConfirm: () => void
}) {
  return (
    <ModalLegacy isOpen={isOpen} onClose={handleDismiss} onDismiss={handleDismiss}>
      <ModalLegacy.Header>
        <Flex alignItems={'center'} style={{ gap: '8px' }}>
          <AlertTriangle strokeWidth={1} />
          Token imported
        </Flex>
      </ModalLegacy.Header>
      <ModalLegacy.Content>
        <Box pt={3} pb={2}>
          <Text>
            Anyone can create an ERC20 token on Ethereum with <em>any</em> name, including creating fake versions of
            existing tokens and tokens that claim to represent projects that do not have a token.
          </Text>
          <Box my={2}></Box>
          <Text>
            This interface can load arbitrary tokens by token addresses. Please take extra caution and do your research
            when interacting with arbitrary ERC20 tokens.
          </Text>
          <Box my={2}></Box>
          <Text>
            If you purchase an arbitrary token, <strong>you may be unable to sell it back.</strong>
          </Text>

          {tokens.map((token) => {
            return (
              <Box key={token.address} pt={3} pb={1}>
                <TokenWarningCard key={token.address} token={token} />
              </Box>
            )
          })}
        </Box>
      </ModalLegacy.Content>
      <ModalLegacy.Actions>
        <Button
          fontWeight={500}
          fontSize={2}
          variant={'secondary'}
          onClick={() => {
            onConfirm()
          }}
        >
          I understand
        </Button>
      </ModalLegacy.Actions>
    </ModalLegacy>
  )
}
