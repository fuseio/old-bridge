import styled from 'styled-components'
import { ExternalLink } from 'react-feather'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { Box, Button, Flex, Image } from 'rebass/styled-components'

import { Navbar } from '../Navbar'
import { useWeb3 } from '../../hooks'
import Web3Status from '../Web3Status'
import { isHomePage } from '../../utils'
import { Hidden } from '../../wrappers/Hidden'
import { WalletIcon, MenuNav } from '../Icons'
import { GetAppButton } from '../Button/getApp'
import { useToggleNavMenu } from '../../state/application/hooks'

import LogoIcon from '../../assets/svg/voltage.svg'
import LogoIconBlack from '../../assets/svg/voltage-black.svg'

const activeClassName = 'ACTIVE'

export const Ramp = styled.div<{ active: boolean }>`
  cursor: pointer;
  justify-content: space-evenly;
  display: flex;
  width: 80%;
  height: 48px;
  width: 100%;
 > main{
   display: none;
 }
  : hover{
    background: ${({ active }) => (active ? '#242637' : '#662a2a')}
    >main{
      display: ${({ active }) => (active ? 'none' : 'block')}
      position: absolute;
      right: 39px;
      top: 11px;
      background: ${({ active }) => (active ? '#242637' : '#662a2a')}
    }
  }
  > span {
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    display: flex;
    line-height: 41px;
    background: linear-gradient(90deg, #c2f6bf 0%, #f7fa9a 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  div {
    display: flex;
    img {
      margin: auto;
      margin-right: 10px;
    }
  }
`

export const MenuItem = styled.a`
  width: 100%;
  height: 48px;
  text-decoration: none;
  font-family: Inter;
  font-size: 16px;
  font-weight: 300;
  display: flex;
  flex-direction: column;
  .icon {
    stroke: white;
    stroke-width: 1;
  }
  .icon2 {
    stroke: white;
    stroke-width: 0;
  }
  color: ${({ theme }) => theme.white};
  :hover {
    cursor: pointer;
    text-decoration: none;
    background-color: rgba(17, 18, 25, 0.4);
  }
  &.${activeClassName} {
    color: white;
    background-color: ${({ theme }) => theme.secondary4};
    .icon {
      stroke-width: 2px;
    }
    .icon2 {
      stroke: white;
      stroke-width: 2px;
    }
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
  padding-left: 60px;
`};
`

export const MenuItemExternal = styled(ExternalLink)<{ pl?: string }>`
  width: 100%;
  height: 48px;
  text-decoration: none;
  font-family: Inter;
  font-size: 16px;
  font-weight: 300;
  padding-left: ${(props) => props.pl};
  display: flex;
  flex-direction: column;
  .icon {
    stroke: white;
    stroke-width: 1;
  }
  .icon2 {
    stroke: white;
    stroke-width: 0;
  }
  color: ${({ theme }) => theme.white};
  :hover {
    cursor: pointer;
    text-decoration: none;
    background-color: rgba(17, 18, 25, 0.4);
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
  padding-left: 60px;
`};
`

export const MenuItemWrapper = styled.div`
  display: flex;
  height: 100%
  align-items: center;
  overflow: hidden;
  width: 100%;
  height: 40px;
  margin-left: 40px;
`

export const Links = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 12px;
  padding-left: 24px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding-left: 60px;
  `}
`
export const Item = styled(ExternalLink)`
  color: #8f9197;
  padding: 4px 0;
  :hover {
    color: ${({ theme }) => theme.white};
    cursor: pointer;
    text-decoration: none;
  }
  :not(:last-child) {
    margin-right: 8px;
  }
`

export default function Sidebar() {
  const openNavMenu = useToggleNavMenu()
  const history = useHistory()
  const location = useLocation()

  const { account } = useWeb3()

  return (
    <Box
      alignItems={'center'}
      sx={{
        position: 'relative',
        zIndex: 20,
      }}
      height={80}
      bg={'transparent'}
    >
      <Flex justifyContent={'space-between'} px={3} height={'100%'} mx="auto" alignItems={'center'} as="nav">
        <Flex sx={{ position: 'relative' }} style={{ cursor: 'pointer' }} alignItems={'center'}>
          <Link to="/home">
            <Image width={125} src={isHomePage(location) ? LogoIcon : LogoIconBlack} />
          </Link>
        </Flex>

        <Hidden tablet mobile>
          <Box
            sx={{
              zIndex: 20,
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%,-50%)',
            }}
          >
            <Navbar />
          </Box>
        </Hidden>

        <Flex
          sx={{
            gap: '12px',
          }}
        >
          <Flex
            sx={{
              alignItems: 'center',
              gap: '12px',
              width: '100%',
            }}
          >
            <Box display={['none', 'flex']}>
              <GetAppButton isSmall variant={isHomePage(location) ? 'greenSecondary' : 'blackSecondary'} />
            </Box>

            <Web3Status />

            {/* {account ? (
              <Web3Status />
            ) : (
              <>
                <GetAppButton isSmall variant={isHomePage(location) ? 'greenSecondary' : 'blackSecondary'} />

                <Button
                  display={['none', 'block']}
                  variant={isHomePage(location) ? 'greenPrimary' : 'blackPrimary'}
                  onClick={() => {
                    history.push('/swap')
                  }}
                >
                  <Flex alignItems={'center'} style={{ gap: '10px', color: 'inherit' }}>
                    Start Trading
                    <WalletIcon />
                  </Flex>
                </Button>
                <Button
                  display={['block', 'none']}
                  variant={isHomePage(location) ? 'greenPrimary' : 'blackPrimary'}
                  onClick={() => {
                    history.push('/swap')
                  }}
                >
                  Trade
                </Button>
              </>
            )} */}

            <Box
              sx={{
                alignItems: 'center',
                gap: '12px',
                width: '100%',
              }}
              display={['flex', 'none']}
            >
              {account ? (
                <>
                  <GetAppButton isSmall variant={isHomePage(location) ? 'greenSecondary' : 'blackSecondary'} />

                  <Button
                    display={['none', 'block']}
                    variant={isHomePage(location) ? 'greenPrimary' : 'blackPrimary'}
                    onClick={() => {
                      history.push('/swap')
                    }}
                  >
                    <Flex alignItems={'center'} style={{ gap: '10px', color: 'inherit' }}>
                      Start Trading
                      <WalletIcon />
                    </Flex>
                  </Button>
                  <Button
                    display={['block', 'none']}
                    variant={isHomePage(location) ? 'greenPrimary' : 'blackPrimary'}
                    onClick={() => {
                      history.push('/swap')
                    }}
                  >
                    Trade
                  </Button>
                </>
              ) : (
                <></>
              )}
            </Box>
          </Flex>

          <Hidden desktop>
            <Flex
              py={3}
              justifyContent={'center'}
              onClick={() => {
                openNavMenu()
              }}
            >
              <MenuNav stroke={isHomePage(location) ? 'white' : 'black'} />
            </Flex>
          </Hidden>
        </Flex>
      </Flex>
    </Box>
  )
}
