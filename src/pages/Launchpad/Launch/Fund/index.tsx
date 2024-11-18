import { get } from 'lodash'
import { useCallback, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Box, Button, Card, Flex, Text } from 'rebass/styled-components'
import LAUNCH_ABI from '../../../../constants/abis/launchpad.json'
import { useTransactionRejectedNotification } from '../../../../hooks/notifications/useTransactionRejectedNotification'
import { useContract } from '../../../../hooks/useContract'
import LaunchFundModal from '../../../../modals/LaunchFundModal'
import LaunchWithdrawModal from '../../../../modals/LaunchWithdrawModal'
import TxHashSubmmitedModal from '../../../../modals/TxSubmmitedModal'
import { LaunchStatus } from '../../../../state/launch/updater'
import { useTransactionAdder } from '../../../../state/transactions/hooks'
import { numberFormat } from '../../../../utils'
import { CheckConnectionWrapper } from '../../../../wrappers/CheckConnectionWrapper'
import { ComponentLoader } from '../../../../wrappers/ComponentLoader'
import { Countdown } from '../../../../wrappers/Countdown'
import { ProgressBar } from '../../../../wrappers/ProgressBar'
import { SECONDS_IN_DAY } from '../../../../constants'
import moment from 'moment'
const Fund = () => {
  const params = useParams()
  const launches = useSelector((state: any) => state.launch.launches)
  const {
    contractAddress,
    status,
    saleTokenReserve,
    hasEnded,
    startTime,
    endTime,
    minSaleTokenReserve,
    maxSaleTokenReserve,
    user,
    vestingDays,
  } = launches.find((launch: any) => launch.contractAddress === (params as any).id)
  const [txHash, setTxHash] = useState()

  const balance = get(user, 'balance', 0)
  const allocation = get(user, 'allocation', 0)
  const claimable = get(user, 'claimable', 0)
  const hasClaimed = get(user, 'hasClaimed', false)
  const isMaxFunded = Number(saleTokenReserve) === Number(maxSaleTokenReserve)
  const launchContract = useContract(contractAddress, LAUNCH_ABI)
  const [fundModalOpen, setFundModalOpen] = useState(false)
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
  const loading = !saleTokenReserve || !minSaleTokenReserve
  const addTransaction = useTransactionAdder()
  const rejectTransaction = useTransactionRejectedNotification()

  const claim = useCallback(async () => {
    try {
      const tx = await launchContract.claim()
      setTxHash(tx?.hash)
      addTransaction(tx, { summary: 'Claim Launchpad' })
    } catch (e: any) {
      if (e?.code === 4001 || e?.code === 'ACTION_REJECTED') {
        rejectTransaction()
      }
      return e
    }
  }, [addTransaction, launchContract, rejectTransaction])

  const timestampMoment = moment.unix(endTime)
  const futureTimestampMoment = timestampMoment.add(SECONDS_IN_DAY * vestingDays, 'seconds')
  const futureTimestamp = futureTimestampMoment.unix()

  return (
    <Card minHeight={214}>
      <TxHashSubmmitedModal txHash={txHash} setTxHash={setTxHash} />

      <LaunchFundModal
        isOpen={fundModalOpen}
        onDismiss={() => {
          setFundModalOpen(false)
        }}
      />
      <LaunchWithdrawModal
        isOpen={withdrawModalOpen}
        onDismiss={() => {
          setWithdrawModalOpen(false)
        }}
      />
      <Text variant={'h4'}>Overview</Text>

      <Flex flexDirection={'column'}>
        <Text pb={1} fontSize={0}>
          Raised
        </Text>

        <ComponentLoader loading={loading}>
          <Flex sx={{ gap: 2 }}>
            <Text fontSize={4} fontWeight={500} color={'black'}>
              {numberFormat(saleTokenReserve, 0, true)}
            </Text>
            <Text fontSize={4} fontWeight={500} color={'black'}>
              /
            </Text>
            <Text fontSize={4} fontWeight={500} color={'blk70'}>
              {numberFormat(minSaleTokenReserve, 0, true)}
            </Text>
          </Flex>
        </ComponentLoader>
      </Flex>
      <Box py={3}>
        <ProgressBar
          current={Number(saleTokenReserve) > Number(minSaleTokenReserve) ? minSaleTokenReserve : saleTokenReserve}
          goal={minSaleTokenReserve}
        />
      </Box>

      <Flex sx={{ gap: '12px' }} pt={3} pb={3} flexDirection={'column'}>
        <Flex fontSize={2} fontWeight={500} justifyContent={'space-between'}>
          <Text variant={'label'}>Soft Cap</Text>
          <Text variant={'description'}>{numberFormat(minSaleTokenReserve, 0, true)}</Text>
        </Flex>
        <Flex fontSize={2} fontWeight={500} justifyContent={'space-between'}>
          <Text variant={'label'}>Max Cap</Text>
          <Text variant={'description'}>{numberFormat(maxSaleTokenReserve, 0, true)}</Text>
        </Flex>

        {!hasEnded && (
          <Flex alignItems={'center'} mt={2} fontSize={1} justifyContent={'space-between'}>
            <Text variant={'label'}>Time Left</Text>
            <Countdown
              timestamp={status === LaunchStatus.Finalized ? 0 : status === LaunchStatus.Upcoming ? startTime : endTime}
            />
          </Flex>
        )}
      </Flex>

      <CheckConnectionWrapper>
        <Flex sx={{ gap: 2 }} alignItems={'end'} justifyContent={'end'}>
          {status === LaunchStatus.Finalized && (
            <Button
              onClick={claim}
              sx={
                Number(claimable) === 0 || futureTimestamp > moment().unix() || hasClaimed
                  ? {
                      opacity: 0.5,
                      pointerEvents: 'none',
                    }
                  : {
                      opacity: 1,
                      pointerEvents: 'all',
                    }
              }
              bg="primary"
              color={'background'}
              fontWeight={600}
              variant={'tertiary'}
              width={1}
            >
              {hasClaimed ? 'Claimed' : 'Claim'}
            </Button>
          )}
        </Flex>

        {(status === LaunchStatus.Live || status === LaunchStatus.Upcoming) && (
          <Flex sx={{ gap: 2 }} alignItems={'end'} justifyContent={'end'}>
            <Button
              onClick={() => {
                setWithdrawModalOpen(true)
              }}
              color={'white'}
              fontWeight={600}
              variant={'tertiary'}
              width={1 / 2}
              sx={
                status !== LaunchStatus.Live || Number(balance) === 0
                  ? {
                      opacity: 0.5,
                      pointerEvents: 'none',
                    }
                  : {
                      opacity: 1,
                      pointerEvents: 'all',
                    }
              }
            >
              Withdraw
            </Button>

            <Button
              bg="highlight"
              color={'black'}
              width={1 / 2}
              sx={
                status !== LaunchStatus.Live || !allocation || Number(allocation) === Number(balance) || isMaxFunded
                  ? {
                      opacity: 0.5,
                      pointerEvents: 'none',
                    }
                  : {
                      opacity: 1,
                      pointerEvents: 'all',
                    }
              }
              onClick={() => {
                setFundModalOpen(true)
              }}
              fontWeight={700}
              variant={'tertiary'}
            >
              Fund
            </Button>
          </Flex>
        )}
      </CheckConnectionWrapper>
    </Card>
  )
}

export default Fund
