import { ChainId, Currency, Token } from '@voltage-finance/sdk-core'
import { Button, Flex } from 'rebass/styled-components'
import CurrencyLogo from '../../components/Logo/CurrencyLogo'
import { nativeOnChain } from '../../constants/token'
import { useWeb3 } from '../../hooks'

export const CurrencyButton = ({
  currency,
  onClick,
}: {
  currency: any
  symbol: string
  onClick: () => void
}) => {
  return (
    <Button px={2} variant="gray" onClick={onClick}>
      <CurrencyLogo size="20px" currency={currency} />
    </Button>
  )
}

export default function CommonBases({
  tokens = [],
  onSelect,
  includeFuse = true,

  selectedCurrency,
}: {
  chainId?: ChainId
  includeFuse?: boolean
  tokens?: Array<Token>
  selectedCurrency?: Currency | null
  onSelect: (currency: Currency) => void
}) {
  const { chainId } = useWeb3()
  const nativeCurrency = nativeOnChain(chainId)
  return (
    <Flex flexDirection={'column'}>
      {includeFuse && (
        <CurrencyButton
          currency={nativeCurrency}
          symbol={'FUSE'}
          onClick={() => {
            if (!selectedCurrency || !selectedCurrency.equals(nativeCurrency)) {
              onSelect(nativeCurrency)
            }
          }}
        />
      )}
      {tokens.map((token: Token) => {
        const selected = selectedCurrency instanceof Token && selectedCurrency.address === token.address
        return (
          <CurrencyButton
            currency={token}
            symbol={token?.symbol}
            onClick={() => !selected && onSelect(token)}
            key={token.address}
          />
        )
      })}
    </Flex>
  )
}
