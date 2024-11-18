import { Currency, CurrencyAmount } from '@voltage-finance/sdk-core'
import React, { useCallback, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Flex } from 'rebass/styled-components'
import styled, { ThemeContext } from 'styled-components'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import fuseLogo from '../../assets/svg/logos/fuse-small-logo.svg'
import { useWeb3 } from '../../hooks'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { TYPE } from '../../theme'
import { getCurrencySymbol } from '../../utils'
import { InputPanel } from '../../wrappers/InputPanel'
import CurrencyLogo from '../Logo/CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { Input as NumericalInput } from '../NumericalInput'
import Percentage from '../PercentageInputPanel'
import Row, { RowBetween, RowCenter } from '../Row'
import CurrencySearchModal from '../../modals/SearchModal/CurrencySearchModal'
import { Pair } from '@voltage-finance/sdk'

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  margin: 0;
  height: 35%;
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.25rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size: 16px;
  font-weight: 400;
`

interface CurrencyInputPanelProps {
  value: string
  bridge?: boolean
  onUserInput: (value: string) => void
  onMax?: (res: string | number) => void
  showMaxButton: boolean
  label?: string
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  tokenAmount?: CurrencyAmount<Currency>
  disableCurrencySelect?: boolean
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  id: string
  showCommonBases?: boolean
  showETH?: boolean
  listType?: CurrencyListType
}

export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  label = 'Input',
  onCurrencySelect,
  currency,
  tokenAmount,
  disableCurrencySelect = false,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  otherCurrency,
  showCommonBases,
  showETH = true,
  listType = 'Swap',
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
        <TYPE.body
          // onClick={() => {
          //   if (onMax) onMax(1)
          // }}
          color={'white'}
          fontWeight={500}
          fontSize={15}
          style={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          {account && currency && !hideBalance && (
            <div style={{ paddingBottom: '8px' }}>
              Balance: {selectedCurrencyBalance ? selectedCurrencyBalance.toSignificant(6) : '-'}
            </div>
          )}
        </TYPE.body>
      )}
      <InputPanel>
        <Box>
          {!hideInput && (
            <Flex justifyContent={'space-between'}>
              <TYPE.body color={theme.white} fontWeight={500} fontSize={14}>
                {label}
              </TYPE.body>
              {showMaxButton && label !== 'To' && (
                <Box maxWidth={'225px'}>
                  <Percentage tokenAmount={tokenAmount} decimals={currency?.decimals} selectPercentage={onMax} />
                </Box>
              )}
            </Flex>
          )}
          <Flex mt={4}>
            {!hideInput && (
              <>
                <NumericalInput
                  className="token-amount-input"
                  value={value}
                  onUserInput={(val) => {
                    onUserInput(val)
                  }}
                />
              </>
            )}
            <Box
              variant="outline"
              px={2}
              py={1}
              className="open-currency-select-button"
              onClick={() => {
                if (!disableCurrencySelect) {
                  setModalOpen(true)
                }
              }}
            >
              <RowBetween>
                {showMaxButton || currency ? (
                  <Row>
                    {pair ? (
                      <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={24} margin={true} />
                    ) : currency ? (
                      <CurrencyLogo currency={currency} size={'24px'} />
                    ) : null}
                    {pair ? (
                      <StyledTokenName className="pair-name-container">
                        {pair?.token0.symbol}:{pair?.token1.symbol}
                      </StyledTokenName>
                    ) : (
                      <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
                        {(currency && currency.symbol && currency.symbol.length > 20
                          ? currency.symbol.slice(0, 4) +
                            '...' +
                            currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                          : getCurrencySymbol(currency, chainId)) || t('selectToken')}
                      </StyledTokenName>
                    )}
                  </Row>
                ) : (
                  <Flex alignItems={'center'}>
                    <img src={fuseLogo} alt="" width={22} />
                    <TYPE.body fontFamily={'Inter'} fontSize={16} fontWeight={400} style={{ margin: '0rem 0.25rem' }}>
                      FUSE
                    </TYPE.body>
                  </Flex>
                )}

                <RowCenter>{!disableCurrencySelect && <StyledDropDown selected={!!currency} />}</RowCenter>
              </RowBetween>
            </Box>
          </Flex>
        </Box>
        {!disableCurrencySelect && onCurrencySelect && (
          <CurrencySearchModal
            isOpen={modalOpen}
            onDismiss={handleDismissSearch}
            onCurrencySelect={onCurrencySelect}
            selectedCurrency={currency}
            otherSelectedCurrency={otherCurrency}
            showCommonBases={showCommonBases}
            showETH={showETH}
            listType={listType}
          />
        )}
      </InputPanel>
    </>
  )
}
