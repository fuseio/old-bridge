import { Box, Flex, Link, Text } from 'rebass/styled-components'
import ModalLegacy from '../../components/ModalLegacy'
import { useWeb3 } from '../../hooks'
import { useWalletModalOpen, useWalletModalToggle } from '../../state/application/hooks'
import AccountDetails from './AccountDetails'

export default function WalletModal({
  pendingTransactions,
  confirmedTransactions,
  ENSName,
}: {
  pendingTransactions: string[] // hashes of pending
  confirmedTransactions: string[] // hashes of confirmed
  ENSName?: string
}) {
  // important that these are destructed from the account-specific web3-react context
  const { account } = useWeb3()

  const walletModalOpen = useWalletModalOpen()

  const toggleWalletModal = useWalletModalToggle()

  function getModalContent() {
    if (account) {
      return (
        <AccountDetails
          pendingTransactions={pendingTransactions}
          confirmedTransactions={confirmedTransactions}
          ENSName={ENSName}
          onChange={async () => {
            console.log('')
          }}
        />
      )
    }

    return (
      <Box pt={3}>
        <Flex flexDirection={'column'} style={{ gap: '8px' }}></Flex>
        <Flex flexDirection={'column'} style={{ gap: '8px' }}></Flex>
        <Flex
          pt={2}
          flexDirection={'column'}
          width={'100%'}
          textAlign="center"
          alignItems={'center'}
          style={{ gap: '0px' }}
        >
          <Text fontSize={1}>
            New to crypto? Install the
            <Link
              mx={1}
              fontSize={1}
              fontWeight={700}
              onClick={() => {
                window.open('https://voltage.finance/app', '_blank')
              }}
            >
              Volt App
            </Link>
            <br></br>
            and choose WalletConnect
          </Text>
        </Flex>
      </Box>
    )
  }
  return (
    <ModalLegacy
      onPrevious={null}
      isOpen={walletModalOpen}
      onClose={toggleWalletModal}
      onDismiss={toggleWalletModal}
      width={350}
    >
      <ModalLegacy.Content>{getModalContent()}</ModalLegacy.Content>
    </ModalLegacy>
  )
}
