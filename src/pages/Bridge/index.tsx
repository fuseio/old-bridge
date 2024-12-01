import dayjs from 'dayjs'
import styled from 'styled-components'
import Countdown from 'react-countdown'
import { useDispatch } from 'react-redux'
import { ArrowRight } from 'react-feather'
import { useAsyncMemo } from 'use-async-memo'
import { ChainId, Currency } from '@voltage-finance/sdk-core'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Button, Flex, Text } from 'rebass/styled-components'

import AppBody from '../AppBody'
import fuseApi from '../../api/fuseApi'
import { AppDispatch } from '../../state'
import Card from '../../collections/Card'
import Page from '../../collections/Page'
import BridgeDetails from './BridgeDetails'
import Message from '../../components/Message'
import Dropdown from '../../wrappers/Dropdown'
import { useChain, useWeb3 } from '../../hooks'
import useAddChain from '../../hooks/useAddChain'
import { CHAIN_MAP } from '../../constants/chains'
import useAnalytics from '../../hooks/useAnalytics'
import { currencyId } from '../../utils/currencyId'
import BridgeTransactions from './BridgeTransactions'
import ModalLegacy from '../../components/ModalLegacy'
import { NETWORK_LABELS } from '../../components/Header'
import ConnectWallet from '../../components/ConnectWallet'
import BridgeInfoModal from '../../modals/BridgeInfoModal'
import useCurrencyAmountUSD from '../../hooks/useUSDPrice'
import { Wrapper } from '../../components/BridgeInfo/styleds'
import { useUserActionHandlers } from '../../state/user/hooks'
import { ApprovalButton } from '../../wrappers/ApprovalButton'
import AddressInputPanel from '../../components/AddressInputPanel'
import { useApproveCallback } from '../../hooks/useApproveCallback'
import { BridgeDirection, Field } from '../../state/bridge/actions'
import { useTransactionAdder } from '../../state/transactions/hooks'
import Submitted from '../../modals/TransactionModalLegacy/Submitted'
import { CONSOLE_FUSE_IO_BRIDGE } from '../../constants/externalLinks'
import useCheckBridgeLiquidity from '../../hooks/useCheckBridgeLiquidity'
import { CurrencyInputDropdown } from '../../wrappers/CurrencyInputDropdown'
import UnsupportedBridgeTokenModal from '../../modals/UnsupportedBridgeTokenModal'
import { getApprovalAddress, getBridge, isContract, supportRecipientTransfer } from '../../utils'
import { useTransactionRejectedNotification } from '../../hooks/notifications/useTransactionRejectedNotification'
import {
  BINANCE_MAINNET_CHAINID,
  BSC_FUSE_TOKEN_ADDRESS,
  FUSE_FOREIGN_TOKEN_ADDRESS,
  FUSE_USDC,
  SECONDS_IN_DAY,
  UNSUPPORTED_BRIDGE_TOKENS,
} from '../../constants'
import {
  useBridgeActionHandlers,
  useBridgeState,
  useBridgeTransactions,
  useDefaultsFromURLSearch,
  useDerivedBridgeInfo,
  useDetectBridgeDirection,
} from '../../state/bridge/hooks'
import Menu from '../../components/Menu'
import MobileNav from '../../components/MobileNav'

export const GradientWrapper = styled(Wrapper)`
  display: flex;
  flex-direction: column;
  border: 1px solid rgb(64, 68, 79);
  background-color: transparent;
  background-origin: border-box;
  background-clip: content-box, border-box;
`
export enum BridgeTransactionStatus {
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
}

const DROPDOWN_FUSE_CHAIN = {
  text: CHAIN_MAP[ChainId.FUSE]?.chainName,
  src: CHAIN_MAP[ChainId.FUSE]?.icon,
  id: ChainId.FUSE,
}

const DROPDOWN_BNB_CHAIN = {
  text: CHAIN_MAP[ChainId.BNB]?.chainName,
  src: CHAIN_MAP[ChainId.BNB]?.icon,
  id: ChainId.BNB,
}

const DROPDOWN_ETH_CHAIN = {
  text: CHAIN_MAP[ChainId.MAINNET]?.chainName,
  src: CHAIN_MAP[ChainId.MAINNET]?.icon,
  id: ChainId.MAINNET,
}

export default function Bridge() {
  const { account, chainId, library } = useWeb3()
  const dispatch = useDispatch<AppDispatch>()

  const { amount, recipient: defaultRecipient } = useDefaultsFromURLSearch()

  const [selectedBridgeDirection, setSelectedBridgeDirection] = useState<BridgeDirection | undefined>()
  const bridgeDirection = useDetectBridgeDirection(selectedBridgeDirection)
  const { independentField, typedValue, recipient } = useBridgeState()

  const {
    currencies,
    parsedAmounts,
    inputError,
    inputCurrencyId,
    isWithinDailyLimit,
    minMaxAmount,
  } = useDerivedBridgeInfo(bridgeDirection)

  const fiatValueTradeInput = useCurrencyAmountUSD(parsedAmounts[Field.INPUT])

  const { [Field.INPUT]: inputCurrency } = currencies

  const rejectTransaction = useTransactionRejectedNotification()

  const { wallet } = useWeb3()

  const { updateCompletedBridgeTransfer } = useUserActionHandlers()

  const { onFieldInput, onSelectBridgeDirection, onSelectCurrency, onSetRecipient } = useBridgeActionHandlers()

  const hasSufficientLiquidity = useCheckBridgeLiquidity(parsedAmounts[Field.INPUT], bridgeDirection)

  const liquidityError =
    typeof hasSufficientLiquidity === 'boolean' && !hasSufficientLiquidity ? 'Not enough liquidity' : ''

  // unsupportedBridge modal
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  const [feeModalOpen, setFeeModalOpen] = useState(false)

  const [, setAddTokenModalOpen] = useState(false)

  const formattedAmounts = {
    [independentField]: typedValue,
  }

  const { isHome, isEtheruem, isBsc } = useChain()
  const { addChain } = useAddChain()

  const approvalAddress = getApprovalAddress(inputCurrencyId, bridgeDirection)

  const [approval, approveCallback] = useApproveCallback(parsedAmounts[Field.INPUT], approvalAddress)

  const addTransaction = useTransactionAdder()

  const nextDayTimestamp = (parseInt(String(dayjs().unix() / SECONDS_IN_DAY)) + 1) * SECONDS_IN_DAY * 1000
  const supportRecipient = useMemo(() => {
    return supportRecipientTransfer(inputCurrencyId, bridgeDirection) && !isHome
  }, [bridgeDirection, inputCurrencyId, isHome])

  const { sendEvent } = useAnalytics()

  const [txHash, setTxHash] = useState(null)

  async function onTransfer() {
    if (!chainId || !library || !account || !inputCurrency?.symbol || !bridgeDirection) return

    try {
      const { [Field.INPUT]: parsedAmountInput } = parsedAmounts

      if (!parsedAmountInput || !inputCurrencyId) {
        return
      }

      const Bridge = getBridge(inputCurrencyId, bridgeDirection)
      if (!Bridge) return

      const bridge = new Bridge(
        inputCurrencyId,
        inputCurrency.symbol,
        parsedAmountInput,
        library,
        chainId,
        account,
        dispatch,
        isHome,
        addTransaction,
        recipient
      )

      const response = await bridge?.executeTransaction()
      if (response) {
        setTxHash(response.hash)

        if (isEtheruem || isBsc) {
          await fuseApi.fund(account)
        }

        sendEvent('Bridge', {
          token: inputCurrency?.symbol,
          sourceChain: NETWORK_LABELS[chainId],
          bridgeDirection,
        })

        onSetRecipient('')
        updateCompletedBridgeTransfer()
        setAddTokenModalOpen(true)
      }

      onFieldInput('')
    } catch (error: any) {
      if (error?.code === 4001 || error?.code === 'ACTION_REJECTED') {
        rejectTransaction()
      }
      if (error?.code !== 4001) {
        console.log(error)
      }
    }
  }

  const handleInputCurrencySelect = useCallback(
    (inputCurrency: Currency) => {
      if (inputCurrency.symbol && UNSUPPORTED_BRIDGE_TOKENS.includes(inputCurrency.symbol)) {
        setModalOpen(true)
        return
      }

      onSelectCurrency(currencyId(inputCurrency))
    },
    [onSelectCurrency]
  )

  const isAccountContract = useAsyncMemo(() => {
    if (!library || !account) return null
    return isContract(library, account)
  }, [library, account])

  const bridgeTransactions = useBridgeTransactions()

  // set defaults from url params
  useEffect(() => {
    if (
      selectedBridgeDirection === BridgeDirection.FUSE_TO_ETH ||
      selectedBridgeDirection === BridgeDirection.FUSE_TO_BSC ||
      chainId === ChainId.FUSE
    ) {
      onSelectCurrency(currencyId(FUSE_USDC))
    }
    if (selectedBridgeDirection === BridgeDirection.ETH_TO_FUSE || chainId === ChainId.MAINNET) {
      onSelectCurrency(FUSE_FOREIGN_TOKEN_ADDRESS)
    }
    if (selectedBridgeDirection === BridgeDirection.BSC_TO_FUSE || chainId === BINANCE_MAINNET_CHAINID) {
      onSelectCurrency(BSC_FUSE_TOKEN_ADDRESS)
    }
  }, [selectedBridgeDirection, chainId, onSelectCurrency])

  useEffect(() => {
    if (amount) onFieldInput(amount)
  }, [amount, onFieldInput])

  useEffect(() => {
    if (defaultRecipient && supportRecipient) onSetRecipient(defaultRecipient)
  }, [defaultRecipient, onSetRecipient, supportRecipient])

  useEffect(() => {
    if (chainId === ChainId.FUSE) {
      setSelectedBridgeDirection(BridgeDirection.FUSE_TO_ETH)
    }
    if (chainId === ChainId.MAINNET) {
      setSelectedBridgeDirection(BridgeDirection.ETH_TO_FUSE)
    }
    if (chainId === BINANCE_MAINNET_CHAINID) {
      setSelectedBridgeDirection(BridgeDirection.BSC_TO_FUSE)
    }
  }, [chainId])

  const bridgeDeprecated = useMemo(() => {
    if (bridgeDirection === BridgeDirection.ETH_TO_FUSE) {
      return inputCurrencyId === FUSE_FOREIGN_TOKEN_ADDRESS ? false : true
    }

    if (bridgeDirection === BridgeDirection.BSC_TO_FUSE) {
      return inputCurrencyId === BSC_FUSE_TOKEN_ADDRESS ? false : true
    }

    if (bridgeDirection === BridgeDirection.FUSE_TO_BSC || bridgeDirection === BridgeDirection.FUSE_TO_ETH) {
      return currencies?.[Field.INPUT]?.isNative ? true : false
    }
  }, [bridgeDirection, currencies, inputCurrencyId])

  return (
    <>
      <Box
        sx={{
          backgroundImage: ['none', `url('/images/landing/hero-background.svg')`],
          backgroundSize: 'contain',
          backgroundPosition: 'top 0 right -5vw',
          backgroundRepeat: 'no-repeat',
        }}
        as="section"
      >
        <Menu />
        <MobileNav />
        <Flex
          px={3}
          py={5}
          sx={{
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          <Flex
            width={'100%'}
            maxWidth={'1200px'}
            mx="auto"
            sx={{
              alignItems: 'flex-start',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <Text fontSize={[5, '60px']} fontWeight={700} maxWidth={'600px'} as="h1">
              Voltage Bridge Withdrawal Portal
            </Text>
            <Text fontSize={3} color={'primary'} maxWidth={'550px'} as="p">
              The old Voltage Finance DEX bridge was deprecated on December 1, 2024. This portal is for you if your funds remain blocked in the bridge.
            </Text>
            <Button
              variant='blackPrimary'
              px={4}
              onClick={() => {
                window.open("https://medium.com/@voltage.finance/voltage-bridge-final-sunsetting-heres-what-you-need-to-know-73471ebedd7a", '_blank')
              }}
            >
              Learn More
            </Button>
          </Flex>
        </Flex>
      </Box>
      <AppBody pb={4} isFooter={false}>
        <UnsupportedBridgeTokenModal isOpen={modalOpen} setIsOpen={setModalOpen} />
        <BridgeInfoModal open={feeModalOpen} setOpen={setFeeModalOpen} />

        <ModalLegacy
          isOpen={txHash}
          onDismiss={() => {
            setTxHash(null)
          }}
          onClose={() => {
            setTxHash(null)
          }}
        >
          <ModalLegacy.Content>
            <Submitted
              currency={currencies[Field.INPUT]}
              onClose={() => {
                setTxHash(null)
              }}
              hash={txHash}
            />
          </ModalLegacy.Content>
        </ModalLegacy>

        <Page>
          <Box
            sx={{
              textAlign: 'center',
            }}
          >
            <Page.Header fontSize={[4, '56px']}>
              Withdraw your funds by March 1, 2025. The portal will close after this date.
            </Page.Header>
          </Box>

          <Page.Body>
            <Flex sx={{ gap: 4 }} flexDirection={['column', 'row']} style={{ width: '100%' }}>
              <Flex flexDirection={'column'} minWidth={['100%', 500]} width={['100%', 500]}>
                <Card>
                  <Card.Header pb={3} fontSize={4}>
                    Send
                  </Card.Header>

                  <Card.Body>
                    <Flex mb={3} variant={'outline'} justifyContent={'space-between'} py={3} px={3}>
                      <Flex flexDirection={'column'}>
                        <Text pb={3} fontSize={1}>
                          From
                        </Text>
                        <Dropdown
                          defaultOption={
                            wallet
                              ? chainId && {
                                text: CHAIN_MAP[chainId]?.chainName,
                                src: CHAIN_MAP[chainId]?.icon,
                                id: chainId,
                              }
                              : {
                                text: 'Source',
                                id: 'Source',
                              }
                          }
                          onChange={async (option, setValue) => {
                            await addChain(CHAIN_MAP[option.id])
                            setValue(option)
                          }}
                          options={!wallet ? [] : [DROPDOWN_FUSE_CHAIN, DROPDOWN_ETH_CHAIN, DROPDOWN_BNB_CHAIN]}
                        />
                      </Flex>

                      <Flex alignItems={'end'}>
                        <ArrowRight opacity={0.6} size={20} strokeWidth={2} />
                      </Flex>

                      <Flex flexDirection={'column'}>
                        <Text pb={3} fontSize={1}>
                          To
                        </Text>
                        <Dropdown
                          defaultOption={
                            wallet
                              ? chainId !== ChainId.FUSE
                                ? DROPDOWN_FUSE_CHAIN
                                : bridgeDirection === BridgeDirection.FUSE_TO_ETH
                                  ? DROPDOWN_ETH_CHAIN
                                  : DROPDOWN_BNB_CHAIN
                              : {
                                text: 'Destination',
                                id: 'Destination',
                              }
                          }
                          onChange={(option, setValue) => {
                            setValue(option)
                            if (chainId === ChainId.FUSE) {
                              if (option.id === ChainId.MAINNET) {
                                setSelectedBridgeDirection(BridgeDirection.FUSE_TO_ETH)
                                onSelectBridgeDirection(BridgeDirection.FUSE_TO_ETH)
                                return
                              }
                              if (option.id === ChainId.BNB) {
                                setSelectedBridgeDirection(BridgeDirection.FUSE_TO_BSC)
                                onSelectBridgeDirection(BridgeDirection.FUSE_TO_BSC)
                                return
                              }
                            }
                          }}
                          options={
                            !wallet
                              ? []
                              : chainId !== ChainId.FUSE
                                ? [DROPDOWN_FUSE_CHAIN]
                                : [DROPDOWN_ETH_CHAIN, DROPDOWN_BNB_CHAIN]
                          }
                        />
                      </Flex>
                    </Flex>
                    <>
                      {recipient && supportRecipient && (
                        <Box pt={2}>
                          <AddressInputPanel
                            id="recipient"
                            value={recipient}
                            onChange={onSetRecipient}
                            readOnly
                            chainId={ChainId.FUSE}
                          />
                        </Box>
                      )}

                      <Box py={3} px={3} variant={'outline'}>
                        <CurrencyInputDropdown
                          id="bridge-currency-input"
                          title="Amount"
                          value={formattedAmounts[Field.INPUT]}
                          onUserInput={onFieldInput}
                          onCurrencySelect={handleInputCurrencySelect}
                          selectedCurrency={currencies[Field.INPUT]}
                          showCommonBases={false}
                          showETH={isHome || isBsc}
                          listType="Bridge"
                          fiatValue={fiatValueTradeInput}
                          onlyDropdown={bridgeDeprecated}
                        />
                      </Box>

                      {!bridgeDeprecated ? (
                        account ? (
                          <BridgeDetails
                            inputCurrencyId={inputCurrencyId}
                            inputAmount={parsedAmounts[Field.INPUT]}
                            bridgeDirection={bridgeDirection}
                            minMaxAmount={minMaxAmount}
                          />
                        ) : (
                          <Box py={2}></Box>
                        )
                      ) : undefined}

                      {!bridgeDeprecated ? (
                        !wallet ? (
                          <ConnectWallet />
                        ) : (
                          <ApprovalButton
                            id="bridge-button"
                            onClick={onTransfer}
                            error={(parsedAmounts[Field.INPUT]?.greaterThan('0') && inputError) || liquidityError}
                            approval={approval}
                            approveCallback={approveCallback}
                          >
                            Bridge
                          </ApprovalButton>
                        )
                      ) : undefined}
                    </>

                    {bridgeDeprecated && (
                      <Card id="bridge-deprecated-banner" bg="secondary" mt={3}>
                        <Card.Header fontSize={3} color="white">
                          The bridge is deprecated
                        </Card.Header>
                        <Card.Subheader width={'100%'}>
                          <Text fontSize={1} color="white" width={'100%'}>
                            To transfer funds from the Binance network to the Fuse Network, please use the new Fuse
                            Bridge.
                          </Text>
                          <br />
                          <Text fontSize={1} color="white" width={'100%'}>
                            Withdrawal of previously deposited funds is still available. Just change the direction of
                            the bridge above.
                          </Text>
                        </Card.Subheader>

                        <Card.Body>
                          <Button
                            onClick={() => {
                              window.open(CONSOLE_FUSE_IO_BRIDGE, '_blank')
                            }}
                            bg="highlight"
                            color={'primary'}
                            width={'100%'}
                          >
                            Use new Fuse Bridge
                          </Button>
                        </Card.Body>
                      </Card>
                    )}
                  </Card.Body>
                </Card>

                {isAccountContract && (
                  <Box mt={3}>
                    <Message
                      header="Important!"
                      body="We currently dont support bridge transactions sent from a wallet contract (like Volt). Your funds are probably going to get lost if you transfer."
                    />
                  </Box>
                )}
                {typeof isWithinDailyLimit === 'boolean' && !isWithinDailyLimit && (
                  <Box mt={3}>
                    <Message
                      header={<Countdown date={nextDayTimestamp} />}
                      body="Bridge network limit has been reached for this token, please select another token or wait for the network limit to reset"
                    />
                  </Box>
                )}
              </Flex>

              <BridgeTransactions transactions={bridgeTransactions} />
            </Flex>
          </Page.Body>
        </Page>
      </AppBody>
    </>
  )
}
