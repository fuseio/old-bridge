import { useRef, useState } from "react"
import { Box, Button, ButtonProps, Flex, Image, Text } from "rebass/styled-components"
import { motion, AnimatePresence } from "framer-motion"
import { isMobile, isTablet } from 'react-device-detect'
import { Link } from 'react-router-dom'

import VoltQr from '../../assets/images/volt-qr.png'
import { useOnClickOutside } from "../../hooks/useOnClickOutside"
import { getDownloadLink } from "../../utils"

interface GetAppButtonProps extends ButtonProps {
  name?: string
  isSmall?: boolean
}

export const GetAppButton = ({ name = 'Get App', isSmall = false, ...props }: GetAppButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef()

  useOnClickOutside(ref, () => {
    setIsOpen(false)
  })

  return (
    <Box
      sx={{
        display: 'flex',
        position: 'relative',
        width: '100%',
        zIndex: 10
      }}
      ref={ref}
    >
      <Button
        onClick={() => setIsOpen(!isOpen)}
        display={isSmall ? ['none', 'block'] : 'block'}
        {...props}
      >
        {name}
      </Button>
      {isSmall && (
        <Button
          display={['block', 'none']}
          ml='auto'
          onClick={() => setIsOpen(!isOpen)}
          {...props}
        >
          App
        </Button>
      )}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: -15, x: '-50%', opacity: 0 }}
            animate={{ y: 0, x: '-50%', opacity: 1 }}
            exit={{ y: -15, x: '-50%', opacity: 0 }}
            transition={{
              ease: 'easeInOut',
              duration: 0.3
            }}
            style={{
              position: 'absolute',
              top: '150%',
              left: '50%',
              minWidth: '100%',
              height: '100%',
              zIndex: 9
            }}
          >
            <Flex
              sx={{
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                textAlign: 'center',
                backgroundColor: 'blk80',
                padding: '24px 24px 16px',
                borderRadius: '30px'
              }}
            >
              {(isMobile || isTablet) ? (
                <a href={getDownloadLink()} target="_blank" rel="noreferrer">
                  <Image
                    src={VoltQr}
                    alt={'Volt QR'}
                    sx={{
                      borderRadius: '12px'
                    }}
                  />
                </a>
              ) : (
                <Link to="/app">
                  <Image
                    src={VoltQr}
                    alt={'Volt QR'}
                    sx={{
                      borderRadius: '12px'
                    }}
                  />
                </Link>
              )}
              <Text color={'white'} fontWeight={'bold'} width={"max-content"} maxWidth={"100px"} as="p">
                Download Volt
              </Text>
            </Flex>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )
}
