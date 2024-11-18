import { Box, Card, Flex, Text } from 'rebass/styled-components'

import Page from '../../../collections/Page'
import { BackButton } from '../../../wrappers/BackButton'
import AppBody from '../../AppBody'
import Tabs from '../../../wrappers/Tabs'
import { StakingOptions } from '../constants'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { BalanceLoader } from '../../../wrappers/BalanceLoader'
import { useChefStake } from '../../../state/stake/hooks'
import { useWeb3 } from '../../../hooks'
import { formatSignificant } from '../../../utils'
import { useTokenBalance } from '../../../state/wallet/hooks'
import useCurrencyAmountUSD from '../../../hooks/useUSDPrice'
import CurrencyLogo from '../../../components/Logo/CurrencyLogo'
import SingleCurrencyInput from '../../../components/SingleCurrencyInput'
import { ApprovalButton } from '../../../wrappers/ApprovalButton'
import { CheckConnectionWrapper } from '../../../wrappers/CheckConnectionWrapper'
import { Token } from '@voltage-finance/sdk-core'
import { useMasterChefV3Contract } from '../../../hooks/useContract'
import tryParseCurrencyAmount from '../../../utils/tryParseCurrencyAmount'
import { useApproveCallback } from '../../../hooks/useApproveCallback'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import ModalLegacy from '../../../components/ModalLegacy'
import Submitted from '../../../modals/TransactionModalLegacy/Submitted'

interface SimpleStakingProps {
  stakeToken: Token
  poolId: string
}

export default function SimpleStaking({ stakeToken, poolId }: SimpleStakingProps) {
  const [stakingOption, setStakingOption] = useState(StakingOptions.Stake)

  const [typedValue, setTypedValue] = useState('')

  const [txnModalOpen, setTxnModalOpen] = useState(false)

  const [txHash, setTxHash] = useState()

  const { account } = useWeb3()

  const masterChefV3Contract = useMasterChefV3Contract()

  const {
    pid,
    totalStakedAmountUSD,
    userStakedAmount: unstakeTokenBalance,
    userStakedAmountUSD: unstakeTokenBalanceUSD,
    rewardAmount,
    rewardAmountUSD,
    apy,
  } = useChefStake(poolId, stakeToken, account)

  const parsedAmount = useMemo(() => tryParseCurrencyAmount(typedValue, stakeToken), [stakeToken, typedValue])

  const stakeTokenBalance = useTokenBalance(account, stakeToken as Token)

  const stakeTokenBalanceUSD = useCurrencyAmountUSD(stakeTokenBalance)

  const typedValueUSD = useCurrencyAmountUSD(parsedAmount)

  const isStake = stakingOption === StakingOptions.Stake

  const tokenBalance = isStake ? stakeTokenBalance : unstakeTokenBalance

  const onMax = useCallback(() => {
    if (tokenBalance) {
      setTypedValue(tokenBalance.toSignificant())
    }
  }, [tokenBalance])

  const [approval, approveCallback] = useApproveCallback(parsedAmount, masterChefV3Contract?.address)

  const addTransaction = useTransactionAdder()

  useEffect(() => {
    if (txHash) {
      setTxnModalOpen(true)
    } else {
      setTxnModalOpen(false)
    }
  }, [txHash])

  const onSubmit = useCallback(async () => {
    if (!masterChefV3Contract || !parsedAmount) return

    try {
      const method = isStake ? 'deposit' : 'withdraw'

      const response = await masterChefV3Contract[method](pid, parsedAmount.quotient.toString())

      addTransaction(response, {
        summary: `${stakingOption}d ${parsedAmount.toSignificant()} ${parsedAmount.currency.symbol}`,
      })

      setTypedValue('')
      setTxHash(response.hash)
    } catch (error) {
      console.error(`Failed to ${stakingOption}: ${error}`)
    }
  }, [stakingOption, addTransaction, isStake, masterChefV3Contract, parsedAmount, pid])

  let error = ''
  if (parsedAmount?.greaterThan(tokenBalance)) {
    error = `Insufficient ${stakeToken?.symbol} Balance`
  }

  return (
    <>
      <ModalLegacy
        isOpen={txnModalOpen}
        onDismiss={() => {
          setTxnModalOpen(false)
        }}
        onClose={() => {
          setTxnModalOpen(false)
        }}
      >
        <ModalLegacy.Content>
          <Submitted
            currency={stakeToken}
            onClose={() => {
              setTxnModalOpen(false)
            }}
            hash={txHash}
          />
        </ModalLegacy.Content>
      </ModalLegacy>

      <AppBody>
        <Page>
          <Page.Header>
            <BackButton pb={1} path={'/stake'} />

            <Flex pb={2} alignItems={'center'} sx={{ gap: '20px' }}>
              {stakeToken && <CurrencyLogo currency={stakeToken} size={'40px'} />}

              <Text py={2} fontSize={['32px', '50px']} fontWeight={700}>
                Earn on your {stakeToken?.symbol}
              </Text>
            </Flex>
          </Page.Header>

          <Page.Subheader>
            <Text
              pb={4}
              pt={['0px', '10px']}
              px={['20px', '0px']}
              width={['100%', '800px']}
              fontSize={['14px', '18px']}
            >
              Earn yield on your {stakeToken?.symbol} with our new staking product. The APY adjusts based on the total{' '}
              {stakeToken?.symbol} staked, meaning early stakers benefit from higher returns. As more{' '}
              {stakeToken?.symbol} is locked, the yield adjusts, offering a balanced and rewarding opportunity. Start
              staking today to maximize your returns!
            </Text>

            <Flex flexDirection={['column', 'row']} sx={{ gap: ['12px', '55px'] }}>
              <Flex sx={{ gap: '55px' }} justifyContent={['center', '']}>
                <Text fontSize={['14px', '18px']}>
                  APY{' '}
                  <Box as="span" fontWeight="bold">
                    {formatSignificant({
                      value: apy?.toFixed(2),
                      suffix: '%',
                    })}
                  </Box>
                </Text>
              </Flex>

              <Flex sx={{ gap: '55px' }} justifyContent={['center', '']}>
                <Text fontSize={['14px', '18px']}>
                  TVL{' '}
                  <Box as="span" fontWeight="bold">
                    {formatSignificant({
                      value: totalStakedAmountUSD?.toFixed(5),
                      prefix: '$',
                    })}
                  </Box>
                </Text>
              </Flex>
            </Flex>
          </Page.Subheader>

          <Page.Body>
            <Flex sx={{ gap: ['20px', '20px', '41px'] }} flexDirection={['column', 'row']}>
              <Card maxHeight={'400px'}>
                <Flex flexDirection={'column'}>
                  <Tabs
                    onChange={(tab) => {
                      if (tab === StakingOptions.Stake) {
                        setStakingOption(StakingOptions.Stake)
                      } else {
                        setStakingOption(StakingOptions.Unstake)
                      }
                    }}
                    items={[{ name: StakingOptions.Stake }, { name: StakingOptions.Unstake }]}
                    fontSize={'18px'}
                  />
                  <Flex flexDirection={'column'}>
                    <Flex mb={4} mt={3}>
                      <SingleCurrencyInput
                        currency={stakeToken}
                        currencyBalance={tokenBalance}
                        onUserInput={setTypedValue}
                        value={typedValue}
                        onMax={onMax}
                        typedValueUSD={typedValueUSD}
                      />
                    </Flex>
                    <Flex style={{ gap: '8px' }} justifyContent={'flex-end'}>
                      <CheckConnectionWrapper>
                        <ApprovalButton
                          approval={approval}
                          approveCallback={approveCallback}
                          error={error}
                          onClick={() => onSubmit()}
                        >
                          {stakingOption}
                        </ApprovalButton>
                      </CheckConnectionWrapper>
                    </Flex>
                  </Flex>
                </Flex>
              </Card>

              <Flex flexDirection={'column'}>
                <Card
                  py={'33px'}
                  maxWidth={['100%', '580px']}
                  px={['30px', '20px', '30px']}
                  width={['100%', '100%', '41vw']}
                >
                  <Text fontSize={['18px']} fontWeight={700}>
                    My Balance
                  </Text>

                  <Text fontSize={['24px']} pt={['16px']} fontWeight={600}>
                    <BalanceLoader>
                      $
                      {formatSignificant({
                        value: stakeTokenBalanceUSD,
                      })}
                    </BalanceLoader>
                  </Text>

                  <Flex flexDirection={['row', 'column', 'row']} pt={'30px'} sx={{ gap: ['0px', '10px', '0px'] }}>
                    <Flex flexDirection={'column'} pr={['30px', '2vw', '5vw']} sx={{ gap: ['11px', '5px', '11px'] }}>
                      <Text fontSize={['14px']} color={'blk70'} fontWeight={500}>
                        Staked
                      </Text>

                      <Flex sx={{ gap: ['12px', '1vw'] }}>
                        <Text fontSize={['14px', '15px', '16px']} color={'black'} fontWeight={600}>
                          <BalanceLoader>
                            {unstakeTokenBalance?.toSignificant(4)} {rewardAmount?.currency?.symbol}
                          </BalanceLoader>
                        </Text>

                        <Text fontSize={['14px', '15px', '16px']} color={'blk70'} fontWeight={600}>
                          <BalanceLoader>${unstakeTokenBalanceUSD?.toFixed(4)}</BalanceLoader>
                        </Text>
                      </Flex>
                    </Flex>

                    <Flex mr={['16px', '28px']} width={'1px'} minHeight={'100%'} backgroundColor={'#E8E8E8'} />

                    <Flex flexDirection={['column']} sx={{ gap: ['11px', '5px', '11px'] }}>
                      <Text fontSize={['14px']} color={'blk70'} fontWeight={500}>
                        Interest Earned
                      </Text>

                      <Flex sx={{ gap: ['12px', '18px'] }}>
                        <Text fontSize={['14px', '15px', '16px']} color={'black'} fontWeight={600}>
                          <BalanceLoader>
                            {rewardAmount?.toSignificant(4)} {rewardAmount?.currency?.symbol}
                          </BalanceLoader>
                        </Text>

                        <Text fontSize={['14px', '15px', '16px']} color={'blk70'} fontWeight={600}>
                          <BalanceLoader>${rewardAmountUSD?.toFixed(4)}</BalanceLoader>
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                </Card>
              </Flex>
            </Flex>
          </Page.Body>
        </Page>
      </AppBody>
    </>
  )
}
