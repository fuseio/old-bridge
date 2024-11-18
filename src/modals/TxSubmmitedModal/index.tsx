import ModalLegacy from '../../components/ModalLegacy'
import Submitted from '../TransactionModalLegacy/Submitted'

const TxHashSubmmitedModal = ({ txHash, setTxHash, currency }: { txHash: any; setTxHash: any; currency?: any }) => {
  return (
    <ModalLegacy
      isOpen={txHash}
      onDismiss={() => {
        setTxHash(null)
      }}
      onClose={() => {
        setTxHash(null)
      }}
    >
      <ModalLegacy.Content>
        <Submitted
          currency={currency}
          onClose={() => {
            setTxHash(null)
          }}
          hash={txHash}
        />
      </ModalLegacy.Content>
    </ModalLegacy>
  )
}

export default TxHashSubmmitedModal
