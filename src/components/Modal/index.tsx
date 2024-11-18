import { useEffect, useRef } from 'react'
import { Box } from 'rebass/styled-components'
import { AnimatePresence, motion } from 'framer-motion'

interface ModalProps {
  isOpen: boolean
  onDismiss: () => void
  onClose: () => void
  height?: string
  width?: string
  children: React.ReactNode
}

/**
 * Needed to disable using tab to select elements in the background
 */
const trapFocus = (element) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const firstFocusableElement = focusableElements[0]
  const lastFocusableElement = focusableElements[focusableElements.length - 1]

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // shift + tab
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus()
          e.preventDefault()
        }
      } else {
        // tab
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus()
          e.preventDefault()
        }
      }
    }
  }

  element.addEventListener('keydown', handleKeyDown)

  // Return a cleanup function
  return () => {
    element.removeEventListener('keydown', handleKeyDown)
  }
}

export default function Modal({ isOpen, height, width, onDismiss, children }: ModalProps) {
  const modalRef = useRef(null)

  useEffect(() => {
    const body = document.body
    if (isOpen) {
      const cleanupFocusTrap = trapFocus(modalRef.current)
      body.style.overflow = 'hidden'

      return () => {
        cleanupFocusTrap()
        body.style.overflow = 'auto'
      }
    }
  }, [isOpen])

  return (
    <div ref={modalRef}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            onClick={() => {
              if (onDismiss) {
                onDismiss()
              }
            }}
            initial={{
              opacity: 0,
              height: '100vh',
              width: '100vw',
              zIndex: 9999,
              left: 0,
              top: 0,
              position: 'fixed',
              background: 'transparent',
            }}
            exit={{
              opacity: 0,
              display: 'none',
            }}
            animate={{
              opacity: 0.4,
              background: 'black',
            }}
          />
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
            <Box height={height} width={width}>
              {children}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
