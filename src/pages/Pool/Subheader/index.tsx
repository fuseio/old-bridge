import { ChevronDown } from 'react-feather'
import { useState, useRef, useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Box, Button, Card, Flex, Text } from 'rebass/styled-components'

import useAnalytics from '../../../hooks/useAnalytics'

export default function PoolPageSubheader() {
  const history = useHistory()
  const { sendEvent } = useAnalytics()
  const [IsCreateDropdownVisible, setIsCreateDropdownVisible] = useState(false)
  const [IsMoreDropdownVisible, setIsMoreDropdownVisible] = useState(false)

  const createRef = useRef<HTMLDivElement>()
  const moreRef = useRef<HTMLDivElement>()

  useEffect(() => {
    function handleClickOutside(event) {
      if (!createRef.current && !moreRef.current) {
        return
      }

      if (createRef.current && !createRef.current.contains(event.target)) {
        setIsCreateDropdownVisible(false)
      }

      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setIsMoreDropdownVisible(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [createRef, moreRef])

  const createPositionDropdown = IsCreateDropdownVisible && (
    <Box ref={createRef} sx={{ position: 'relative' }} width={['120%']}>
      <Card
        bg="secondary"
        px={3}
        py={3}
        sx={{
          position: 'absolute',
          left: '0px',
          width: '100%',
          top: ['2px', 0],
          borderRadius: '12px',
          border: '1px solid #E1E1E1',
          zIndex: 10,
        }}
      >
        <Flex sx={{ gap: 3 }} fontWeight={600} flexDirection={'column'}>
          <Link
            to={'/add/0x0be9e53fd7edac9f859882afdda116645287c629/0xa722c13135930332eb3d749b2f0906559d2c5b99'}
            style={{ textDecoration: 'none' }}
          >
            <Text sx={{ ':hover': { opacity: 0.7 } }} color={'white'} fontSize={1}>
              Create V2 Pool
            </Text>
          </Link>

          <Link
            to={
              'add/0x28c3d1cd466ba22f6cae51b1a4692a831696391a/0x68c9736781e9316ebf5c3d49fe0c1f45d2d104cd?version=v3&feeAmount=100'
            }
            style={{ textDecoration: 'none' }}
          >
            <Text sx={{ ':hover': { opacity: 0.7 } }} color={'white'} fontSize={1}>
              Create V3 Pool
            </Text>
          </Link>
        </Flex>
      </Card>
    </Box>
  )

  const moreActionsDropdown = IsMoreDropdownVisible && (
    <Box ref={moreRef} sx={{ position: 'relative' }} width={['105%']}>
      <Card
        bg="white"
        px={3}
        py={3}
        sx={{
          zIndex: 10,
          left: '0px',
          width: '100%',
          top: ['2px', 0],
          borderRadius: '12px',
          position: 'absolute',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Flex sx={{ gap: 3 }} fontWeight={600} flexDirection={'column'}>
          <Link to={'zap'} style={{ textDecoration: 'none' }}>
            <Text sx={{ ':hover': { opacity: 0.7 } }} color={'secondary'} fontSize={1}>
              Zap
            </Text>
          </Link>

          <Link to={'mint'} style={{ textDecoration: 'none' }}>
            <Text sx={{ ':hover': { opacity: 0.7 } }} color={'secondary'} fontSize={1}>
              Mint fUSDV3
            </Text>
          </Link>
        </Flex>
      </Card>
    </Box>
  )

  return (
    <Flex flexDirection="column">
      <Text pt={2} pb={4} width={['100%', '523px']}>
        When you add liquidity to a pool, you can receive a share of its trading volume and potentially snag extra
        rewards when there are incentives involved!
      </Text>

      <Flex flexDirection={'row'} width="100%">
        <Box width={['100%', 'auto']} mr={[2, 0]}>
          <Button
            width={['100%', '160px', '160px']}
            sx={{
              color: 'white',
              backgroundColor: 'secondary',
              ':hover': {
                color: 'white',
                backgroundColor: 'secondary',
                outline: 'none',
              },
            }}
            onClick={() => {
              sendEvent('Select Create New Pool')
              setIsCreateDropdownVisible(!IsCreateDropdownVisible)
              setIsMoreDropdownVisible(false)
            }}
          >
            Create a position
          </Button>
          {createPositionDropdown}
        </Box>

        <Flex width={['100%', 'auto']} justifyContent={['center', 'flex-end']} flexWrap="wrap">
          <Box width={['100%', 'auto']} sx={{ display: ['block', 'none'] }}>
            <Button
              variant="outline"
              width="100%"
              sx={{
                color: 'secondary',
                backgroundColor: 'transparent',
                ':hover': {
                  outline: '1px solid #333333',
                  border: 'none',
                  color: 'secondary',
                  backgroundColor: 'transparent',
                },
              }}
              onClick={() => {
                sendEvent('Select Create New Pool')
                setIsMoreDropdownVisible(!IsMoreDropdownVisible)
                setIsCreateDropdownVisible(false)
              }}
            >
              <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
                More Actions
                <ChevronDown />
              </Flex>
            </Button>
            {moreActionsDropdown}
          </Box>

          <Box width={['100%', 'auto']} mb={[2, 0]} mx={3} sx={{ display: ['none', 'block'] }}>
            <Button
              variant="outline"
              width={['100%', '160px', '160px']}
              sx={{
                color: 'secondary',
                backgroundColor: 'transparent',
                ':hover': {
                  outline: '1px solid #333333',
                  border: 'none',
                  color: 'secondary',
                  backgroundColor: 'transparent',
                },
              }}
              onClick={() => {
                history.push('/zap')
              }}
            >
              Zap
            </Button>
          </Box>

          <Box width={['100%', 'auto']} mb={[2, 0]} sx={{ display: ['none', 'block'] }}>
            <Button
              variant="outline"
              width={['100%', '160px', '160px']}
              sx={{
                color: 'secondary',
                backgroundColor: 'transparent',
                ':hover': {
                  outline: '1px solid #333333',
                  border: 'none',
                  color: 'secondary',
                  backgroundColor: 'transparent',
                },
              }}
              onClick={() => {
                history.push('/mint')
              }}
            >
              Mint fUSDV3
            </Button>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  )
}
