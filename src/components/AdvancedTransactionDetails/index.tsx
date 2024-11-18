import React from 'react'
import { Card, Box } from 'rebass/styled-components'
import { RowBetween } from '../Row'
import { TYPE } from '../../theme'
import styled from 'styled-components'

interface Item {
  name: string
  value: string
}

interface AdvancedTransactionDetailsProps {
  show?: boolean
  items?: Array<Item>
}

const Wrapper = styled.div<{ show?: boolean }>`
  display: block;
  z-index: -1;
  transform: ${({ show }) => (show ? 'translateY(0%)' : 'translateY(-100%)')};
  transition: transform 300ms ease-in-out;
`

const AdvancedTransactionDetails = ({ show, items = [] }: AdvancedTransactionDetailsProps) => {
  return (
    <Wrapper show={show}>
      {show && <Box my={2}></Box>}
      <Card>
        <div style={{ display: 'flex', gap: '9px', flexDirection: 'column' }}>
          {items.map(({ name, value }, index) => (
            <RowBetween key={index} align="space-between" marginTop="0px">
              <TYPE.body>{name}</TYPE.body>
              <TYPE.body color={Number(value) > 0 ? 'green' : 'red'}>{value}</TYPE.body>
            </RowBetween>
          ))}
        </div>
      </Card>
    </Wrapper>
  )
}
export default AdvancedTransactionDetails
