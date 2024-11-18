import { Currency, CurrencyAmount, Token } from '@voltage-finance/sdk-core'
import { darken } from 'polished'
import React, { useCallback, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Flex } from 'rebass/styled-components'
import styled, { ThemeContext } from 'styled-components'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import { useWeb3 } from '../../hooks'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { TYPE } from '../../theme'
import { getCurrencySymbol } from '../../utils'
import CurrencyLogo from '../Logo/CurrencyLogo'
import { Input as NumericalInput } from '../NumericalInput'
import PercentageInputPanel from '../PercentageInputPanel'
import { AutoRow, RowBetween } from '../Row'
import CurrencySearchModal from './CurrencySearchModal'

const InputRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  margin-top: 20px;
  padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
`

const CurrencySelect = styled.button<{ selected: boolean; disabled?: boolean }>`
  align-items: center;
  height: 2.2rem;
  font-size: 20px;
  font-weight: 500;
  background-color: ${({ selected, theme }) => (selected ? theme.bg1 : theme.bg7)};
  color: white;
  border-radius: 999px;
  outline: none;
  cursor: ${({ disabled }) => (disabled ? 'no-drop' : 'pointer')};
  user-select: none;
  border: none;
  padding: 0 0.5rem;
  svg path {
    stroke: white;
    stroke-width: 1.5px;
  }
  :focus,
  :hover {
    background-color: ${({ selected, theme }) => (selected ? darken(0.02, theme.bg1) : darken(0.02, theme.bg7))};
    color: #ffffff;
    svg path {
      stroke: #ffffff;
      stroke-width: 1.5px;
    }
  }
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

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  margin: 0;
  height: 35%;
`

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border: 0.5px solid rgba(181, 185, 211, 0.5);
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '10px')};
  background-color: transparent;
  z-index: 1;
`

const Container = styled.div<{ hideInput: boolean }>`
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
  background-color: transparent;
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
  onUserInput?: (value: string) => void
  onMax?: (res: number) => void
  showMaxButton: boolean
  hideModal?: boolean
  label?: string
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  tokenAmount?: CurrencyAmount<Currency>
  currencyPriceUSD?: string | number | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  id: string
  tokens?: Array<Token>
  hideSelect?: boolean
  disableInput?: boolean
  hideBalance?: boolean
}

export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  hideModal = false,
  label = 'Input',
  onCurrencySelect,
  currency,
  tokenAmount,
  currencyPriceUSD,
  hideInput = false,
  otherCurrency,
  id,
  tokens = [],
  hideSelect,
  disableInput,
  hideBalance = false,
}: CurrencyInputPanelProps) {
  const { t } = useTranslation()

  const [modalOpen, setModalOpen] = useState(false)
  const { account, chainId } = useWeb3()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const theme = useContext(ThemeContext)

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  return (
    <>
      {account && (
        <TYPE.small
          onClick={() => {
            if (onMax) onMax(1)
          }}
          color={theme.text2}
          fontWeight={500}
          fontSize={14}
          style={{ display: 'flex', cursor: 'pointer', justifyContent: 'flex-start' }}
        >
          {account && currency && !hideBalance && (
            <Box px={2} pb={1}>
              Balance: {selectedCurrencyBalance?.toSignificant(6)}
            </Box>
          )}
        </TYPE.small>
      )}
      <InputPanel id={id}>
        <Container hideInput={hideInput}>
          {!hideInput && (
            <LabelRow>
              <AutoRow justify={'space-between'}>
                <TYPE.small color={theme.white} fontWeight={500} fontSize={14}>
                  {label}
                </TYPE.small>
                {showMaxButton && label !== 'To' && (
                  <RowBetween maxWidth={'225px'}>
                    <PercentageInputPanel
                      selectPercentage={onMax}
                      tokenAmount={tokenAmount}
                      decimals={tokenAmount?.currency.decimals}
                    />
                  </RowBetween>
                )}
              </AutoRow>
            </LabelRow>
          )}
          <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}} selected={false}>
            {!hideInput && (
              <>
                <NumericalInput
                  className="token-amount-input"
                  value={value}
                  onUserInput={(val) => {
                    if (onUserInput) onUserInput(val)
                  }}
                  disabled={disableInput}
                />
              </>
            )}
            {currency && currencyPriceUSD && (
              <Box pr={2}>
                <TYPE.main>($ {currencyPriceUSD})</TYPE.main>
              </Box>
            )}
            {hideSelect ? (
              <TokenWrapper>
                <img
                  src={process.env.PUBLIC_URL + '/images/stablecoins/' + currency?.symbol + '.svg'}
                  style={{ marginRight: '7.5px' }}
                  width="20px"
                />
                <TYPE.main>{currency?.symbol}</TYPE.main>
              </TokenWrapper>
            ) : (
              <CurrencySelect
                style={{
                  display: 'flex',
                  minWidth: '130px',
                  background: '#0B0C13',
                  border: '0.5px solid #B5B9D3',
                  borderRadius: '10px',
                }}
                disabled={hideModal}
                selected={!!currency}
                className="open-currency-select-button"
                onClick={() => {
                  hideModal ? setModalOpen(false) : setModalOpen(true)
                }}
              >
                <Flex alignItems={'center'} width={'100%'} justifyContent={'space-between'}>
                  {currency && (
                    <Flex alignItems={'center'}>
                      <CurrencyLogo currency={currency} size={'24px'} />
                      <Box pl={1}>
                        <TYPE.main className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
                          {(currency && currency.symbol && currency.symbol.length > 20
                            ? currency.symbol.slice(0, 4) +
                              '...' +
                              currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                            : getCurrencySymbol(currency, chainId)) || t('selectToken')}
                        </TYPE.main>
                      </Box>
                    </Flex>
                  )}

                  <StyledDropDown selected={!!currency} />
                </Flex>
              </CurrencySelect>
            )}
          </InputRow>
        </Container>
        {onCurrencySelect && (
          <CurrencySearchModal
            isOpen={modalOpen}
            onDismiss={handleDismissSearch}
            onCurrencySelect={onCurrencySelect}
            selectedCurrency={currency}
            otherSelectedCurrency={otherCurrency}
            tokens={tokens}
          />
        )}
      </InputPanel>
    </>
  )
}
