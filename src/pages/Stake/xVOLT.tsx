import { useCallback, useEffect, useState } from 'react'
import { Box, Card, Flex, Image, Text } from 'rebass/styled-components'

import AppBody from '../AppBody'
import { useWeb3 } from '../../hooks'
import { Position } from './Page/Position'
import { StakingOptions } from './constants'
import { VOLT, xVOLT } from '../../constants'
import { Explanation } from './Page/Explanation'
import { formatSignificant } from '../../utils'
import { ChainId } from '../../constants/chains'
import { useBarStats } from '../../state/stake/hooks'
import ModalLegacy from '../../components/ModalLegacy'
import { Statistic } from '../../components/Statistic'
import { BackButton } from '../../wrappers/BackButton'
import { StakeInputPanel } from './Page/StakeInputPanel'
import SwitchNetwork from '../../components/SwitchNetwork'
import { useXVoltContract } from '../../hooks/useContract'
import { useTransactionAdder } from '../../state/transactions/hooks'
import Submitted from '../../modals/TransactionModalLegacy/Submitted'
import { useNativeCurrencyBalances, useTokenBalance } from '../../state/wallet/hooks'
import { useTransactionRejectedNotification } from '../../hooks/notifications/useTransactionRejectedNotification'

import xVOLTSvg from '../../assets/svg/xVOLT.svg'
import voltSVG from '../../assets/svg/volt_currency_logo.svg'

export default function xVolt() {
  const { account, chainId } = useWeb3()
  const [value, setValue] = useState('0.0')
  const [txnType, setTxnType] = useState(null)
  const rejectTransaction = useTransactionRejectedNotification()
  const voltBalance = useTokenBalance(account ?? undefined, VOLT)

  const xvoltBalance = useTokenBalance(account ?? undefined, xVOLT)

  const xVoltContract = useXVoltContract()

  const addTransaction = useTransactionAdder()

  const userEthBalance = useNativeCurrencyBalances([account])[account ?? '']
  const { apy, tvl, apySinceDayZero, stakers, userStakedAmount, priceRatio } = useBarStats()
  const [txnModalOpen, setTxnModalOpen] = useState(false)
  const [hash, setHash] = useState(null)

  const onStake = useCallback(
    async (amount: string) => {
      try {
        const tx = await xVoltContract.enter(amount)
        setHash(tx?.hash)
        setTxnType(StakingOptions.Stake)
        addTransaction(tx, { summary: 'Stake Volt' })
      } catch (e: any) {
        if (e?.code === 4001 || e?.code === 'ACTION_REJECTED') {
          rejectTransaction()
        }
        console.log(e, 'Failed to stake xVolt')
        return e
      }
    },
    [xVoltContract]
  )

  useEffect(() => {
    if (hash) {
      setValue('0.0')
      setTxnModalOpen(true)
    } else {
      setTxnModalOpen(false)
    }
  }, [hash])

  return (
    <AppBody>
      <SwitchNetwork />

      <ModalLegacy
        isOpen={txnModalOpen}
        onDismiss={() => {
          setTxnModalOpen(false)
          setTxnType(null)
        }}
        onClose={() => {
          setTxnModalOpen(false)
          setTxnType(null)
        }}
      >
        <ModalLegacy.Content>
          <Submitted
            currency={txnType !== StakingOptions.Unstake && xVOLT}
            onClose={() => {
              setTxnModalOpen(false)
              setTxnType(null)
            }}
            hash={hash}
          />
        </ModalLegacy.Content>
      </ModalLegacy>

      <BackButton pb={1} path={'/stake'} />
      <Flex pb={2} alignItems={'center'} sx={{ gap: 2 }}>
        <Image width={40} mt={1} src={xVOLTSvg} />
        <Text py={2} fontSize={6} fontWeight={600}>
          {xVOLT?.symbol}
        </Text>
      </Flex>
      <Flex width={'100%'} flexWrap={['wrap', 'nowrap']} sx={{ gap: 4 }}>
        <Flex width={'100%'} sx={{ gap: 3 }} flexDirection={'column'}>
          <Card pb={[3, 0]}>
            <Text variant={'h4'}>Overview</Text>
            <Box py={1}></Box>
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
                    value: 0,
                    suffix: '%',
                  }),
                  tooltip: 'This is an amazing tooltip',
                },
                {
                  name: 'APY (Since day 0)',
                  value: formatSignificant({
                    value: 0,
                    suffix: '%',
                  }),
                  tooltip: 'This is an amazing tooltip',
                },
                { name: 'Stakers', value: stakers },
              ].map(({ ...props }, index) => {
                return <Statistic key={index} {...props} />
              })}
            </Box>
          </Card>

          <Box height={'100%'} display={['none', 'block', 'block']}>
            <Explanation
              paragraphs={[
                `Like liquidity providing (LP), you will earn fees according to your share in the pool, and your xVOLT
                receipt is needed as proof when claiming the rewards.`,
                `This pool automatically
            compounds by using a portion of all trade fees to buy back VOLT which means the xVOLT to VOLT ratio will
            grow over time!`,
              ]}
              addToken={chainId === ChainId.FUSE && xVOLT}
            />
          </Box>
        </Flex>
        <Flex height={'auto'} width={600} sx={{ gap: 3 }} flexDirection={'column'}>
          <StakeInputPanel
            value={value}
            setValue={setValue}
            contract={xVoltContract}
            deprecated
            staked={{
              balance: voltBalance,
              currency: VOLT,
              onClick: onStake,
              icon: voltSVG,
            }}
            priceRatio={`1 ${VOLT?.symbol} = ${formatSignificant({ value: priceRatio })} ${xVOLT?.symbol}`}
            unstaked={{
              balance: xvoltBalance,
              currency: xVOLT,
              icon: xVOLTSvg,
              onClick: async (amount) => {
                if (xVoltContract) {
                  try {
                    const tx = await xVoltContract.leave(amount)
                    setHash(tx?.hash)
                    setTxnType(StakingOptions.Unstake)
                    addTransaction(tx, { summary: 'Stake Volt' })
                  } catch (e: any) {
                    if (e?.code === 4001 || e?.code === 'ACTION_REJECTED') {
                      rejectTransaction()
                    }
                    return e
                  }
                }
              },
            }}
          />
          <Position
            stake={{
              balance: userEthBalance && chainId === ChainId.FUSE && userStakedAmount,
              symbol: userEthBalance && chainId === ChainId.FUSE && VOLT.symbol,
            }}
            lp={{
              balance: userEthBalance && chainId === ChainId.FUSE && xvoltBalance?.toSignificant(),
              symbol: userEthBalance && chainId === ChainId.FUSE && xVOLT.symbol,
            }}
          />
          <Box height={'100%'} display={['block', 'none', 'none']}>
            <Explanation
              paragraphs={[
                `Stake VOLT here and receive xVOLT as receipt representing your share of the pool. This pool automatically
            compounds by using a portion of all trade fees to buy back VOLT which means the xVOLT to VOLT ratio will
            grow over time!`,
                `Like liquidity providing (LP), you will earn fees according to your share in the pool, and your xVOLT
          receipt is needed as proof when claiming the rewards.`,
              ]}
              addToken={chainId === ChainId.FUSE && xVOLT}
            />
          </Box>
        </Flex>
      </Flex>
    </AppBody>
  )
}
