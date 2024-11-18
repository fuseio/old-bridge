import JSBI from 'jsbi'
import { useState } from 'react'
import { Flex, Text } from 'rebass/styled-components'
import { Fraction, Percent } from '@voltage-finance/sdk-core'

import Balance from './Balance'
import { useWeb3 } from '../../hooks'
import { MaxButton } from '../MaxButton'
import CurrencyDropdown from './Dropdown'
import { formatSignificant } from '../../utils'
import NumericalInput from '../../components/NumericalInput'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import FormattedPriceImpact from '../../components/swap/FormattedPriceImpact'
import CurrencySearchModal from '../../modals/SearchModal/CurrencySearchModal'

export const CurrencyInputDropdown = ({
  id,
  onUserInput,
  value,
  onCurrencySelect,
  selectedCurrency,
  showCommonBases,
  showETH,
  listType,
  showMaxButtons = true,
  priceImpact,
  tokenAddress,
  title,
  asDefaultSelect,
  fiatValue,
  onlyDropdown = false,
  onlyInput = false,
}: {
  id?: string
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
    <Flex id={id} sx={{ gap: 2 }} flexDirection={'column'}>
      <Balance title={title} asDefaultSelect={asDefaultSelect} balance={balance} />
      <Flex justifyContent={'space-between'} alignItems={'center'}>
        <CurrencyDropdown
          className="open-currency-select-button"
          onClick={() => {
            if (!onlyInput) {
              setModalOpen(true)
            }
          }}
          asDefaultSelect={asDefaultSelect}
          onlyInput={onlyInput}
          tokenAddress={tokenAddress}
          currency={selectedCurrency}
        />
        {selectedCurrency && !asDefaultSelect && !onlyDropdown && showMaxButtons && (
          <Flex sx={{ gap: 1 }} alignItems="center">
            <MaxButton
              text="50%"
              onClick={() => {
                onUserInput((balance as any)?.divide(new Fraction(JSBI.BigInt(2), JSBI.BigInt(1)))?.toSignificant(18))
              }}
            />

            <MaxButton
              onClick={() => {
                onUserInput(balance?.toExact())
              }}
            />
          </Flex>
        )}
      </Flex>
      <Flex
        py={!onlyDropdown || (typeof fiatValue === 'number' && fiatValue !== 0) ? 2 : 0}
        justifyContent={'space-between'}
        alignItems={'end'}
      >
        {!onlyDropdown && (
          <Flex width="60%">
            <NumericalInput
              className="token-amount-input"
              onUserInput={(val) => {
                if (onUserInput) {
                  onUserInput(val)
                }
              }}
              fontSize={'32px'}
              decimals={selectedCurrency?.decimals}
              value={value}
            />
          </Flex>
        )}
        {typeof fiatValue === 'number' && fiatValue !== 0 && (
          <Flex mb={1} fontSize={1} sx={{ gap: 1 }}>
            <Text color="blk70" fontWeight={500}>
              ${formatSignificant({ value: fiatValue })}
            </Text>
            {priceImpact && <FormattedPriceImpact priceImpact={priceImpact} />}
          </Flex>
        )}
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
    </Flex>
  )
}
