import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'react-feather'
import { Flex, Text } from 'rebass/styled-components'

import { preset } from '../../../theme/preset'
import { Hidden } from '../../../wrappers/Hidden'

const CardLink = ({
  pt = 2,
  to,
  color = 'primary',
  onClick,
  children,
  target,
  wrapperStyle = {},
  fontSize = 2,
}: {
  pt?: number
  to?: any
  color?: string
  onClick?: any
  children: any
  target?: string
  wrapperStyle?: object
  fontSize?: any
}) => {
  const Wrapper = ({ children }) => {
    return target ? (
      <a href={to} target="_blank" style={{ textDecoration: 'none', ...wrapperStyle }} rel="noreferrer">
        {children}
      </a>
    ) : (
      <Link to={to} style={{ textDecoration: 'none', ...wrapperStyle }}>
        {children}
      </Link>
    )
  }

  return (
    <Wrapper>
      <Flex
        onClick={onClick}
        pt={pt}
        alignItems={'center'}
        sx={{
          gap: [1],
          cursor: 'pointer',
          ':hover': {
            opacity: 0.7,
          },
        }}
      >
        <Text fontSize={fontSize} color={color} fontWeight={700}>
          {children}
        </Text>

        <Hidden tablet={true} desktop={true}>
          <Flex alignItems={'center'}>
            <ArrowUpRight color={preset.colors[color]} size={12} />
          </Flex>
        </Hidden>

        <Hidden mobile={true}>
          <Flex alignItems={'center'}>
            <ArrowUpRight color={preset.colors[color]} size={20} />
          </Flex>
        </Hidden>
      </Flex>
    </Wrapper>
  )
}
export default CardLink
