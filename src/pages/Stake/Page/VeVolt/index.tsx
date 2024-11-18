import { Box, Card, Flex, Image, Text } from 'rebass/styled-components'

import Rewards from './Rewards'
import Positions from './Positions'
import UnlockDate from './UnlockDate'
import AppBody from '../../../AppBody'
import VeVoltInputPanel from './InputPanel'
import { Explanation } from '../Explanation'
import { formatSignificant } from '../../../../utils'
import useVoteEscrow from '../../../../hooks/useVoteEscrow'
import { Statistic } from '../../../../components/Statistic'
import SwitchNetwork from '../../../../components/SwitchNetwork'
import { LoadingOverlay } from '../../../../wrappers/LoadingOverlay'
import { ComponentLoader } from '../../../../wrappers/ComponentLoader'
import { TransactionKey, useAllPendingTransactions } from '../../../../state/transactions/hooks'

import VeVoltSvg from '../../../../assets/svg/vevolt-icon.svg'
import { BackButton } from '../../../../wrappers/BackButton'

const VeVolt = () => {
  const { loading, hasLock, tvl, voltLocked, averageLockTime, apy, isLockDone } = useVoteEscrow()
  const allPendingTransactions = useAllPendingTransactions(TransactionKey.VEVOLT)

  return (
    <AppBody>
      <SwitchNetwork />

      <Flex flexDirection={'column'}>
        <BackButton pb={0} />
        <Flex pb={2} alignItems={'center'} style={{ gap: '8px' }}>
          <Image width={40} mt={1} src={VeVoltSvg} />
          <Text py={2} fontSize={6} fontWeight={600}>
            veVOLT
          </Text>
        </Flex>
      </Flex>

      <Flex width={'100%'} flexWrap={['wrap', 'nowrap']} style={{ gap: '8px' }}>
        <Flex height={'auto'} width={'100%'} style={{ gap: '8px' }} flexDirection={'column'}>
          <Card pb={[3, 0]}>
            <Text variant={'h4'}>Overview</Text>
            <Box
              sx={{
                display: 'grid',
                rowGap: [3, 0],
                'grid-template-rows': ['0.5fr 0.5fr'],
                'grid-template-columns': ['1fr', '1fr 1fr 1fr 1fr'],
              }}
            >
              {[
                {
                  name: 'TVL',
                  value: formatSignificant({
                    value: tvl,
                    prefix: '$',
                  }),
                },
                {
                  name: 'APY (Variable)',
                  value: formatSignificant({
                    value: apy,
                    suffix: '%',
                  }),
                },

                {
                  name: 'Avg. Lock Time',
                  value: formatSignificant({
                    value: averageLockTime,
                    suffix: ' Yrs',
                  }),
                },

                {
                  name: 'Total Locked (VOLT)',
                  value: formatSignificant({
                    value: voltLocked?.toSignificant(),
                  }),
                },
              ].map(({ ...props }, index) => {
                return <Statistic fontSize={4} key={index} {...props} />
              })}
            </Box>
          </Card>

          <Box height={'100%'} display={['none', 'block', 'block']}>
            <Flex height={'100%'} flexDirection={['row']} sx={{ gap: 2 }}>
              <Box width={[1 / 2]}>
                <Explanation
                  paragraphs={[
                    'Stake VOLT for 1-24 months. Lock in for 6+ months for surprises in the Fuse Ecosystem! Check the documentation for VeVolt benefits and step-by-step tutorial.',
                  ]}
                />
              </Box>
              <Box width={[1 / 2]}>
                <Rewards />
              </Box>
            </Flex>
          </Box>
        </Flex>
        <Flex height={'auto'} width={600} style={{ gap: '8px' }} flexDirection={'column'}>
          {loading && (
            <ComponentLoader height="100%" width={'100%'} loading={loading}>
              <Card minHeight={300}></Card>
            </ComponentLoader>
          )}
          {!loading && !hasLock && (
            <LoadingOverlay loading={allPendingTransactions?.length !== 0}>
              <VeVoltInputPanel />
            </LoadingOverlay>
          )}
          {hasLock && (
            <LoadingOverlay loading={allPendingTransactions?.length !== 0}>
              <Flex sx={{ gap: 2 }} flexDirection={'column'}>
                <Positions />
                <UnlockDate />
              </Flex>
            </LoadingOverlay>
          )}
        </Flex>
        <Box height={'100%'} display={['block', 'none', 'none']}>
          <Flex flexDirection={['column']} sx={{ gap: 2 }}>
            <Box width={['100%']}>
              <Rewards />
            </Box>
            <Box width={['100%']}>
              <Explanation
                paragraphs={[
                  `Lock for 6 months or more to receive Fuse Ecosystem airdrops! 
                    Read the Docs to learn more about VeVolt and its benefits`,
                ]}
              />
            </Box>
          </Flex>
        </Box>
      </Flex>
    </AppBody>
  )
}

export default VeVolt
