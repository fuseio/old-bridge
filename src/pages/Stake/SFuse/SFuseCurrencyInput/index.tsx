import { ArrowDown } from 'react-feather'
import { Flex, Image, Text } from 'rebass/styled-components'

import { useWeb3 } from '../../../../hooks'
import { FUSE } from '../../../../data/Currency'
import { formatSignificant } from '../../../../utils'
import { ChainId } from '../../../../constants/chains'
import { BalanceLoader } from '../../../../wrappers/BalanceLoader'
import NumericalInput from '../../../../components/NumericalInput'
import { useFusePrice, useSFusePrice } from '../../../../graphql/hooks'

interface SFuseCurrencyInputProps {
  onUserInput?: (val: string) => void
  onMax?: (balance: number) => void
  value: string
  activeCurrency: any
  inactiveCurrency: any
  enableOnAllNetworks?: boolean
  priceRatio?: any
}

export const SFuseCurrencyInput = ({
  value,
  onMax,
  priceRatio,
  onUserInput,
  activeCurrency,
  inactiveCurrency,
  enableOnAllNetworks,
}: SFuseCurrencyInputProps) => {
  const { chainId } = useWeb3()
  const fusePrice = useFusePrice() || 0

  const activeIsFuse = activeCurrency?.currency?.symbol === FUSE.symbol
  const isDisabled = chainId !== ChainId.FUSE && chainId !== ChainId.SPARK && !enableOnAllNetworks

  const valueInNumber = Number(value) || 0
  const outputValue = valueInNumber * (activeIsFuse ? 1 / priceRatio : priceRatio)

  const fuseValue = activeIsFuse ? valueInNumber : Number(outputValue)
  const fuseValueInUsd = fuseValue * fusePrice

  return (
    <Flex
      sx={{
        pointerEvents: isDisabled ? 'none' : 'all',
        opacity: isDisabled ? '0.7' : '1',
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
              value={Number(value) == 0 ? '' : value}
              fontSize={'34px'}
              fontWeight={500}
              decimals={activeCurrency?.currency?.decimals}
              onUserInput={(val) => {
                if (onUserInput) {
                  onUserInput(val)
                }
              }}
            />
          </Flex>

          <Flex width={'100%'} sx={{ gap: '9px' }} alignItems={'center'} justifyContent={'end'}>
            <Image src={activeCurrency?.icon} width={'32px'} />

            <Text fontWeight={600} fontSize={['14px', '24px']} color={'black'}>
              {activeCurrency?.currency?.symbol}
            </Text>
          </Flex>
        </Flex>

        <Flex width="100%" height={'100%'} alignItems={'center'} justifyContent={'space-between'}>
          <Text color={'blk70'} fontSize={'14px'} fontWeight={500}>
            ${fuseValueInUsd.toFixed(2) ?? 0}
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
                      onMax(Number(activeCurrency?.balance?.toExact()))
                    }}
                  >
                    Balance: {formatSignificant({ value: activeCurrency?.balance?.toExact() })}
                  </Text>
                )}
              </Flex>
            </Text>
          </BalanceLoader>
        </Flex>
      </Flex>

      <Flex width="100%" justifyContent={'center'}>
        <Flex
          mx="auto"
          bg="white"
          alignItems={'center'}
          justifyContent={'center'}
          sx={{
            border: '0.1px solid #E8E8E8',
            zIndex: 2,
            borderRadius: '9999px',
            width: '30px',
            height: '30px',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <ArrowDown />
        </Flex>

        <Flex
          height={'1px'}
          minWidth={'100%'}
          backgroundColor={'#E8E8E8'}
          sx={{
            position: 'absolute',
          }}
        />
      </Flex>

      <Flex width="100%" flexDirection={'column'} sx={{ gap: ['14px'] }}>
        <Flex width="100%" height={'100%'} alignItems={'center'} justifyContent={'space-between'}>
          <Flex alignItems={'center'} width={'100%'}>
            <NumericalInput
              value={Number(outputValue || 0) == 0 ? '' : outputValue?.toFixed(2) || 0}
              fontSize={'34px'}
              fontWeight={500}
              decimals={inactiveCurrency?.currency?.decimals}
              disabled={true}
            />
          </Flex>

          <Flex width={'100%'} sx={{ gap: '9px' }} alignItems={'center'} justifyContent={'end'}>
            <Image src={inactiveCurrency?.icon} width={'32px'} />

            <Text fontWeight={600} fontSize={['14px', '24px']} color={'black'}>
              {inactiveCurrency?.currency?.symbol}
            </Text>
          </Flex>
        </Flex>

        <Flex width="100%" height={'100%'} alignItems={'center'} justifyContent={'end'}>
          <BalanceLoader minWidth={40}>
            <Text>
              <Flex style={{ gap: '4px' }} alignItems={'center'}>
                {onMax && (
                  <Text fontWeight={500} color={'blk70'} fontSize={'14px'}>
                    Balance: {formatSignificant({ value: inactiveCurrency?.balance?.toExact() })}
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
