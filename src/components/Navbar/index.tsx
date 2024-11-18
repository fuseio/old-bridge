import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { Box, Card, Flex, Text } from 'rebass/styled-components'
import { MENU } from '../../constants'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'

export const Navbar = () => {
  const [activeIndex, setActiveIndex] = useState(-1)
  const location = useLocation()
  const history = useHistory()
  const ref = useRef()

  const includesPath = (location: any, paths: string[]) => {
    for (const path of paths) {
      if (location.pathname.includes(path)) {
        return true
      }
    }
    return false
  }

  useOnClickOutside(ref, () => {
    setActiveIndex(-1)
  })

  return (
    <Flex ref={ref} sx={{ gap: 2 }} justifyContent={'space-between'} alignItems={'center'} height={'100%'} width={400}>
      {MENU.map(({ to, sub, name, Icon }, index) => {
        return (
          <Box
            py={3}
            onMouseEnter={() => {
              setActiveIndex(index)
            }}
            onMouseLeave={() => {
              setActiveIndex(-1)
            }}
            key={index}
          >
            <Box
              px={3}
              py={Icon ? '4px' : 2}
              sx={{
                position: 'relative',
                cursor: 'pointer',
                borderRadius: 'default',
                color: activeIndex === index ? '#333333' : 'black',
                transition: 'background 50ms ease-in-out',
                background:
                  activeIndex === index ||
                    sub?.map(({ to }) => to).includes(location?.pathname) ||
                    to === location?.pathname ||
                    sub?.some(({ additional }: any) => includesPath(location, additional || []))
                    ? 'white'
                    : 'transparent',
              }}
              onClick={() => {
                if (to) {
                  history.push(to)
                }
                if (index === activeIndex) {
                  return setActiveIndex(-1)
                }
              }}
            >
              {(
                <Flex alignItems="center">
                  <Text fontSize={2} color="black" fontWeight={700}>
                    {name}
                  </Text>
                  {
                    Icon ? <Box mt={1} ml={0}>
                      <Icon scale={0.5} width={20} height={20} color="black" opacity={0.5} />
                    </Box> : null
                  }

                </Flex>
              )}

              {sub && activeIndex === index && (
                <motion.div
                  style={{ zIndex: 9999, position: 'absolute', left: 0 }}
                  initial={{
                    opacity: 0,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                    transition: {
                      duration: 0,
                    },
                  }}
                >
                  <Card
                    px={3}
                    py={3}
                    style={{
                      borderRadius: '12px',
                      border: '1px solid #222222',
                    }}
                    mt={3}
                    width={200}
                    backgroundColor="#333333"
                  >
                    <Flex sx={{ gap: 2 }} flexDirection={'column'}>
                      {sub.map(({ name, to }, index) => (
                        <Text
                          py="10px"
                          px={3}
                          fontWeight={600}
                          fontSize={2}
                          sx={{
                            transition: 'all 50ms ease-in-out',
                            color: 'white',
                            ':hover': {
                              //color: 'blk50',
                              background: '#222222',
                              borderRadius: '10px'
                            },
                          }}
                          onClick={() => {
                            if (to.includes('http')) {
                              window.open(to, '_blank')
                            } else {
                              history.push(to)
                            }
                            setActiveIndex(-1)
                          }}
                          key={index}
                        >
                          {name}
                        </Text>
                      ))}
                    </Flex>
                  </Card>
                </motion.div>
              )}
            </Box>
          </Box>
        )
      })}
    </Flex>
  )
}
