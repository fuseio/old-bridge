import React from 'react'
import { Text } from 'rebass/styled-components'
import styled from 'styled-components'
import ModalLegacy from '../../components/ModalLegacy'

export const HeaderText = styled.div`
  color: #fff;
  align-self: center;
  color: lightgray;
`

export const Header = styled.div`
  border-radius: 8px 8px 0 0;
  display: flex;
  justify-content: space-between;
`

export const Content = styled.div`
  padding-bottom: 15px;
  max-height: 30rem;
  overflow-x: hidden;
  overflow-y: auto;
  color: #b5b9d3;

  > h1 {
    font-size: 24px;
    font-weight: 600;
    text-align: left;
  }
  > p {
    font-size: 16px;
    font-weight: 400;
    text-align: left;
  }
`

export const StyledModal = styled.div`
  z-index: 100;
  padding: 24px;
  background: #242637;
  position: relative;
  margin: auto;
  border-radius: 12px;
`
const FarmInfoModal = ({
  isOpen,
  setOpen,
  title,
  content
}: {
  isOpen: boolean
  setOpen: any
  title: string
  content: string
}) => (
  <ModalLegacy
    isOpen={isOpen}
    width={440}
    onClose={() => {
      setOpen(false)
    }}
    onDismiss={() => {
      setOpen(false)
    }}
  >
    <ModalLegacy.Header>{`What does "${title}" mean?`}</ModalLegacy.Header>
    <ModalLegacy.Content>
      <Text>{content}</Text>
    </ModalLegacy.Content>
  </ModalLegacy>
)
export default FarmInfoModal
