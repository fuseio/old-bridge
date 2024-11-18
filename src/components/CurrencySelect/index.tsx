import { useState } from 'react'

import CurrencyDropdown from '../../wrappers/CurrencyInputDropdown/Dropdown'
import CurrencySearchModal from '../../modals/SearchModal/CurrencySearchModal'

interface CurrencySelectProps {
  showETH?: boolean
  onlyInput?: boolean
  tokenAddress: string
  selectedCurrency: any
  showCommonBases?: boolean
  asDefaultSelect?: boolean
  listType: CurrencyListType
  onCurrencySelect: (token: any) => void
}

export const CurrencySelect = ({
  showETH,
  onlyInput = false,
  tokenAddress,
  selectedCurrency,
  showCommonBases,
  asDefaultSelect,
  listType,
  onCurrencySelect,
}: CurrencySelectProps) => {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
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
      />

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
    </>
  )
}
