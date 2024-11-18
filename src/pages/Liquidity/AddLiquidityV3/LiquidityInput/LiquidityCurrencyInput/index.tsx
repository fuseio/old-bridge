import { useState } from 'react'
import { Percent } from '@voltage-finance/sdk-core'
import { Box, Card, Flex, Text } from 'rebass/styled-components'

import { useWeb3 } from '../../../../../hooks'
import { formatSignificant } from '../../../../../utils'
import { BalanceLoader } from '../../../../../wrappers/BalanceLoader'
import NumericalInput from '../../../../../components/NumericalInput'
import { useCurrencyBalance } from '../../../../../state/wallet/hooks'
import CurrencyDropdown from '../../../../../wrappers/CurrencyInputDropdown/Dropdown'
import CurrencySearchModal from '../../../../../modals/SearchModal/CurrencySearchModal'

interface InputButtonProps {
  text: string
  onClick: () => void
}
const InputButton = ({ text, onClick }: InputButtonProps) => {
  return (
    <Flex
      bg={'white'}
      alignContent={'center'}
      justifyContent={'center'}
      sx={{ cursor: 'pointer', borderRadius: '23px', width: '58px', height: '30px' }}
      onClick={() => {
        onClick()
      }}
    >
      <Text fontSize={'14px'} fontWeight={500} justifyContent={'center'} alignContent={'center'}>
        {text}
      </Text>
    </Flex>
  )
}

export const LiquidityCurrencyInput = ({
  onUserInput,
  value,
  onCurrencySelect,
  selectedCurrency,
  showCommonBases,
  showETH,
  listType,
  tokenAddress,
  asDefaultSelect,
  onlyInput = false,
}: {
  onUserInput?: (val: string) => void
  value: string
  onCurrencySelect: (token: any) => void
  showCommonBases?: boolean
  showETH?: boolean
  listType: CurrencyListType
  selectedCurrency: any
  tokenAddress?: string
  disabled?: boolean
  title?: string
  showMaxButtons?: boolean
  priceImpact?: Percent
  asDefaultSelect?: boolean
  onlyDropdown?: boolean
  onlyInput?: boolean
  fiatValue?: number
}) => {
  const { account } = useWeb3()
  const [modalOpen, setModalOpen] = useState(false)
  const balance = useCurrencyBalance(account ?? undefined, selectedCurrency)

  return (
    <Card bg="gray70" padding={['20px', '12px', '30px']}>
      <Flex flexDirection={'column'} sx={{ gap: 3 }}>
        <Flex justifyContent={'space-between'}>
          <CurrencyDropdown
            onClick={() => {
              if (!onlyInput) {
                setModalOpen(true)
              }
            }}
            asDefaultSelect={asDefaultSelect}
            onlyInput={onlyInput}
            tokenAddress={tokenAddress}
            currency={selectedCurrency}
            backgroundColor="white"
          />

          <Flex alignItems={'center'} sx={{ gap: [1, 1, 3] }}>
            <Box display={['none', 'none', 'block']}>
              <BalanceLoader>
                <Flex sx={{ gap: 2 }}>
                  <Text fontSize={'14px'} color={'blk70'}>
                    Balance:
                  </Text>
                  <Text fontSize={'14px'} color={'blk70'}>
                    {formatSignificant({ value: parseFloat(balance?.toExact()), maxLength: 6 })}
                  </Text>
                </Flex>
              </BalanceLoader>
            </Box>

            <InputButton
              text={'50%'}
              onClick={() => {
                if (balance) {
                  onUserInput(balance.divide('2').toSignificant())
                }
              }}
            />

            <InputButton text={'Max'} onClick={() => onUserInput(balance?.toExact())} />
          </Flex>
        </Flex>

        <Flex justifyContent={'space-between'}>
          <Flex width={1 / 2}>
            <NumericalInput
              value={value}
              color={'black'}
              fontWeight={600}
              fontSize={'32px'}
              opacity={1}
              decimals={selectedCurrency?.decimals}
              onUserInput={(val) => {
                if (onUserInput) {
                  onUserInput(val)
                }
              }}
            />
          </Flex>

          <Flex justifyContent={'right'} alignItems={'center'} width={1 / 2}>
            <Box display={['block', 'block', 'none']}>
              <BalanceLoader>
                <Flex sx={{ gap: 2 }}>
                  <Text fontSize={'14px'} color={'blk70'}>
                    Balance:
                  </Text>
                  <Text fontSize={'14px'} color={'blk70'}>
                    {formatSignificant({ value: parseFloat(balance?.toExact()), maxLength: 6 })}
                  </Text>
                </Flex>
              </BalanceLoader>{' '}
            </Box>
          </Flex>
        </Flex>
      </Flex>

      <CurrencySearchModal
        isOpen={modalOpen}
        onDismiss={() => {
          setModalOpen(false)
        }}
        onCurrencySelect={(token) => {
          if (token) {
            onCurrencySelect(token)
          }
        }}
        selectedCurrency={selectedCurrency}
        showCommonBases={showCommonBases}
        showETH={showETH}
        listType={listType}
      />
    </Card>
  )
}
