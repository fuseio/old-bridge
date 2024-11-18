import { Flex } from 'rebass/styled-components'
import { Currency } from '@voltage-finance/sdk-core'

import { Field } from '../../../../state/mint/actions'
import { CurrencySelect } from '../../../../components/CurrencySelect'

interface ChooseTokensProps {
  currencies: {
    CURRENCY_A?: Currency
    CURRENCY_B?: Currency
  }
  currencyIdA: string
  currencyIdB: string
  handleCurrencyASelect: (currencyANew: Currency) => void
  handleCurrencyBSelect: (currencyANew: Currency) => void
}

export default function ChooseTokens({
  currencies,
  currencyIdA,
  currencyIdB,
  handleCurrencyASelect,
  handleCurrencyBSelect,
}: ChooseTokensProps) {
  return (
    <Flex sx={{ gap: [3, 2, 3] }}>
      <CurrencySelect
        showETH={true}
        tokenAddress={currencyIdA}
        selectedCurrency={currencies[Field.CURRENCY_A]}
        showCommonBases
        listType="Swap"
        onCurrencySelect={handleCurrencyASelect}
      />

      <CurrencySelect
        showETH={true}
        tokenAddress={currencyIdB}
        selectedCurrency={currencies[Field.CURRENCY_B]}
        showCommonBases
        listType="Swap"
        onCurrencySelect={handleCurrencyBSelect}
      />
    </Flex>
  )
}
