import { Flex, Text } from 'rebass/styled-components'
import MultiCurrencyLogo from '../../../components/MultiCurrencyLogo'
import CurrencyLogo from '../../../components/Logo/CurrencyLogo'
import { ChevronDown } from 'react-feather'
import { Currency } from '@voltage-finance/sdk-core'

interface CurrencyDropdownProps {
  className?: string
  tokenAddress?: string
  currency: Currency
  onClick: any
  asDefaultSelect?: boolean
  onlyInput?: boolean
  backgroundColor?: string
}

const CurrencyDropdown = ({
  className,
  onClick,
  currency,
  tokenAddress,
  asDefaultSelect,
  onlyInput,
  backgroundColor = undefined,
}: CurrencyDropdownProps) => {
  return (
    <Flex
      className={className}
      variant="badge"
      px={asDefaultSelect || onlyInput ? 3 : 2}
      alignItems={'center'}
      width={'fit-content'}
      bg={asDefaultSelect && 'highlight'}
      backgroundColor={backgroundColor}
      sx={{ gap: 2, cursor: 'pointer' }}
      onClick={onClick}
      minHeight={39.98}
    >
      {!asDefaultSelect && (
        <>
          {tokenAddress && currency?.symbol !== 'FUSE' ? (
            <MultiCurrencyLogo size={'24'} tokenAddresses={[tokenAddress]} />
          ) : (
            <CurrencyLogo size={'24px'} currency={currency} />
          )}
        </>
      )}
      <Flex alignItems={'center'} sx={{ gap: 1 }}>
        {!asDefaultSelect ? (
          <Text fontWeight={600} fontSize={1}>
            {currency?.symbol || 'FUSE'}
          </Text>
        ) : (
          <Text fontWeight={600} fontSize={1}>
            Select Token
          </Text>
        )}
        {!onlyInput && <ChevronDown size={16} />}
      </Flex>
    </Flex>
  )
}
export default CurrencyDropdown
