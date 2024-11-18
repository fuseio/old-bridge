import { Flex } from 'rebass/styled-components'

import AppBody from '../AppBody'
import Page from '../../collections/Page'
import { StakeOptionCard } from './StakeOptionCard'
import { formatSignificant } from '../../utils'
import useVoteEscrow from '../../hooks/useVoteEscrow'
import { useBarStats, useChefStake, useFuseStakingStats } from '../../state/stake/hooks'

import sFuse from '../../assets/svg/sfuse.svg'
import xVolt from '../../assets/svg/xVOLT.svg'
import veVOLT from '../../assets/svg/vevolt-icon.svg'
import usdc from '../../assets/svg/usdc.svg'
import weth from '../../assets/svg/weth.svg'
import { USDC_FARM_PID, USDC_V2, WETH_FARM_PID, WETH_V2 } from '../../constants'

export default function Stake() {
  const xv = useBarStats()
  const sf = useFuseStakingStats()
  const vv = useVoteEscrow()
  const usdcChefStake = useChefStake(USDC_FARM_PID, USDC_V2)
  const wethChefStake = useChefStake(WETH_FARM_PID, WETH_V2)

  return (
    <AppBody>
      <Page>
        <Page.Header>Stake</Page.Header>

        <Page.Subheader> Stake your LP tokens and earn more.</Page.Subheader>

        <Page.Body>
          <Flex flexDirection={'column'} sx={{ gap: [3] }}>
            <StakeOptionCard
              to={'/stake/eth'}
              title="Simple Staking"
              tokenName="WETH"
              buttonText="Stake"
              logo={weth}
              apy={formatSignificant({
                value: wethChefStake?.apy,
                suffix: '%',
              })}
              tvl={formatSignificant({
                value: wethChefStake?.totalStakedAmountUSD,
                prefix: '$',
              })}
            />

            <StakeOptionCard
              to={'/stake/usdc'}
              title="Simple Staking"
              tokenName="USDC"
              buttonText="Stake"
              logo={usdc}
              apy={formatSignificant({
                value: usdcChefStake?.apy,
                suffix: '%',
              })}
              tvl={formatSignificant({
                value: usdcChefStake?.totalStakedAmountUSD,
                prefix: '$',
              })}
            />

            <StakeOptionCard
              to={'/stake/sFUSE'}
              title="Liquid Staking"
              tokenName="FUSE"
              buttonText="Stake"
              logo={sFuse}
              learnMore={'https://docs.voltage.finance/voltage/the-platform/staking/sfuse-liquid-staking'}
              apy={formatSignificant({
                value: sf?.apy,
                suffix: '%',
              })}
              tvl={formatSignificant({
                value: sf?.tvl,
                prefix: '$',
              })}
            />

            <StakeOptionCard
              to={'/stake/veVOLT'}
              title="Simple Staking"
              tokenName="veVOLT"
              buttonText="Stake"
              logo={veVOLT}
              learnMore={'https://docs.voltage.finance/voltage/the-platform/staking/vevolt'}
              apy={formatSignificant({
                value: vv?.apy,
                suffix: '%',
              })}
              tvl={formatSignificant({
                value: vv?.tvl,
                prefix: '$',
              })}
            />

            <StakeOptionCard
              to={'/stake/xVOLT'}
              title="Simple Staking"
              tokenName="xVOLT"
              buttonText="Unstake"
              logo={xVolt}
              isDeprecated={true}
              apy={formatSignificant({
                value: 0,
                suffix: '%',
              })}
              tvl={formatSignificant({
                value: xv?.tvl,
                prefix: '$',
              })}
            />
          </Flex>
        </Page.Body>
      </Page>
    </AppBody>
  )
}
