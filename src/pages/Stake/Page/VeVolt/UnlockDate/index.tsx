import moment from 'moment'
import { useState } from 'react'
import { Box, Button, Card, Flex, Text } from 'rebass/styled-components'
import useVoteEscrow from '../../../../../hooks/useVoteEscrow'
import IncreaseLockPeriodModal from '../../../../../modals/VeVoltIncreaseLockPeriodModal'

const UnlockDate = () => {
  const [periodModalOpen, setPeriodModalOpen] = useState(false)
  const { lock, monthsRemaining, isLockDone } = useVoteEscrow()
  return (
    <>
      <IncreaseLockPeriodModal onDismiss={() => setPeriodModalOpen(false)} isOpen={periodModalOpen} />
      <Card width={'100%'} height={'fit-content'}>
        <Flex justifyContent={'space-between'}>
          <Text fontSize={1}>Unlock Date</Text>
        </Flex>
        <Box py={1}></Box>

        <Flex justifyContent={'space-between'} flexDirection={'column'} style={{ gap: '8px' }} py={2}>
          <Flex alignItems={'center'} justifyContent={'space-between'}>
            <Text opacity={0.7} fontSize={1}>
              Date
            </Text>
            {moment(parseFloat(lock?.end) * 1000).format('MMMM DD, YYYY')}
          </Flex>
        </Flex>
        <Flex pt={3} justifyContent={'end'} width={'100%'} style={{ gap: '8px' }}>
          {!isLockDone && (
            <Button
              variant="tertiary"
              disabled={monthsRemaining === 0}
              onClick={() => {
                setPeriodModalOpen(true)
              }}
              fontSize={0}
              fontWeight={600}
            >
              Increase Lock Period
            </Button>
          )}
        </Flex>
      </Card>
    </>
  )
}
export default UnlockDate
