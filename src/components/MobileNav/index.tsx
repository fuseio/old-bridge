import { X } from 'react-feather'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Box, Flex, Image, Text } from 'rebass/styled-components'

import { includesPath } from '../../utils'
import { preset } from '../../theme/preset'
import { PRIMARY_MENU, SECONDARY_MENU } from '../../constants'
import { useNavMenuOpen, useToggleNavMenu } from '../../state/application/hooks'

import LogoIcon from '../../assets/svg/fusefi-wordmark.svg'

const itemVariants = {
  closed: {
    opacity: 0,
  },
  open: { opacity: 1 },
}

declare module 'framer-motion' {
  export interface AnimatePresenceProps {
    children?: React.ReactNode
  }
}

const isActive = ({ to, additional, location }) => {
  return location.pathname === to || includesPath(location, additional || [])
}
export default function MobileNav() {
  const navMenuOpen = useNavMenuOpen()
  const toggleNavMenu = useToggleNavMenu()

  const location = useLocation()

  return (
    <AnimatePresence>
      {navMenuOpen && (
        <motion.div
          onClick={() => toggleNavMenu()}
          initial={{
            opacity: 0,
            height: '100vh',
            width: '100vw',
            zIndex: 9999,
            left: 0,
            top: 0,
            position: 'fixed',

            backgroundColor: 'transparent',
          }}
          exit={{
            opacity: 0,
            display: 'none',
          }}
          animate={{
            opacity: 0.4,
            backgroundColor: 'black',
          }}
        ></motion.div>
      )}

      {navMenuOpen && (
        <motion.aside
          initial={{ width: 0 }}
          animate={{
            width: 300,
            top: 0,
            right: 0,
            position: 'fixed',
            zIndex: 9999999999999,
            height: '100%',
            minHeight: '100vh',
          }}
          exit={{
            width: 0,
            transition: { delay: 0, duration: 0.3 },
          }}
        >
          <Box
            bg="background"
            width={'100%'}
            height={'100%'}
            sx={{
              '*': {
                color: 'text',
              },
            }}
          >
            <Flex alignItems={'center'} px={3} py={3} justifyContent={'space-between'}>
              <Flex
                py={2}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  toggleNavMenu()
                }}
                alignItems={'center'}
              >
                <Link style={{ textDecoration: 'none' }} to="/home">
                  <Image width={[100, 125]} src={LogoIcon} />
                </Link>
              </Flex>

              <Flex
                py={2}
                width={60}
                justifyContent={'end'}
                onClick={() => {
                  toggleNavMenu()
                }}
              >
                <X size={30} />
              </Flex>
            </Flex>

            {PRIMARY_MENU.map(({ name, to, additional }, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Link style={{ textDecoration: 'none' }} to={to}>
                  <Flex
                    style={{ cursor: 'pointer' }}
                    height={50}
                    alignItems={'center'}
                    sx={{
                      bg: isActive({ additional, to, location }) ? preset.colors.gray : 'transparent',
                      color: isActive({ additional, to, location }) ? preset.colors.highlight : 'black',
                    }}
                    onClick={() => {
                      toggleNavMenu()
                    }}
                  >
                    <Text
                      px={3}
                      fontSize={2}
                      fontWeight={500}
                      style={{
                        opacity: location.pathname === to || includesPath(location, additional || []) ? '1' : '0.7',
                        cursor: 'pointer',
                      }}
                    >
                      {name}
                    </Text>
                  </Flex>
                </Link>
              </motion.div>
            ))}

            <Box mt={4} mb={3} variant={'border'} />

            {SECONDARY_MENU.map(({ name, to }, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Flex
                  style={{ cursor: 'pointer' }}
                  height={35}
                  alignItems={'center'}
                  onClick={() => {
                    toggleNavMenu()
                  }}
                >
                  <a target="_blank" style={{ textDecoration: 'none' }} href={to} rel="noreferrer">
                    <Text
                      px={3}
                      fontSize={2}
                      fontWeight={500}
                      color={'black'}
                      style={{
                        cursor: 'pointer',
                      }}
                    >
                      {name}
                    </Text>
                  </a>
                </Flex>
              </motion.div>
            ))}
          </Box>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
