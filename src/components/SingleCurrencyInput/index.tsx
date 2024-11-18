import { Currency, CurrencyAmount } from '@voltage-finance/sdk-core'
import { Flex, Text } from 'rebass/styled-components'
import { formatSignificant } from '../../utils'
import { BalanceLoader } from '../../wrappers/BalanceLoader'
import CurrencyLogo from '../Logo/CurrencyLogo'
import NumericalInput from '../NumericalInput'

interface SingleCurrencyInputProps {
  onUserInput?: (val: string) => void
  onMax?: () => void
  value: string
  currency: Currency
  currencyBalance: CurrencyAmount<Currency>
  typedValueUSD: number
}

export default function SingleCurrencyInput({
  onUserInput,
  onMax,
  value,
  currency,
  currencyBalance,
  typedValueUSD,
}: SingleCurrencyInputProps) {
  return (
    <Flex
      sx={{
        pointerEvents: 'all',
        opacity: '1',
        position: 'relative',
        gap: ['15px'],
      }}
      px={['20px']}
      py={['15px']}
      width={'100%'}
      variant="outline"
      bg={'transparent'}
      alignItems={'center'}
      flexDirection={'column'}
    >
      <Flex width="100%" flexDirection={'column'} sx={{ gap: ['14px'] }}>
        <Flex width="100%" height={'100%'} alignItems={'center'} justifyContent={'space-between'}>
          <Flex alignItems={'center'} width={'100%'}>
            <NumericalInput
              value={value}
              fontSize={'34px'}
              fontWeight={500}
              decimals={currency?.decimals}
              onUserInput={(value) => {
                if (onUserInput) {
                  onUserInput(value)
                }
              }}
            />
          </Flex>

          <Flex width={'100%'} sx={{ gap: '9px' }} alignItems={'center'} justifyContent={'end'}>
            {currency && <CurrencyLogo currency={currency} />}
            
            <Text fontWeight={600} fontSize={['14px', '24px']} color={'black'}>
              {currency?.symbol}
            </Text>
          </Flex>
        </Flex>

        <Flex width="100%" height={'100%'} alignItems={'center'} justifyContent={'space-between'}>
          <Text color={'blk70'} fontSize={'14px'} fontWeight={500}>
            ${typedValueUSD?.toFixed(4)}
          </Text>

          <BalanceLoader minWidth={40}>
            <Text>
              <Flex style={{ gap: '4px' }} alignItems={'center'}>
                {onMax && (
                  <Text
                    fontWeight={500}
                    color={'blk70'}
                    fontSize={'14px'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      onMax()
                    }}
                  >
                    Balance: {formatSignificant({ value: currencyBalance?.toSignificant() })}
                  </Text>
                )}
              </Flex>
            </Text>
          </BalanceLoader>
        </Flex>
      </Flex>
    </Flex>
  )
}
