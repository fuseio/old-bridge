import { Copy, ExternalLink as LinkIcon } from 'react-feather'
import { Button, Flex, Image, Text } from 'rebass/styled-components'

import { useWeb3 } from '../../../hooks'
import useCopyClipboard from '../../../hooks/useCopyClipboard'
import { TYPE } from '../../../theme'
import { getExplorerLink, getExplorerLinkText, shortenAddress } from '../../../utils'

interface AccountDetailsProps {
  pendingTransactions: string[]
  confirmedTransactions: string[]
  ENSName?: string
  onChange: () => void
}

export default function AccountDetails({ onChange }: AccountDetailsProps) {
  const { chainId, account } = useWeb3()

  const [isCopied, setCopied] = useCopyClipboard()

  // FIXME: get wallet and icon
  const { name, icon } = { name: '', icon: '' }

  return (
    <>
      <Flex flexDirection={'column'}>
        <Text>Account</Text>

        <Flex flexDirection={'column'}>
          <Flex justifyContent={'space-between'} alignItems={'center'}>
            <Text fontSize={0}>Connected with {name}</Text>
            <Flex style={{ gap: '16px' }} justifyContent={'space-between'} alignItems={'center'}>
              <Button
                fontSize={[0, 1]}
                py={2}
                px={3}
                variant="secondary"
                onClick={() => {
                  onChange()
                }}
              >
                Change
              </Button>
            </Flex>
          </Flex>
          {account && (
            <Flex alignItems={'center'} sx={{ gap: 2 }} pb={3}>
              <Image size={18} src={icon} />
              <TYPE.main> {shortenAddress(account || '')}</TYPE.main>
            </Flex>
          )}
          <Flex justifyContent={'center'} alignItems={'center'} sx={{ gap: 1 }}>
            {account && (
              <Flex
                onClick={() => {
                  setCopied(account)
                }}
                minWidth={'130px'}
                sx={{ gap: 1, cursor: 'pointer' }}
                alignItems={'center'}
              >
                <Copy size={14} />
                <Text fontSize={0}>{isCopied ? 'Copied' : 'Copy Address'}</Text>
              </Flex>
            )}
            {account && chainId && (
              <Flex alignItems={'center'} sx={{ gap: 1, cursor: 'pointer' }}>
                <LinkIcon size={14} />
                <Text
                  fontSize={0}
                  onClick={() => {
                    window.open(getExplorerLink(chainId, account, 'address'))
                  }}
                >
                  {getExplorerLinkText(chainId)}
                </Text>
              </Flex>
            )}
          </Flex>
        </Flex>
      </Flex>
    </>
  )
}
