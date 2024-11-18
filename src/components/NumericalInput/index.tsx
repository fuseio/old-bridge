import React from 'react'
import styled from 'styled-components'
import { escapeRegExp } from '../../utils'
import { preset } from '../../theme/preset'

const StyledInput = styled.input<{
  error?: boolean
  fontSize?: string
  align?: string
  fontWeight?: number
  opacity?: number
  color?: string
  border?: string
  borderRadius?: string
  borderColor?: string
  height?: string
  paddingLeft?: string
}>`
  width: 100%;
  height: ${({ height }) => height || undefined};
  position: relative;
  font-weight: ${({ fontWeight }) => fontWeight || 500};
  outline: none;
  color: ${({ color }) => color || preset.colors.text};
  border: ${({ border }) => border || 'none'};
  border-radius: ${({ borderRadius }) => borderRadius || 'none'};
  border-color: ${({ borderColor }) => borderColor || 'none'};
  flex: 1 1 auto;
  background-color: transparent;
  font-size: ${({ fontSize }) => fontSize ?? '24px'};
  text-align: ${({ align }) => align && align};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0px;
  padding-left: ${({ paddingLeft }) => paddingLeft || undefined};
  -webkit-appearance: textfield;

  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  [type='number'] {
    -moz-appearance: textfield;
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  ::placeholder {
    opacity: ${({ opacity }) => opacity || 0.6};
    color: ${({ color }) => color || preset.colors.text};
  }
`

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group

function getDecimalAndNonDecimalCount(number) {
  // Convert the number to a string
  const numberString = number.toString()

  // Split the string into an array using the decimal point as the separator
  const parts = numberString.split('.')

  // Count the number of decimal places
  const decimalCount = parts.length > 1 ? parts[1].length : 0

  // Count the number of non-decimal places
  const nonDecimalCount = parts[0].replace('-', '').length

  return {
    decimalCount,
    nonDecimalCount,
  }
}

export const Input = React.memo(function InnerInput({
  value,
  onUserInput,
  placeholder,
  decimals = 18,
  fontSize,
  ...rest
}: {
  value: string | number
  onUserInput?: (input: string) => void
  error?: boolean
  fontSize?: string
  decimals?: number
  align?: 'right' | 'left'
  fontWeight?: number
  color?: string
  opacity?: number
  border?: string
  borderRadius?: string
  borderColor?: string
  height?: string
  paddingLeft?: string
} & Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onChange' | 'as'>) {
  const enforcer = (nextUserInput: string) => {
    if (onUserInput && (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput)))) {
      onUserInput(nextUserInput)
    }
  }

  return (
    <StyledInput
      {...rest}
      value={value}
      onChange={(event) => {
        // replace commas with periods, because FuseFi exclusively uses period as the decimal separator
        const { decimalCount, nonDecimalCount } = getDecimalAndNonDecimalCount(event.target.value)
        if (decimalCount <= decimals && nonDecimalCount <= 18) {
          enforcer(event.target.value.replace(/,/g, '.'))
        }
      }}
      fontSize={fontSize}
      // universal input options
      inputMode="decimal"
      title="Token Amount"
      autoComplete="off"
      autoCorrect="off"
      // text-specific options
      type="text"
      pattern="^[0-9]*[.,]?[0-9]*$"
      placeholder={placeholder || '0.0'}
      minLength={1}
      maxLength={55}
      spellCheck="false"
    />
  )
})

export default Input

// const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group
