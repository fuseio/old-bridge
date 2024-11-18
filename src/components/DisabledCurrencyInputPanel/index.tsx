import { Currency } from '@voltage-finance/sdk-core'
import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { darken } from 'polished'
import { AutoRow } from '../Row'
import { TYPE } from '../../theme'
import { Input as NumericalInput } from '../NumericalInput'

const InputRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  margin-top: 20px;
  padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
`

const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0.75rem 1rem 0 1rem;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.text2)};
  }
`

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border: 0.5px solid rgba(181, 185, 211, 0.5);
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '10px')};
  background-color: #12141e;
  z-index: 1;
  opacity: 0.6;
  pointer-events: none;
`

const Container = styled.div<{ hideInput: boolean }>`
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
  background-color: #12141e;
`

const CurrencyPrice = styled.div`
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  display: flex;
  margin-right: 15px;
  color: #b5b9d3;
`

const TokenWrapper = styled.div`
  display: flex;
  padding: 7px;
  border: 0.55px solid rgba(181, 185, 211, 0.5);
  border-radius: 5px;
  font-size: 15.34px;
  margin-bottom: 10px;
`

interface CurrencyInputPanelProps {
  value: string
  label?: string
  currency?: Currency | null
  currencyPriceUSD?: string | number | null
  hideInput?: boolean
  id: string
}

export default function DisabledCurrencyInputPanel({
  value,
  label = 'Input',
  currency,
  currencyPriceUSD,
  hideInput = false,
  id
}: CurrencyInputPanelProps) {
  const theme = useContext(ThemeContext)

  return (
    <>
      <InputPanel id={id}>
        <Container hideInput={hideInput}>
          {!hideInput && (
            <LabelRow>
              <AutoRow justify={'space-between'}>
                <TYPE.body color={theme.white} fontWeight={500} fontSize={14}>
                  {label}
                </TYPE.body>
              </AutoRow>
            </LabelRow>
          )}
          <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}} selected={false}>
            {!hideInput && (
              <>
                <NumericalInput className="token-amount-input" value={value} />
              </>
            )}
            {currency && currencyPriceUSD && <CurrencyPrice>($ {currencyPriceUSD})</CurrencyPrice>}
            <TokenWrapper>
              <img
                src={process.env.PUBLIC_URL + '/images/stablecoins/' + currency?.symbol + '.svg'}
                style={{ marginRight: '7.5px' }}
                width="20px"
              />
              {currency?.symbol}
            </TokenWrapper>
          </InputRow>
        </Container>
      </InputPanel>
    </>
  )
}
