import styled from 'styled-components'
import { Button, ButtonProps } from 'rebass/styled-components'

export const Base = styled.button<{
  maxWidth?: any
  marginTop?: any
  marginBottom?: any
  marginRight?: any
  pending?: any
  error?: any
  icon?: any

  compact?: boolean
  onClick?: any
  width?: string
  size?: number
}>`
  outline: none;
  border: 1px solid transparent;
  z-index: 1;
  border-radius: 5px;
  width: ${({ compact }) => (compact ? 'fit-content' : '100%')};
  padding: ${({ size }) => (size === 2 ? '10px 16px' : '12px 24px')};
  font-size: ${({ size }) => (size === 2 ? '14px' : '16px')};
  font-weight: 500;
  cursor: pointer;
  &:disabled {
    opacity: 0.6;
    pointer-events: none;
  }
  > * {
    user-select: none;
  }
`

export const ButtonPrimary = styled(Base)`
  background: #70e000;

  color: black;
`

export const ButtonSecondary = styled(Base)`
  background-color: rgb(14, 13, 17);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.5);
`

export const ButtonSwitchStyle = styled(Base)<{ active?: boolean }>`
  color: ${({ active }) => (active ? '#70E000' : 'rgba(255,255,255,0.7)')};
  border-bottom: ${({ active }) => (active ? 'solid 1px #70E000' : '1px solid rgb(64, 68, 79)')};
  background: #0e0d11;
  border-radius: 0px;
`

export const ButtonLink = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  text-decoration: underline;
  cursor: pointer;
  font-family: Inter;
  font-size: 18px;
  font-weight: 500;
  line-height: 22px;
  letter-spacing: 0px;
`

export function ButtonSwitch({
  active,
  minHeight = 50,
  fontSize = 2,
  children,
  ...rest
}: { fontSize?: number; minHeight?: number; disabled?: boolean; loading?: boolean; active?: boolean } & ButtonProps) {
  return (
    <Button
      fontSize={fontSize}
      minHeight={minHeight}
      sx={{
        width: '100%',
        background: 'transparent',
        color: 'white',
        borderRadius: '0px',
        borderBottom: active ? '2px solid white' : '2px solid white',
        opacity: active ? '1' : '0.6',
      }}
      {...rest}
      // disabled={disabled}
      // active={active}
    >
      {children}
    </Button>
  )
}
