import { Box, Button, Flex, Text } from 'rebass/styled-components'
import ModalLegacy from '../../components/ModalLegacy'

interface SettingsConfirmationModal {
  toggleExpertMode: () => void
  setOpen: any
  open: boolean
}

const SettingsConfirmationModal = ({ toggleExpertMode, setOpen, open }: SettingsConfirmationModal) => {
  return (
    <ModalLegacy width={[1, 430]} isOpen={open} onDismiss={() => setOpen(false)} onClose={() => setOpen(false)}>
      <ModalLegacy.Header>
        <Box>Expert Mode</Box>
      </ModalLegacy.Header>
      <ModalLegacy.Content>
        <Box my={2}></Box>
        <Flex flexDirection={'column'}>
          <Text lineHeight={1.4} fontSize={2}>
            Expert mode turns off the confirm transaction prompt and allows high slippage trades that often result in
            <Text mx={1} fontWeight={600} sx={{ display: 'inline' }}>
              bad rates
            </Text>
            and
            <Text mx={1} fontWeight={600} sx={{ display: 'inline' }}>
              lost funds.
            </Text>
          </Text>
        </Flex>
      </ModalLegacy.Content>
      <ModalLegacy.Actions>
        <Button
          mt={2}
          variant="secondary"
          width={'100%'}
          height={45}
          fontSize={2}
          onClick={() => {
            if (window.prompt(`Please type the word "confirm" to enable expert mode.`) === 'confirm') {
              toggleExpertMode()
              setOpen(false)
            }
          }}
        >
          Enable
        </Button>
      </ModalLegacy.Actions>
    </ModalLegacy>
  )
}

export default SettingsConfirmationModal
