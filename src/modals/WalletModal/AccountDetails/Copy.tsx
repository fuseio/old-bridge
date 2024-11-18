import React from 'react'
import { Copy } from 'react-feather'
import { Flex } from 'rebass/styled-components'
import styled from 'styled-components'
import useCopyClipboard from '../../../hooks/useCopyClipboard'
import { LinkStyledButton, TYPE } from '../../../theme'
const CopyIcon = styled(LinkStyledButton)<{ color?: string; fontSize?: string; paddingLeft?: string }>`
  color: ${({ theme, color }) => color || theme.text3};
  flex-shrink: 0;
  display: flex;
  text-decoration: none;
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '0.825rem')};
  ${({ paddingLeft }) => `padding-left: ${paddingLeft}`};
  :hover,
  :active,
  :focus {
    text-decoration: none;
    color: ${({ theme, color }) => color || theme.text2};
  }
`

export default function CopyHelper(props: {
  toCopy: string
  children?: React.ReactNode
  color?: string
  fontSize?: string
  paddingLeft?: string
}) {
  const [isCopied, setCopied] = useCopyClipboard()

  return (
    <CopyIcon
      onClick={() => setCopied(props.toCopy)}
      color={props.color}
      fontSize={props.fontSize}
      paddingLeft={props.paddingLeft}
    >
      {isCopied ? (
        <Flex style={{ gap: '8px' }}>
          <Copy size={'16'} />
          <TYPE.subHeader>Copied</TYPE.subHeader>
        </Flex>
      ) : (
        <Flex style={{ gap: '8px' }}>
          <Copy size={'16'} />
          {props.children}
        </Flex>
      )}
    </CopyIcon>
  )
}
