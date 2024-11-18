import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Box, Card, Flex, Image, Text } from 'rebass'
import { AlertCircle, AlertTriangle, ChevronDown, ChevronUp, Power } from 'react-feather'

import NoSelect from '../../NoSelect'
import { useChains } from '../../../hooks'
import { preset } from '../../../theme/preset'
import { shortenAddress } from '../../../utils'
import { NetworkSelector } from '../NetworkSelector'
import { getChains } from '../../../constants/chains'
import { useWalletBalance, useWeb3 } from '../../../hooks'
import { useOnClickOutside } from '../../../hooks/useOnClickOutside'

export const AccountCenter = () => {
  const ref = useRef()
  const activeChain = useChains()
  const { account, chainId } = useWeb3()
  const [open, setOpen] = useState(false)
  const [chain, setChain] = useState({} as any)
  const { wallet, disconnectWallet } = useWeb3()
  const { tokenPrice, usdPrice } = useWalletBalance()

  useOnClickOutside(ref, () => {
    setOpen(false)
  })

  useEffect(() => {
    setChain(getChains().find(({ id }) => parseInt(id) === chainId))
  }, [chainId])

  return wallet ? (
    <Flex ref={ref} height={'100%'} sx={{ position: 'relative' }}>
      <Flex
        onClick={() => {
          setOpen(!open)
        }}
        px={3}
        py={2}
        sx={{
          borderRadius: 10,
          gap: 2,
          cursor: 'pointer',
          background: preset.colors.green500,
          '&:hover': {
            background: preset.colors.gray80,
          },
        }}
        alignItems={'center'}
        height={'100%'}
      >
        {!activeChain ? <AlertTriangle /> : <Image width={24} src={activeChain?.icon} />}

        <NoSelect>
          <Text fontWeight={600}>{account && shortenAddress(account, 5)}</Text>
        </NoSelect>

        {open ? (
          <ChevronUp style={{ marginBottom: '1px' }} size={20} />
        ) : (
          <ChevronDown style={{ marginBottom: '1px' }} size={20} />
        )}
      </Flex>

      {open && (
        <motion.div
          style={{ zIndex: 9999, position: 'absolute', top: 50, right: 0 }}
          initial={{
            opacity: 0,
          }}
          exit={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
            transition: {
              duration: 0.3,
            },
          }}
        >
          <Card
            bg="white"
            sx={{
              borderRadius: '12px',
              border: '1px solid #E1E1E1',
            }}
            width={300}
          >
            <Box px={3} py={20}>
              <Flex sx={{ gap: 2 }} flexDirection={'column'}>
                <Text fontSize={0} fontWeight={600} color={preset.colors.blk50}>
                  Connected Account
                </Text>
                <Text fontWeight={600}>{account && shortenAddress(account, 5)}</Text>
              </Flex>
            </Box>
            <Box sx={{ borderTop: `1px solid ${preset.colors.gray90}` }}></Box>
            <Box px={3} py={20}>
              <Flex sx={{ gap: 2 }} flexDirection={'column'}>
                <Text fontSize={0} fontWeight={600}>
                  Wallet
                </Text>
                <Flex sx={{ gap: 2 }} alignItems={'center'}>
                  {chain ? <Image width={40} src={chain?.icon} /> : <AlertCircle size={20} />}
                  <Flex sx={{ gap: 1 }} width={'100%'} flexDirection={'column'}>
                    <Flex width={'100%'} justifyContent={'space-between'}>
                      <Text fontSize={2} fontWeight={600}>
                        {chain?.token} Token
                      </Text>
                      <Text fontSize={2} fontWeight={600}>
                        {tokenPrice?.toFixed(5)}
                      </Text>
                    </Flex>
                    <Flex justifyContent={'space-between'}>
                      <Text fontSize={0} fontWeight={600}>
                        {chain?.token}
                      </Text>
                      <Text fontSize={0} fontWeight={600}>
                        ${usdPrice.toFixed(3)}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            </Box>

            <Box sx={{ borderTop: `1px solid ${preset.colors.gray90}` }}></Box>
            <NetworkSelector />
            <Box sx={{ borderTop: `1px solid ${preset.colors.gray90}` }}></Box>
            <Box px={3} py={20}>
              <Flex
                onClick={() => {
                  disconnectWallet(wallet)
                  setOpen(false)
                }}
                alignItems={'center'}
                sx={{ gap: 16, cursor: 'pointer' }}
                flexDirection={'row'}
              >
                <Power color={preset.colors.blk50} />
                <Text fontSize={2} fontWeight={600}>
                  Disconnect
                </Text>
              </Flex>
            </Box>
          </Card>
        </motion.div>
      )}
    </Flex>
  ) : (
    <Box></Box>
  )
}
