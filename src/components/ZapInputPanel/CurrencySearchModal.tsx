import { Currency } from '@voltage-finance/sdk-core'
import { useCallback, useEffect, useState } from 'react'
import useLast from '../../hooks/useLast'
import ModalLegacy from '../ModalLegacy'
import { CurrencySearch } from './CurrencySearch'

interface CurrencySearchModalProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherSelectedCurrency?: Currency | null
}

export default function CurrencySearchModal({ isOpen, onDismiss, onCurrencySelect }: CurrencySearchModalProps) {
  const [listView, setListView] = useState<boolean>(false)
  const lastOpen = useLast(isOpen)

  useEffect(() => {
    if (isOpen && !lastOpen) {
      setListView(false)
    }
  }, [isOpen, lastOpen])

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency)
      onDismiss()
    },
    [onDismiss, onCurrencySelect]
  )

  return (
    <ModalLegacy isOpen={isOpen} onClose={onDismiss} onDismiss={onDismiss} height={listView ? 40 : 'auto'}>
      <ModalLegacy.Header>Select a Token</ModalLegacy.Header>
      <CurrencySearch isOpen={isOpen} onCurrencySelect={handleCurrencySelect} />
    </ModalLegacy>
  )
}
