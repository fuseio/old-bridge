import { useCallback } from 'react'
import { Currency } from '@voltage-finance/sdk-core'

import { CurrencySearch } from './CurrencySearch'
import ModalLegacy from '../../components/ModalLegacy'

interface CurrencySearchModalProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherSelectedCurrency?: Currency | null
  showCommonBases?: boolean
  showETH: boolean
  listType?: CurrencyListType
}

export default function CurrencySearchModal({
  isOpen,
  onDismiss,
  onCurrencySelect,
  selectedCurrency,
  otherSelectedCurrency,
  showETH,
  showCommonBases = true,
  listType = 'Swap',
}: CurrencySearchModalProps) {
  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency)
      onDismiss()
    },
    [onDismiss, onCurrencySelect]
  )

  return (
    <ModalLegacy isOpen={isOpen} onClose={onDismiss} onDismiss={onDismiss}>
      <ModalLegacy.Content px={0}>
        <CurrencySearch
          isOpen={isOpen}
          onDismiss={onDismiss}
          onCurrencySelect={handleCurrencySelect}
          selectedCurrency={selectedCurrency}
          otherSelectedCurrency={otherSelectedCurrency}
          showCommonBases={showCommonBases}
          showETH={showETH}
          listType={listType}
        />
      </ModalLegacy.Content>
    </ModalLegacy>
  )
}
