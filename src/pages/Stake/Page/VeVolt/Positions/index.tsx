import { useState } from 'react'
import { Box, Button, Card, Flex, Text } from 'rebass/styled-components'
import useVoteEscrow from '../../../../../hooks/useVoteEscrow'
import IncreaseLockAmountModal from '../../../../../modals/VeVoltIncreaseLockAmountModal'
import UnlockModal from '../../../../../modals/VeVoltUnlockModal'
import { formatSignificant } from '../../../../../utils'
import { BalanceLoader } from '../../../../../wrappers/BalanceLoader'

const Positions = () => {
  const [increaseLockAmountModalOpen, setIncreaseLockAmountModalOpen] = useState(false)
  const { veVoltBalance, lock, isLockDone } = useVoteEscrow()
  const [claimModalOpen, setClaimModalOpen] = useState(false)

  return (
    <>
      <UnlockModal
        isOpen={claimModalOpen}
        onDismiss={() => {
          setClaimModalOpen(false)
        }}
      />
      <IncreaseLockAmountModal
        isOpen={increaseLockAmountModalOpen}
        onDismiss={() => setIncreaseLockAmountModalOpen(false)}
      />
      <Card width={'100%'} height={'fit-content'}>
        <Flex justifyContent={'space-between'}>
          <Text fontSize={1}>My Positions</Text>
        </Flex>
        <Box py={1}></Box>

        <Flex justifyContent={'space-between'} flexDirection={'column'} style={{ gap: '8px' }} py={2}>
          <Flex alignItems={'center'} width={'100%'} justifyContent={'space-between'}>
            <Text opacity={0.7} fontSize={1}>
              veVOLT Balance
            </Text>
            <BalanceLoader>
              <Text fontSize={2} fontWeight={600}>
                {formatSignificant({
                  value: veVoltBalance?.toSignificant(18),
                })}
              </Text>
            </BalanceLoader>
          </Flex>
          <Flex alignItems={'center'} justifyContent={'space-between'}>
            <Text opacity={0.7} fontSize={1}>
              Locked VOLT
            </Text>
            {formatSignificant({
              value: lock?.amount?.toSignificant(18),
            })}
          </Flex>
        </Flex>
        <Flex pt={3} justifyContent={'end'} width={'100%'} style={{ gap: '8px' }}>
          {!isLockDone && (
            <Button
              variant="tertiary"
              width={'fit-content'}
              height={'fit-content'}
              onClick={() => {
                setIncreaseLockAmountModalOpen(true)
              }}
              fontSize={0}
              fontWeight={600}
            >
              Increase VOLT
            </Button>
          )}
          <Button
            variant="tertiary"
            onClick={() => {
              setClaimModalOpen(true)
            }}
            fontSize={0}
            fontWeight={600}
          >
            Unlock
          </Button>
        </Flex>
      </Card>
    </>
  )
}
export default Positions
