import { motion } from 'framer-motion'
import { Repeat } from 'react-feather'
import { useRef, useState } from 'react'
import { Box, Card, Flex, Image, Text } from 'rebass'

import NoSelect from '../../NoSelect'
import { preset } from '../../../theme/preset'
import { useChains, useWeb3 } from '../../../hooks'
import useAddChain from '../../../hooks/useAddChain'
import { CHAIN_MAP, getChains } from '../../../constants/chains'
import { useOnClickOutside } from '../../../hooks/useOnClickOutside'

export const NetworkSelector = () => {
  const ref = useRef()
  const { wallet } = useWeb3()
  const activeChain = useChains()
  const { addChain } = useAddChain()
  const [open, setOpen] = useState(false)

  useOnClickOutside(ref, () => {
    setOpen(false)
  })

  return wallet ? (
    <Flex ref={ref} height={'100%'} sx={{ position: 'relative' }}>
      <Box px={3} py={20}>
        <Flex
          onClick={() => {
            setOpen(!open)
          }}
          alignItems={'center'}
          sx={{ gap: 16, cursor: 'pointer' }}
          flexDirection={'row'}
        >
          <Repeat color={preset.colors.blk50} />
          <Text fontSize={2} fontWeight={600}>
            Switch Network
          </Text>
        </Flex>
      </Box>

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
            width={200}
          >
            <Flex sx={{ gap: 3 }} flexDirection={'column'} px={3} py={3}>
              {getChains()
                .filter(({ id }) => id !== activeChain?.id)
                .map((chain, index) => (
                  <Flex
                    onClick={() => {
                      addChain(CHAIN_MAP[Number(chain?.id)])
                    }}
                    sx={{ cursor: 'pointer' }}
                    alignItems={'center'}
                    justifyContent={'space-between'}
                    key={index}
                  >
                    <Flex sx={{ gap: 3, cursor: 'pointer' }} alignItems={'center'}>
                      <Image width={32} src={chain?.icon} />
                      <NoSelect>
                        <Text fontSize={'16px'} fontWeight={600}>
                          {chain && chain?.token}
                        </Text>
                      </NoSelect>
                    </Flex>
                  </Flex>
                ))}
            </Flex>
          </Card>
        </motion.div>
      )}
    </Flex>
  ) : (
    <Box></Box>
  )
}
