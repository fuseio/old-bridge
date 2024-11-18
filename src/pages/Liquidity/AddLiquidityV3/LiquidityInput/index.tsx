import { Plus } from 'react-feather'
import styled from 'styled-components'
import { Flex } from 'rebass/styled-components'
import { FeeAmount } from '@voltage-finance/v3-sdk'
import { Currency, CurrencyAmount } from '@voltage-finance/sdk-core'

import { Field } from '../../../../state/mint/actions'
import useCurrencyAmountUSD from '../../../../hooks/useUSDPrice'
import { LiquidityCurrencyInput } from './LiquidityCurrencyInput'

const IconContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px; // Adjust based on the size of the circle
  height: 50px; // Adjust based on the size of the circle

  &:before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: white;
    border-radius: 50%;
    z-index: 0;
  }
`

const StyledPlus = styled(Plus)`
  z-index: 1;
`

interface LiquidityInputProps {
  currencies: {
    CURRENCY_A?: Currency
    CURRENCY_B?: Currency
  }
  currencyIdA: string
  currencyIdB: string
  noLiquidity: boolean
  onFieldAInput: (typedValue: string) => void
  onFieldBInput: (typedValue: string) => void
  parsedAmounts: {
    CURRENCY_A: CurrencyAmount<Currency>
    CURRENCY_B: CurrencyAmount<Currency>
  }
  hasValidMinMax: boolean
  formattedAmounts: {
    [x: string]: string
  }
  depositADisabled: boolean
  depositBDisabled: boolean
  hasStartingPrice: FeeAmount
  handleCurrencyASelect: (currencyANew: Currency) => void
  handleCurrencyBSelect: (currencyANew: Currency) => void
}

export default function LiquidityInput({
  currencies,
  currencyIdA,
  currencyIdB,
  noLiquidity,
  onFieldAInput,
  onFieldBInput,
  parsedAmounts,
  hasValidMinMax,
  formattedAmounts,
  depositADisabled,
  depositBDisabled,
  hasStartingPrice,
  handleCurrencyASelect,
  handleCurrencyBSelect,
}: LiquidityInputProps) {
  const fiatValueTradeInput = useCurrencyAmountUSD(parsedAmounts[Field.CURRENCY_A])
  const fiatValueTradeOutput = useCurrencyAmountUSD(parsedAmounts[Field.CURRENCY_B])

  return (
    <Flex flexDirection={'column'} sx={{ gap: 2, position: 'relative' }}>
      <LiquidityCurrencyInput
        onlyDropdown={depositADisabled || (noLiquidity && (!hasStartingPrice || !hasValidMinMax))}
        value={formattedAmounts[Field.CURRENCY_A]}
        onUserInput={onFieldAInput}
        tokenAddress={currencyIdA}
        onCurrencySelect={handleCurrencyASelect}
        selectedCurrency={currencies[Field.CURRENCY_A]}
        showCommonBases
        listType="Swap"
        showETH={true}
        fiatValue={fiatValueTradeInput}
      />

      <IconContainer>
        <StyledPlus size={24} />
      </IconContainer>

      <LiquidityCurrencyInput
        onlyDropdown={depositBDisabled || (noLiquidity && (!hasStartingPrice || !hasValidMinMax))}
        tokenAddress={currencyIdB}
        value={formattedAmounts[Field.CURRENCY_B]}
        onUserInput={onFieldBInput}
        onCurrencySelect={handleCurrencyBSelect}
        selectedCurrency={currencies[Field.CURRENCY_B]}
        showCommonBases
        listType="Swap"
        showETH={true}
        fiatValue={fiatValueTradeOutput}
      />
    </Flex>
  )
}
