import React from 'react'
import { Box } from 'rebass'
import { motion } from 'framer-motion'
import styled from 'styled-components'

import Footer from './Footer'
import { useWeb3 } from '../hooks'

export const Container = styled.div`
  height: 100%;
`

export const BodyWrapper = styled.div<{ justify?: boolean; minHeight?: string }>`
  margin: 0;
  min-height: ${({ minHeight }) => (minHeight ? minHeight : '90.5%')};

  width: 100%;
  display: flex;

  flex-direction: column;
  justify-content: ${({ justify }) => (justify ? 'center' : 'space-between')};
`

export const MobileNav = styled.div`
  display: block;
  @media (max-width: 1600) {
    display: none;
  }
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({
  maxWidth = 1200,
  height = 'fit-content',
  pt = 4,
  children,
}: {
  disableLoading?: boolean
  maxWidth?: number
  pt?: any
  children: React.ReactNode
  height?: number | string
}) {
  const { connecting } = useWeb3()

  return (
    <Box>
      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
        <Box
          sx={{
            position: 'relative',
            opacity: connecting ? 0.5 : '1',
            pointerEvents: connecting ? 'none' : 'all',
          }}
          maxWidth={maxWidth}
          pt={pt}
          // maxHeight={'fit-content'}
          // minHeight="calc(100vh - 80px)"
          height={height}
          px={3}
          mx="auto"
        >
          {children}
        </Box>
      </motion.main>
      <Box my={4}></Box>
      <Footer maxWidth={maxWidth} />
    </Box>
  )
}
