import { Currency, Token } from '@voltage-finance/sdk-core'
import { Box, Button, Image } from 'rebass/styled-components'
import TransactionSvg from '../../../assets/svg/transactionArrow.svg'
import { useWeb3 } from '../../../hooks'
import { TYPE } from '../../../theme'
import { addTokenToWallet, getExplorerLink, getExplorerLinkText } from '../../../utils'

const Submitted = ({
  hash,
  currency,
  onClose,
}: {
  hash: string | undefined
  onClose: () => void
  currency?: Currency | Token
}) => {
  const { chainId } = useWeb3()
  const { library } = useWeb3()
  return (
    <Box width={300}>
      <Box my={2} width="fit-content" mx="auto">
        <Image src={TransactionSvg} />
      </Box>
      <Box textAlign={'center'}>
        <TYPE.mediumHeader fontWeight={500} fontSize={20}>
          Transaction Submitted
        </TYPE.mediumHeader>
        {chainId && hash && (
          <TYPE.link>
            <a href={getExplorerLink(chainId, hash, 'transaction')} style={{ textDecoration: 'none' }}>
              {getExplorerLinkText(chainId)}
            </a>
          </TYPE.link>
        )}
      </Box>
      <Box py={2}>
        {currency instanceof Token && library && (
          <Box
            fontSize={1}
            textAlign={'center'}
            color={'highlight'}
            fontWeight={600}
            sx={{ textDecoration: 'underline', cursor: 'pointer' }}
            onClick={() => addTokenToWallet(currency, library)}
          >
            Add {currency?.symbol} Token
          </Box>
        )}
      </Box>

      <Button width={'100%'} onClick={onClose}>
        Close
      </Button>
    </Box>
  )
}
export default Submitted
