import styled from 'styled-components'
import React, { useCallback, useState } from 'react'

interface TooltipProps {
  text: string
  children: React.ReactNode
}

const TooltipContainer = styled.div`
  position: relative;
  cursor: pointer;
`
const TooltipText = styled.div`
  position: absolute;
  left: 150%;
  background-color: black;
  color: #fff;
  text-align: center;
  padding: 7px 7px;
  border-radius: 6px;
  font-size: 12px;
  width: 120px;
  z-index: 1;
  transition: opacity 0.3s;
  font-weight: 500;
`

export const InfoTooltip = ({ children, text }: TooltipProps) => {
  const [show, setShow] = useState(false)
  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])
  return (
    <TooltipContainer onMouseEnter={open} onMouseLeave={close}>
      <TooltipText style={{ display: show ? 'block' : 'none' }}>{text}</TooltipText>
      {children}
    </TooltipContainer>
  )
}
