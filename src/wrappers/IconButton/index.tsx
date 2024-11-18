import { Text, Flex } from 'rebass/styled-components'

import { Twitter } from 'react-feather'

export const IconButton = ({
  to,
  onClick,
  content = '',
  Icon = Twitter,
}: {
  content: any
  onClick?: any
  to?: string
  Icon?: any
}) => {
  if (onClick) {
    return (
      <Flex
        alignItems={'center'}
        width={'fit-content'}
        sx={{
          gap: 2,
          borderRadius: '9999px',
          cursor: 'pointer',
          ':hover': {
            opacity: 0.7,
          },
        }}
        onClick={onClick}
        backgroundColor={'gray70'}
        px={3}
        py={2}
      >
        <Icon
          style={{
            fill: 'black',
            height: '14px',
            width: '14px',
          }}
          size={14}
        />
        <Text lineHeight={1.4} fontSize={0} fontWeight={600}>
          {content}
        </Text>
      </Flex>
    )
  }
  return (
    <a href={to} style={{ textDecoration: 'none' }} target="_blank" rel="noreferrer">
      <Flex
        alignItems={'center'}
        width={'fit-content'}
        sx={{
          gap: 2,
          borderRadius: '9999px',
          cursor: 'pointer',
          ':hover': {
            opacity: 0.7,
          },
        }}
        backgroundColor={'gray70'}
        px={3}
        py={2}
      >
        <Icon
          style={{
            fill: 'black',
            height: '14px',
            width: '14px',
          }}
          size={14}
        />
        <Text lineHeight={1.4} fontSize={0} fontWeight={600}>
          {content}
        </Text>
      </Flex>
    </a>
  )
}
