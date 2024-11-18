import { Input } from '@rebass/forms'
import { useEffect, useRef, useState } from 'react'
import { Box, Flex, Text } from 'rebass/styled-components'

import Toggle from '../../../components/Toggle'
import { useToggleSettingsMenu } from '../../../state/application/hooks'
import SettingsConfirmationModal from '../../../modals/SettingsConfirmationModal'
import {
  useExpertModeManager,
  useUserActionHandlers,
  useUserDeadline,
  useUserSlippageTolerance,
  useUserState,
} from '../../../state/user/hooks'
import ToggleButton from '../../../components/ToggleButton'
import { basisPointsToPercent } from '../../../utils'

enum SlippageError {
  InvalidInput = 'InvalidInput',
  RiskyLow = 'RiskyLow',
  RiskyHigh = 'RiskyHigh',
}

enum DeadlineError {
  InvalidInput = 'InvalidInput',
}

export default function SwapSettings() {
  const inputRef = useRef<HTMLInputElement>()
  const [customSlippage, setCustomSlippage] = useUserSlippageTolerance()
  const [deadline, setDeadline] = useUserDeadline()

  const [slippageInput, setSlippageInput] = useState(basisPointsToPercent(customSlippage).toSignificant())
  const [deadlineInput, setDeadlineInput] = useState('')
  const [expertMode, toggleExpertMode] = useExpertModeManager()
  const [showConfirmation, setShowConfirmation] = useState(false)

  const toggle = useToggleSettingsMenu()
  const { updateUserAutoSlippageMode } = useUserActionHandlers()
  const { autoSlippageMode } = useUserState()

  const deadlineInputIsValid = deadlineInput === '' || (deadline / 60).toString() === deadlineInput

  function parseCustomSlippage(value: string) {
    try {
      // Check if the value is a valid number
      const parsedValue = Number(value)
      if (isNaN(parsedValue)) {
        throw new Error('Invalid number')
      }

      // Check if the value has at most two decimal places
      const decimalIndex = value.indexOf('.')
      if (decimalIndex !== -1 && value.length - decimalIndex - 1 > 2) {
        throw new Error('Value has more than two decimal places')
      }

      // Ensure the value is not less than 0.01 or exactly 0
      if (parsedValue >= 0.01 || parsedValue === 0) {
        // Set the slippage input
        setSlippageInput(value)
      } else {
        throw new Error('Value must be at least 0.01')
      }
    } catch (err) {
      console.error(`parseCustomSlippage: Failed to parse slippage value ${value}: ${err}`)
    }
  }

  function parseCustomDeadline(value: string) {
    setDeadlineInput(value)

    try {
      const valueAsInt: number = Number.parseInt(value) * 60
      if (!Number.isNaN(valueAsInt) && valueAsInt > 0) {
        setDeadline(valueAsInt)
      }
    } catch {}
  }

  useEffect(() => {
    const parsedSlippage = Math.floor(Number(slippageInput) * 100)
    setCustomSlippage(parsedSlippage)
  }, [setCustomSlippage, slippageInput])

  let slippageError: SlippageError | undefined
  if (slippageInput !== '' && isNaN(parseFloat(slippageInput))) {
    slippageError = SlippageError.InvalidInput
  } else if (parseFloat(slippageInput) < 0.5) {
    slippageError = SlippageError.RiskyLow
  } else if (parseFloat(slippageInput) > 10) {
    slippageError = SlippageError.RiskyHigh
  } else {
    slippageError = undefined
  }

  let deadlineError: DeadlineError | undefined
  if (deadlineInput !== '' && !deadlineInputIsValid) {
    deadlineError = DeadlineError.InvalidInput
  } else {
    deadlineError = undefined
  }

  return (
    <Box minHeight={'auto'}>
      <SettingsConfirmationModal
        toggleExpertMode={toggleExpertMode}
        open={showConfirmation}
        setOpen={setShowConfirmation}
      />

      <Box px={3}>
        <Text color="blk70" fontSize={1}>
          Slippage Tolerance
        </Text>

        <Box py={1} />

        <Flex style={{ gap: '8px' }}>
          <ToggleButton active={autoSlippageMode} onClick={() => updateUserAutoSlippageMode(true)}>
            Auto
          </ToggleButton>

          <ToggleButton active={!autoSlippageMode} onClick={() => updateUserAutoSlippageMode(false)}>
            Custom
          </ToggleButton>

          {!autoSlippageMode && (
            <Box width={80} fontSize={1} variant="outline" style={{ borderRadius: '24px' }}>
              <Flex alignItems={'center'} paddingX={1}>
                <Input
                  ref={inputRef as any}
                  placeholder={'0'}
                  value={slippageInput}
                  style={{ border: 'none' }}
                  fontWeight={600}
                  onChange={(e) => parseCustomSlippage(e.target.value)}
                />
                <Box mr={2} fontSize={1} opacity={0.6}>
                  %
                </Box>
              </Flex>
            </Box>
          )}
        </Flex>

        <Box py={1} />

        {!!slippageError && !autoSlippageMode && (
          <Text
            fontSize={0}
            style={{
              color: slippageError === SlippageError.InvalidInput ? 'red' : '#F3841E',
            }}
          >
            {slippageError === SlippageError.InvalidInput
              ? 'Enter a valid slippage percentage'
              : slippageError === SlippageError.RiskyLow
              ? 'Your transaction may fail'
              : slippageError === SlippageError.RiskyHigh
              ? 'Your transaction may be frontrun and result in an unfavorable trade.'
              : ''}
            {}
          </Text>
        )}
        <Box py={2} marginBottom={2}></Box>

        <Text color="blk70" fontSize={1}>
          Transaction Deadline
        </Text>
        <Box py={1}></Box>

        <Flex flexDirection={'row'} alignItems={'center'} style={{ gap: '4px' }}>
          <Box fontSize={1} variant="outline" style={{ borderRadius: '24px' }}>
            <Flex alignItems={'center'} paddingX={1}>
              <Input
                width={110}
                onBlur={() => {
                  parseCustomDeadline((deadline / 60).toString())
                }}
                style={{ border: 'none' }}
                fontWeight={600}
                placeholder={(deadline / 60).toString()}
                value={deadlineInput}
                onChange={(e) => parseCustomDeadline(e.target.value)}
              />
              <Box mr={2} fontSize={0} opacity={0.6}>
                Mins
              </Box>
            </Flex>
          </Box>
        </Flex>

        <Box py={1} marginBottom={2} />

        {deadlineError && (
          <Text
            fontSize={0}
            style={{
              color: deadlineError === DeadlineError.InvalidInput ? 'red' : '#F3841E',
            }}
          >
            {deadlineError === DeadlineError.InvalidInput && 'Enter a valid transaction deadline'}
          </Text>
        )}
      </Box>

      <Flex px={3} pt={3} sx={{ gap: 2 }} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <Flex sx={{ gap: 1 }}>
          <Text color="blk70" fontSize={14}>
            Expert Mode:
          </Text>

          <Text fontWeight={600} fontSize={1}>
            {expertMode ? 'Enabled' : 'Disabled'}
          </Text>
        </Flex>

        <Toggle
          id="toggle-expert-mode-button"
          isActive={expertMode}
          toggle={
            expertMode
              ? () => {
                  toggleExpertMode()
                  setShowConfirmation(false)
                }
              : () => {
                  toggle()
                  setShowConfirmation(true)
                }
          }
        />
      </Flex>
    </Box>
  )
}
