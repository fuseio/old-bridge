import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect } from 'react'
import { ArrowLeft, X } from 'react-feather'
import { Box, Button } from 'rebass/styled-components'
import ModalActions from './Actions'
import ModalContent from './Content'
import ModalHeader from './Header'
import ModalSummary from './Summary'
import ModalText from './Text'

declare module 'framer-motion' {
  export interface AnimatePresenceProps {
    children?: React.ReactNode
  }
}

interface ModalLegacyProps {
  isOpen: boolean
  onDismiss: () => void
  onClose?: () => void
  height?: any
  width?: any
  onPrevious?: any
  // initialFocusRef?: React.RefObject<any>
  bg?: string
  pt?: number
  pb?: number
  navProps?: any
  children?: React.ReactNode | string
}

function ModalLegacy({
  isOpen,
  bg = 'white',
  pt = 2,
  pb = 3,
  onClose,
  onDismiss,
  height,
  width,
  navProps = {
    size: 20,
    color: 'black',
    opacity: 0.4,
  },
  children,
  onPrevious,
}: ModalLegacyProps) {
  useEffect(() => {
    if (isOpen) {
      document.getElementsByTagName('body')[0].style.overflow = 'hidden'
    } else {
      document.getElementsByTagName('body')[0].style.overflow = 'auto'
    }
  }, [isOpen])

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            onClick={() => onDismiss()}
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
      </AnimatePresence>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              zIndex: 9999,
              position: 'fixed',
              width: 'fit-content',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
              margin: '0 auto',
            }}
            exit={{
              opacity: 0,
              display: 'none',
            }}
            animate={{
              opacity: 1,
              transition: {
                duration: 0.7,
              },
            }}
          >
            <Box
              style={{ position: 'relative', overflow: 'hidden' }}
              height={height}
              width={width}
              variant={'outline'}
              bg={bg}
              pt={pt}
              pb={pb}
            >
              <Box>
                {onPrevious && (
                  <Button
                    variant={'icon'}
                    onClick={() => {
                      onPrevious()
                    }}
                    style={{ zIndex: 9999, cursor: 'pointer', position: 'absolute', left: '10px', top: '10px' }}
                  >
                    <ArrowLeft size={navProps.size} opacity={navProps.opacity} />
                  </Button>
                )}
                {onClose && (
                  <Button
                    variant={'icon'}
                    onClick={() => {
                      onClose()
                    }}
                    style={{ zIndex: 9999, cursor: 'pointer', position: 'absolute', right: '10px', top: '10px' }}
                  >
                    <X size={navProps.size} color={navProps.color} opacity={navProps.opacity} />
                  </Button>
                )}
                {React.Children.map(children, (child) => {
                  if (child) {
                    return React.cloneElement(child as React.ReactElement<any>, { _onPrevious: onPrevious })
                  }
                  return <div></div>
                })}
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

ModalLegacy.Header = ModalHeader
ModalLegacy.Content = ModalContent
ModalLegacy.Actions = ModalActions
ModalLegacy.Text = ModalText
ModalLegacy.Summary = ModalSummary

export default ModalLegacy
