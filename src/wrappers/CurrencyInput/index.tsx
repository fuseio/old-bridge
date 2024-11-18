import { Box, Flex, Image, Text } from 'rebass/styled-components'
import { Currency, CurrencyAmount } from '@voltage-finance/sdk-core'

import { useWeb3 } from '../../hooks'
import { InputRow } from '../InputRow'
import { formatSignificant } from '../../utils'
import { BalanceLoader } from '../BalanceLoader'
import { ChainId } from '../../constants/chains'
import NumericalInput from '../../components/NumericalInput'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import CurrencyLogo from '../../components/Logo/CurrencyLogo'

export const CurrencyInput = ({
  onUserInput,
  value,
  currency,
  balance,
  onMax,
  icon,
  enableOnAllNetworks,
  tokenUrl,
}: {
  onUserInput?: (val: string) => void
  onMax?: (balance: CurrencyAmount<Currency>) => void
  value: string
  currency: any
  icon?: any
  balance?: number | string
  enableOnAllNetworks?: boolean
  tokenUrl?: string
}) => {
  const { account, chainId } = useWeb3()
  const currencyBalance = useCurrencyBalance(account ?? undefined, currency)
  const formattedBalance = formatSignificant({
    value: balance || currencyBalance?.toExact(),
  })

  return (
    <InputRow disabled={chainId !== ChainId.FUSE && chainId !== ChainId.SPARK && !enableOnAllNetworks}>
      <Flex height={'100%'} style={{ gap: '8px' }} width="100%" justifyContent={'space-between'} alignItems={'center'}>
        <Flex alignItems={'center'} width={'100%'}>
          <NumericalInput
            onUserInput={(val) => {
              if (onUserInput) {
                onUserInput(val)
              }
            }}
            decimals={currency?.decimals}
            fontSize={'20px'}
            value={value}
          />

          {currency && (chainId === ChainId.FUSE || chainId === ChainId.SPARK || enableOnAllNetworks) && (
            <Flex ml={4} style={{ gap: '5px' }} alignItems="center">
              <Flex style={{ gap: '4px' }} alignItems={'end'} flexDirection={'column'}>
                <Text minWidth={80} textAlign={'right'} fontSize={!account ? 1 : 0}>
                  {currency?.symbol || 'FUSE'}
                </Text>
                <BalanceLoader minWidth={40}>
                  <Flex style={{ gap: '4px' }} alignItems={'center'}>
                    {onMax && (
                      <Text
                        onClick={() => {
                          onMax(currencyBalance)
                        }}
                        style={{ cursor: 'pointer' }}
                        color="primary"
                        fontWeight={500}
                        fontSize={0}
                      >
                        Max
                      </Text>
                    )}

                    <Text fontSize={0}>{formattedBalance}</Text>
                  </Flex>
                </BalanceLoader>
              </Flex>
            </Flex>
          )}
        </Flex>

        <Box style={{ cursor: 'pointer' }}>
          {icon ? (
            <Image src={icon} size={32} />
          ) : (
            <CurrencyLogo tokenUrl={tokenUrl} size={'24px'} currency={currency} />
          )}
        </Box>
      </Flex>
    </InputRow>
  )
}
