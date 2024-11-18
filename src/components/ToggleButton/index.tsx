import { ReactNode } from 'react'
import { Button } from 'rebass/styled-components'

interface ToggleButtonProps {
  active: boolean
  onClick: (...args) => void
  children?: ReactNode
}

export default function ToggleButton({ active, onClick, children }: ToggleButtonProps) {
  return (
    <Button
      variant={'transparent'}
      bg={active ? 'gray70' : 'transparent'}
      fontSize={'14px'}
      fontWeight={600}
      color={'black'}
      style={{
        borderRadius: '23px',
        cursor: 'pointer'
      }}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}
