import { Token } from '@voltage-finance/sdk-core'

import { useWeb3 } from '../../hooks'
import { InputRow } from '../InputRow'
import { formatSignificant } from '../../utils'
import { BalanceLoader } from '../BalanceLoader'
import { ChainId } from '../../constants/chains'
import { Box, Flex, Text } from 'rebass/styled-components'
import NumericalInput from '../../components/NumericalInput'
import MultiCurrencyLogo from '../../components/MultiCurrencyLogo'

export const MultiCurrencyInput = ({
  onUserInput,
  value,
  balance,
  token0,
  token1,
  onMax,
  enableOnAllNetworks,
}: {
  onUserInput: (val: string) => void
  onMax?: (balance: string | number) => void
  value: string
  balance?: string | number

  token0: Token
  token1: Token
  enableOnAllNetworks?: boolean
}) => {
  const { account, chainId } = useWeb3()

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
            fontSize={'20px'}
            value={value}
          />
          {(chainId === ChainId.FUSE || chainId === ChainId.SPARK || enableOnAllNetworks) && (
            <Flex ml={4} style={{ gap: '5px' }} alignItems="center">
              <Flex style={{ gap: '4px' }} alignItems={'end'} flexDirection={'column'}>
                <Text fontSize={!account ? 1 : 0}>
                  {token0?.symbol}/{token1?.symbol}
                </Text>

                {account && (
                  <BalanceLoader>
                    <Flex style={{ gap: '4px' }} alignItems={'center'}>
                      <Text
                        onClick={() => {
                          onMax(balance)
                        }}
                        width={'fit-content'}
                        style={{ cursor: 'pointer' }}
                        color="primary"
                        fontWeight={500}
                        fontSize={0}
                      >
                        Max
                      </Text>

                      <Text fontSize={0}>
                        {formatSignificant({
                          value: balance,
                        })}
                      </Text>
                    </Flex>
                  </BalanceLoader>
                )}
              </Flex>
            </Flex>
          )}
        </Flex>
        <Box style={{ cursor: 'pointer' }}>
          <MultiCurrencyLogo size={'24'} tokenAddresses={[token0?.address, token1?.address]} />
        </Box>
      </Flex>
    </InputRow>
  )
}
