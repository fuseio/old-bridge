import { ChevronRight } from 'react-feather'
import { useCallback, useEffect, useState } from 'react'
import { CurrencyAmount } from '@voltage-finance/sdk-core'
import { Box, Card, Flex, Image, Text } from 'rebass/styled-components'

import AppBody from '../../AppBody'
import { useWeb3 } from '../../../hooks'
import { sFUSE } from '../../../constants'
import Page from '../../../collections/Page'
import { StakingOptions } from '../constants'
import { FUSE } from '../../../data/Currency'
import { formatSignificant } from '../../../utils'
import { useCurrency } from '../../../hooks/Tokens'
import { FUSE_CHAIN } from '../../../constants/chains'
import { BackButton } from '../../../wrappers/BackButton'
import ModalLegacy from '../../../components/ModalLegacy'
import SwitchNetwork from '../../../components/SwitchNetwork'
import { SFuseStakeInputPanel } from './SFuseStakeInputPanel'
import { BalanceLoader } from '../../../wrappers/BalanceLoader'
import { useFuseStakingStats } from '../../../state/stake/hooks'
import { useCurrencyBalance } from '../../../state/wallet/hooks'
import { useFuseStakingContract } from '../../../hooks/useContract'
import { useFusePrice, useSFusePrice } from '../../../graphql/hooks'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import Submitted from '../../../modals/TransactionModalLegacy/Submitted'
import { useTransactionRejectedNotification } from '../../../hooks/notifications/useTransactionRejectedNotification'

import sFuseSvg from '../../../assets/svg/sfuse.svg'
import fuseSvg from '../../../assets/svg/fuseTokenLogo.svg'

import lynxSvg from '../../../assets/svg/stake/lynx.svg'
import meridianSvg from '../../../assets/svg/stake/meridian.svg'
import shoebillSvg from '../../../assets/svg/stake/shoebill.svg'

export default function SFuse() {
  const { account } = useWeb3()
  const fusePrice = useFusePrice()
  const sFusePrice = useSFusePrice()

  const [hash, setHash] = useState(null)
  const [value, setValue] = useState('0.0')
  const [txnType, setTxnType] = useState(null)
  const [txnModalOpen, setTxnModalOpen] = useState(false)

  const fuseStakingContract = useFuseStakingContract()
  const fuse = useCurrency(FUSE_CHAIN?.nativeCurrency?.symbol)
  const rejectTransaction = useTransactionRejectedNotification()

  const fuseBalance = useCurrencyBalance(account ?? undefined, FUSE)
  const sFuseBalance = useCurrencyBalance(account ?? undefined, sFUSE)

  const {
    tvl,
    apy,
    numberOfValidators: validators,
    userStakedAmount: sFuseStakedAmount,
    priceRatio,
  } = useFuseStakingStats()

  const addTransaction = useTransactionAdder()

  const onStake = useCallback(
    async (amount: string) => {
      try {
        const txn = await fuseStakingContract.deposit({
          value: amount,
        })
        setHash(txn?.hash)
        setTxnType(StakingOptions.Stake)
        addTransaction(txn, { summary: 'Stake FUSE' })
      } catch (e: any) {
        if (e?.code === 4001 || e?.code === 'ACTION_REJECTED') {
          rejectTransaction()
        }
        console.log(e, 'Failed to stake FUSE')
        return e
      }
    },
    [addTransaction, fuseStakingContract, rejectTransaction]
  )

  const unStake = useCallback(
    async (amount: string) => {
      try {
        const txn = await fuseStakingContract['withdraw(uint256)'](amount)
        setHash(txn?.hash)
        setTxnType(StakingOptions.Unstake)
        addTransaction(txn, { summary: 'Withdraw FUSE' })
      } catch (e: any) {
        if (e?.code === 4001 || e?.code === 'ACTION_REJECTED') {
          rejectTransaction()
        }
        console.log(e, 'Failed to unStake FUSE')
      }
    },
    [addTransaction, fuseStakingContract, rejectTransaction]
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
    <>
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
            currency={txnType !== StakingOptions.Unstake && sFUSE}
            onClose={() => {
              setTxnModalOpen(false)
              setTxnType(null)
            }}
            hash={hash}
          />
        </ModalLegacy.Content>
      </ModalLegacy>

      <AppBody>
        <Page>
          <Page.Header>
            <BackButton pb={1} path={'/stake'} />

            <Flex pb={2} alignItems={'center'} sx={{ gap: '20px' }}>
              <Image width={40} mt={1} src={sFuseSvg} />

              <Text py={2} fontSize={['32px', '50px']} fontWeight={700}>
                Earn on your Fuse
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
              The sFuse token is the liquid staked token of the Fuse network which allows you to be part of the
              consensus mechanism of the blockchain and earn yield while also adding a layer of utility on top.{' '}
              <a
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: 'none', fontWeight: 'bold' }}
                href="https://docs.voltage.finance/voltage/the-platform/staking/sfuse-liquid-staking"
              >
                Learn More
                <ChevronRight width={'16px'} height={'16px'} strokeWidth={'3px'} />
              </a>
            </Text>

            <Flex flexDirection={['column', 'row']} sx={{ gap: ['12px', '55px'] }}>
              <Flex sx={{ gap: '55px' }} justifyContent={['center', '']}>
                <Text fontSize={['14px', '18px']}>
                  APY (1M){' '}
                  <Box as="span" fontWeight="bold">
                    {formatSignificant({
                      value: apy,
                      suffix: '%',
                    })}
                  </Box>
                </Text>

                <Text fontSize={['14px', '18px']}>
                  APY (All time){' '}
                  <Box as="span" fontWeight="bold">
                    {formatSignificant({
                      value: apy,
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
                      value: tvl,
                      prefix: '$',
                    })}
                  </Box>
                </Text>

                <Text fontSize={['14px', '18px']}>
                  Validators{' '}
                  <Box as="span" fontWeight="bold">
                    {validators}
                  </Box>
                </Text>
              </Flex>
            </Flex>
          </Page.Subheader>

          <Page.Body>
            <Flex sx={{ gap: ['20px', '20px', '41px'] }} flexDirection={['column', 'row']}>
              <SFuseStakeInputPanel
                value={value}
                setValue={setValue}
                contract={fuseStakingContract}
                staked={{
                  balance: fuseBalance || CurrencyAmount.fromRawAmount(FUSE, 0),
                  currency: fuse,
                  icon: fuseSvg,
                  onClick: onStake,
                }}
                unstaked={{
                  balance: sFuseBalance,
                  currency: sFUSE,
                  icon: sFuseSvg,
                  onClick: unStake,
                }}
                priceRatio={priceRatio || null}
              />

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
                        value: Number(fuseBalance?.toFixed()) * fusePrice + sFuseStakedAmount * sFusePrice,
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
                            {formatSignificant({ value: sFuseStakedAmount })} {sFUSE.symbol}
                          </BalanceLoader>
                        </Text>

                        <Text fontSize={['14px', '15px', '16px']} color={'blk70'} fontWeight={600}>
                          <BalanceLoader>${formatSignificant({ value: sFuseStakedAmount * sFusePrice })}</BalanceLoader>
                        </Text>
                      </Flex>
                    </Flex>

                    <Flex mr={['16px', '28px']} width={'1px'} minHeight={'100%'} backgroundColor={'#E8E8E8'} />

                    <Flex flexDirection={['column']} sx={{ gap: ['11px', '5px', '11px'] }}>
                      <Text fontSize={['14px']} color={'blk70'} fontWeight={500}>
                        Available
                      </Text>

                      <Flex sx={{ gap: ['12px', '18px'] }}>
                        <Text fontSize={['14px', '15px', '16px']} color={'black'} fontWeight={600}>
                          <BalanceLoader>
                            {formatSignificant({ value: Number(fuseBalance?.toFixed()) })} {FUSE.symbol}
                          </BalanceLoader>
                        </Text>

                        <Text fontSize={['14px', '15px', '16px']} color={'blk70'} fontWeight={600}>
                          <BalanceLoader>
                            ${formatSignificant({ value: Number(fuseBalance?.toFixed()) * fusePrice })}
                          </BalanceLoader>
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                </Card>

                <Flex pt={['40px']} flexDirection={'column'}>
                  <Text fontSize={['18px']} fontWeight={700}>
                    Do more with your {sFUSE.symbol}
                  </Text>

                  <Flex maxWidth={['100%', '580px']} pt={['23px']} sx={{ gap: '10px' }} flexDirection={'column'}>
                    <Card height={['56px', '60px']} px={'20px'} backgroundColor={'gray'}>
                      <Flex height={'100%'} alignItems={'center'} sx={{ gap: '10px' }} justifyContent={'space-between'}>
                        <Text fontSize={['18px', '12px', '18px']} fontWeight={500} color={'black'}>
                          Earn yield
                        </Text>

                        <Flex sx={{ gap: ['30px'] }}>
                          <Flex alignItems={'center'} sx={{ gap: ['10px'] }}>
                            <Text fontSize={['18px', '12px', '18px']} fontWeight={500} color={'black'}>
                              <a
                                target="_blank"
                                rel="noreferrer"
                                style={{ textDecoration: 'none', fontWeight: 'bold' }}
                                href="https://voltage.finance/add/0x0be9e53fd7edac9f859882afdda116645287c629/0xb1dd0b683d9a56525cc096fbf5eec6e60fe79871?version=v3&feeAmount=100"
                              >
                                V3 Pool
                              </a>
                            </Text>

                            <ChevronRight width={'16px'} height={'16px'} strokeWidth={'3px'} />
                          </Flex>

                          <Flex alignItems={'center'} sx={{ gap: ['10px'] }}>
                            <Text fontSize={['18px', '12px', '18px']} fontWeight={500} color={'black'}>
                              <a
                                target="_blank"
                                rel="noreferrer"
                                style={{ textDecoration: 'none', fontWeight: 'bold' }}
                                href="https://voltage.finance/farms"
                              >
                                V3 Farm
                              </a>
                            </Text>

                            <ChevronRight width={'16px'} height={'16px'} strokeWidth={'3px'} />
                          </Flex>
                        </Flex>
                      </Flex>
                    </Card>

                    <Card height={['56px', '60px']} px={'20px'} backgroundColor={'gray'}>
                      <Flex height={'100%'} alignItems={'center'} sx={{ gap: '10px' }} justifyContent={'space-between'}>
                        <Text fontSize={['18px', '12px', '18px']} fontWeight={500} color={'black'}>
                          Lend your sFuse
                        </Text>

                        <Flex alignItems={'center'} sx={{ gap: ['25px'] }}>
                          <Flex
                            alignItems={'center'}
                            sx={{ cursor: 'pointer' }}
                            onClick={() =>
                              window.open('https://lend.meridianfinance.net/deposit/', '_blank', 'noopener,noreferrer')
                            }
                          >
                            <Image height={['50px', '55px']} src={meridianSvg} />

                            <ChevronRight width={'16px'} height={'16px'} strokeWidth={'3px'} />
                          </Flex>

                          <Flex
                            alignItems={'center'}
                            sx={{ cursor: 'pointer' }}
                            onClick={() =>
                              window.open('https://fuse-fuse.shoebill.finance/#/', '_blank', 'noopener,noreferrer')
                            }
                          >
                            <Image height={['38px', '38px']} src={shoebillSvg} />

                            <ChevronRight width={'16px'} height={'16px'} strokeWidth={'3px'} />
                          </Flex>
                        </Flex>
                      </Flex>
                    </Card>

                    <Card height={['56px', '60px']} px={'20px'} backgroundColor={'gray'}>
                      <Flex height={'100%'} alignItems={'center'} sx={{ gap: '10px' }} justifyContent={'space-between'}>
                        <Text fontSize={['18px', '12px', '18px']} fontWeight={500} color={'black'}>
                          Trade with leverage
                        </Text>

                        <Flex
                          alignItems={'center'}
                          sx={{ gap: ['10px'], cursor: 'pointer' }}
                          onClick={() =>
                            window.open(
                              'https://app.lynx.finance/pools?sa=wfuse&chainId=122',
                              '_blank',
                              'noopener,noreferrer'
                            )
                          }
                        >
                          <Image height={['29px', '29px']} src={lynxSvg} />

                          <ChevronRight width={'16px'} height={'16px'} strokeWidth={'3px'} />
                        </Flex>
                      </Flex>
                    </Card>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Page.Body>
        </Page>
      </AppBody>
    </>
  )
}
