import { Currency, CurrencyAmount, Fraction, Percent } from '@voltage-finance/sdk-core'
import React from 'react'
import { Button } from 'rebass/styled-components'
import CurrencyLogo from '../../../components/Logo/CurrencyLogo'
import { RowBetween, RowFixed } from '../../../components/Row'
import { Field } from '../../../state/mint/actions'
import { TYPE } from '../../../theme'

export function ConfirmAddModalBottom({
  noLiquidity,
  price,
  currencies,
  parsedAmounts,
  poolTokenPercentage,
  onAdd,
}: {
  noLiquidity?: boolean
  price?: Fraction
  currencies: { [field in Field]?: Currency }
  parsedAmounts: { [field in Field]?: CurrencyAmount<Currency> }
  poolTokenPercentage?: Percent
  onAdd: () => void
}) {
  return (
    <>
      <RowBetween>
        <TYPE.main color="text2">{currencies[Field.CURRENCY_A]?.symbol} Deposited:</TYPE.main>
        <RowFixed>
          <CurrencyLogo currency={currencies[Field.CURRENCY_A]} style={{ marginRight: '8px' }} />
          <TYPE.main>{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}</TYPE.main>
        </RowFixed>
      </RowBetween>
      <RowBetween>
        <TYPE.main color="text2">{currencies[Field.CURRENCY_B]?.symbol} Deposited:</TYPE.main>
        <RowFixed>
          <CurrencyLogo currency={currencies[Field.CURRENCY_B]} style={{ marginRight: '8px' }} />
          <TYPE.main>{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}</TYPE.main>
        </RowFixed>
      </RowBetween>
      <RowBetween align="start">
        <TYPE.main color="text2">Rates:</TYPE.main>
        <div>
          <TYPE.main textAlign="right">
            {`1 ${currencies[Field.CURRENCY_A]?.symbol} = ${price?.toSignificant(4)} ${
              currencies[Field.CURRENCY_B]?.symbol
            }`}
          </TYPE.main>
          <TYPE.main textAlign="right">
            {`1 ${currencies[Field.CURRENCY_B]?.symbol} = ${price?.invert().toSignificant(4)} ${
              currencies[Field.CURRENCY_A]?.symbol
            }`}
          </TYPE.main>
        </div>
      </RowBetween>
      <RowBetween>
        <TYPE.main color="text2">Share of Pool:</TYPE.main>
        <TYPE.main>{noLiquidity ? '100' : poolTokenPercentage?.toSignificant(4)}%</TYPE.main>
      </RowBetween>
      <Button variant="primary" style={{ margin: '20px 0 0 0' }} onClick={onAdd}>
        {noLiquidity ? 'Create Pool & Supply' : 'Confirm Supply'}
      </Button>
    </>
  )
}
