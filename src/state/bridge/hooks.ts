import { isEqual } from 'lodash'
import { BigNumber } from 'ethers'
import { useAsyncMemo } from 'use-async-memo'
import { hexStripZeros } from 'ethers/lib/utils'
import { useDispatch, useSelector } from 'react-redux'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChainId, Currency, CurrencyAmount, Token } from '@voltage-finance/sdk-core'

import { getMinMaxPerTxn } from './limits'
import { AppDispatch, AppState } from '..'
import { BridgeTransaction } from './reducer'
import { useWeb3, useChain } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { fuseReadProvider } from '../../connectors'
import { useBlockNumber } from '../application/hooks'
import { useCurrencyBalances } from '../wallet/hooks'
import { getDailyLimit, withinDailyLimit } from './dailyLimits'
import useParsedQueryString from '../../hooks/useParsedQueryString'
import { DEFAULT_CONFIRMATIONS_LIMIT } from '../../constants/bridge'
import tryParseCurrencyAmount from '../../utils/tryParseCurrencyAmount'
import HomeBridgeABI from '../../constants/abis/homeMultiAMBErc20ToErc677.json'
import {
  BINANCE_CHAIN_ID,
  FUSE_ERC20_TO_ERC677_BRIDGE_HOME_ADDRESS,
  BINANCE_ERC20_TO_ERC677_HOME_BRIDGE_ADDRESS,
} from '../../constants'
import {
  getUserRequests,
  getNativeUserRequests,
  getUserRelayedMessages,
  getNativeUserRelayedMessages,
} from '../../graphql/queries'
import {
  getBridgeType,
  getReadContract,
  getMultiBridgeFee,
  getNativeAMBBridgeFee,
  calculateMultiBridgeFee,
  getBnbNativeAMBBridgeFee,
  getBscFuseInverseLibrary,
  calculateNativeAMBBridgeFee,
  calculateBnbNativeAMBBridgeFee,
} from '../../utils'
import {
  Field,
  typeInput,
  BridgeType,
  setRecipient,
  selectCurrency,
  BridgeDirection,
  addBridgeTransaction,
  selectBridgeDirection,
  BridgeTransactionStatus,
  finalizeBridgeTransaction,
  setCurrentBridgeTransaction,
} from './actions'

export function useBridgeState(): AppState['bridge'] {
  return useSelector<AppState, AppState['bridge']>((state) => state.bridge)
}

export function useDerivedBridgeInfo(bridgeDirection?: BridgeDirection): {
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> }
  parsedAmounts: { [field in Field]?: CurrencyAmount<Currency> }
  inputError?: string
  bridgeTransactionStatus: BridgeTransactionStatus
  confirmations: number
  bridgeFee?: string
  inputCurrencyId?: string
  isWithinDailyLimit?: boolean
  dailyLimit?: string
  minMaxAmount?: { ['minAmount']: string; ['maxAmount']: string }
} {
  const { account, chainId, library } = useWeb3()

  const { isHome } = useChain()

  const {
    independentField,
    typedValue,
    bridgeTransactionStatus,
    confirmations,
    [Field.INPUT]: { currencyId: inputCurrencyId },
  } = useBridgeState()

  const inputCurrency = useCurrency(inputCurrencyId, 'Bridge')
  // we fetch currencyId from Token for consistency
  const currencyId = useMemo(() => {
    return inputCurrency instanceof Token ? inputCurrency.address : inputCurrency?.symbol
  }, [inputCurrency])

  const currencies: { [field in Field]?: Currency } = useMemo(
    () => ({
      [Field.INPUT]: inputCurrency ?? undefined,
    }),
    [inputCurrency]
  )

  const balances = useCurrencyBalances(account ?? undefined, [currencies[Field.INPUT]])

  const currencyBalances: { [field in Field]?: CurrencyAmount<Currency> } = {
    [Field.INPUT]: balances[0],
  }

  const independentAmount: CurrencyAmount<Currency> | undefined = tryParseCurrencyAmount(
    typedValue,
    currencies[independentField]
  )

  const parsedAmounts: { [field in Field]: CurrencyAmount<Currency> | undefined } = {
    [Field.INPUT]: independentAmount,
  }

  const parsedAmount = tryParseCurrencyAmount(typedValue, inputCurrency ?? undefined)

  const { [Field.INPUT]: inputAmount } = parsedAmounts

  const minMaxAmount: { minAmount: string; maxAmount: string } | undefined = useAsyncMemo(async () => {
    if (!inputCurrencyId || !chainId || !library || !account || !bridgeDirection) return
    try {
      return await getMinMaxPerTxn(inputCurrencyId, bridgeDirection, inputCurrency?.decimals, isHome, library, account)
    } catch (e) {
      console.error(`Failed to fetch min max amount for ${inputCurrency?.symbol} at ${inputCurrencyId}`, e)
      return { minAmount: '0', maxAmount: '1000' }
    }
  }, [inputCurrencyId, inputCurrency, bridgeDirection])

  const isWithinDailyLimit: boolean | undefined = useAsyncMemo(async () => {
    if (!parsedAmount || !inputCurrencyId || !bridgeDirection || !library || !account) return

    return await withinDailyLimit(
      BigNumber.from(parsedAmount.quotient.toString()),
      inputCurrencyId,
      bridgeDirection,
      isHome,
      library,
      account
    )
  }, [parsedAmount, inputCurrencyId, bridgeDirection, account, library])

  const dailyLimit: string | undefined = useAsyncMemo(async () => {
    if (!inputCurrencyId || !bridgeDirection || !library || !account || !inputCurrency) return

    return (
      await getDailyLimit(inputCurrencyId, bridgeDirection, inputCurrency?.decimals, isHome, library, account)
    ).toString()
  }, [inputCurrencyId, bridgeDirection, inputCurrency, account, library])

  let inputError: string | undefined

  if (
    minMaxAmount &&
    minMaxAmount.minAmount &&
    minMaxAmount.maxAmount &&
    Number(typedValue) < Number(minMaxAmount.minAmount)
  ) {
    inputError = inputError ?? `Below minimum limit (${minMaxAmount.minAmount})`
  }

  if (inputAmount && currencyBalances?.[Field.INPUT]?.lessThan(inputAmount)) {
    inputError = 'Insufficient ' + currencies[Field.INPUT]?.symbol + ' balance'
  }

  if (minMaxAmount && Number(typedValue) > Number(minMaxAmount.maxAmount)) {
    inputError = inputError ?? `Above maximum limit (${minMaxAmount.maxAmount})`
  }

  if (typeof isWithinDailyLimit === 'boolean' && !isWithinDailyLimit) {
    inputError = inputError ?? 'Exceeds bridge daily limit'
  }

  return {
    currencies,
    currencyBalances,
    parsedAmounts,
    inputError,
    bridgeTransactionStatus,
    confirmations,
    isWithinDailyLimit,
    inputCurrencyId: currencyId,
    dailyLimit,
    minMaxAmount,
  }
}

export function useBridgeStatus(bridgeStatus: BridgeTransactionStatus): string {
  const { confirmations, bridgeDirection } = useBridgeState()
  const { isHome } = useChain()

  return useMemo(() => {
    switch (bridgeStatus) {
      case BridgeTransactionStatus.INITIAL:
        return ''
      case BridgeTransactionStatus.TOKEN_TRANSFER_PENDING:
      case BridgeTransactionStatus.TOKEN_TRANSFER_SUCCESS:
        return 'Transfering...'
      case BridgeTransactionStatus.CONFIRMATION_TRANSACTION_PENDING:
      case BridgeTransactionStatus.CONFIRMATION_TRANSACTION_SUCCESS:
        return `Waiting for ${confirmations}/${DEFAULT_CONFIRMATIONS_LIMIT} Confirmations`
      case BridgeTransactionStatus.CONFIRM_TOKEN_TRANSFER_PENDING:
        const network = isHome ? (bridgeDirection === BridgeDirection.FUSE_TO_BSC ? 'BNB Chain' : 'Ethereum') : 'Fuse'
        return 'Moving funds to ' + network
      default:
        return ''
    }
  }, [bridgeDirection, bridgeStatus, confirmations, isHome])
}

export function useBridgeActionHandlers(): {
  onFieldInput: (typedValue: string) => void
  onSelectBridgeDirection: (direction: BridgeDirection) => void
  onSelectCurrency: (currencyId: string | undefined) => void
  onSetRecipient: (recipient: string) => void
  onSetCurrentBridgeTransaction: (bridgeTransaction: BridgeTransaction | null) => void
  onFinalizeBridgeTransaction: (homeTxHash: string, foreignTxHash: string) => void
} {
  const dispatch = useDispatch<AppDispatch>()

  const onFieldInput = useCallback(
    (typedValue: string) => {
      dispatch(typeInput({ field: Field.INPUT, typedValue }))
    },
    [dispatch]
  )

  const onSelectBridgeDirection = useCallback(
    (direction: BridgeDirection) => {
      dispatch(selectBridgeDirection({ direction }))
    },
    [dispatch]
  )

  const onSelectCurrency = useCallback(
    (currencyId: string | undefined) => {
      dispatch(selectCurrency({ field: Field.INPUT, currencyId }))
    },
    [dispatch]
  )

  const onSetRecipient = useCallback(
    (recipient: string) => {
      dispatch(setRecipient(recipient))
    },
    [dispatch]
  )

  const onSetCurrentBridgeTransaction = useCallback(
    (bridgeTransaction: BridgeTransaction | null) => {
      dispatch(setCurrentBridgeTransaction(bridgeTransaction))
    },
    [dispatch]
  )

  const onFinalizeBridgeTransaction = useCallback(
    (homeTxHash: string, foreignTxHash: string) => {
      dispatch(finalizeBridgeTransaction({ homeTxHash, foreignTxHash }))
    },
    [dispatch]
  )

  return {
    onFieldInput,
    onSelectBridgeDirection,
    onSelectCurrency,
    onSetRecipient,
    onSetCurrentBridgeTransaction,
    onFinalizeBridgeTransaction,
  }
}

export function useBridgeFee(
  tokenAddress: string | undefined,
  bridgeDirection: BridgeDirection | undefined
): string | undefined {
  const { account, library } = useWeb3()
  const { isHome } = useChain()

  return useAsyncMemo(async () => {
    if (!account || !library || !tokenAddress || !bridgeDirection) return

    let method: (...args: Array<any>) => Promise<any>, args: Array<any>
    try {
      const bridgeType = getBridgeType(tokenAddress, bridgeDirection)

      switch (bridgeType) {
        case BridgeType.ETH_FUSE_ERC20_TO_ERC677:
          if (!isHome) return
          method = getMultiBridgeFee
          args = [tokenAddress, FUSE_ERC20_TO_ERC677_BRIDGE_HOME_ADDRESS, library, account, isHome]
          break
        case BridgeType.BSC_FUSE_ERC20_TO_ERC677:
          if (!isHome) return
          method = getMultiBridgeFee
          args = [tokenAddress, BINANCE_ERC20_TO_ERC677_HOME_BRIDGE_ADDRESS, library, account, isHome]
          break
        case BridgeType.BSC_FUSE_NATIVE:
          method = getNativeAMBBridgeFee
          args = [isHome, getBscFuseInverseLibrary(isHome), account]
          break
        case BridgeType.BSC_FUSE_BNB_NATIVE:
          method = getBnbNativeAMBBridgeFee
          args = [isHome, getBscFuseInverseLibrary(isHome), account]
          break
        default:
          return
      }

      const fee = await method(...args)
      return fee
    } catch (error) {
      console.error(error)
      return
    }
  }, [isHome, account, library, tokenAddress, bridgeDirection])
}

export function useCalculatedBridgeFee(
  tokenAddress: string | undefined,
  currencyAmount: CurrencyAmount<Currency> | undefined,
  bridgeDirection: BridgeDirection | undefined
): string | undefined {
  const { account, library } = useWeb3()
  const { isHome } = useChain()

  return useAsyncMemo(async () => {
    if (!tokenAddress || !currencyAmount || !account || !library || !bridgeDirection) return

    let method: (...args: Array<any>) => Promise<any>, args: Array<any>
    try {
      const bridgeType = getBridgeType(tokenAddress, bridgeDirection)

      switch (bridgeType) {
        case BridgeType.ETH_FUSE_ERC20_TO_ERC677:
          if (!isHome) return
          method = calculateMultiBridgeFee
          args = [currencyAmount, FUSE_ERC20_TO_ERC677_BRIDGE_HOME_ADDRESS, library, account]
          break
        case BridgeType.BSC_FUSE_ERC20_TO_ERC677:
          if (!isHome) return
          method = calculateMultiBridgeFee
          args = [currencyAmount, BINANCE_ERC20_TO_ERC677_HOME_BRIDGE_ADDRESS, library, account]
          break
        case BridgeType.BSC_FUSE_NATIVE:
          method = calculateNativeAMBBridgeFee
          args = [currencyAmount, isHome, getBscFuseInverseLibrary(isHome), account]
          break
        case BridgeType.BSC_FUSE_BNB_NATIVE:
          method = calculateBnbNativeAMBBridgeFee
          args = [currencyAmount, isHome, getBscFuseInverseLibrary(isHome), account]
          break
        default:
          return
      }

      const fee = await method(...args)
      return fee
    } catch (error) {
      console.error(error)
      return
    }
  }, [isHome, tokenAddress, account, currencyAmount, library])
}

export function useDetectBridgeDirection(selectedBridgeDirection?: BridgeDirection) {
  const { chainId } = useWeb3()

  if (selectedBridgeDirection) {
    return selectedBridgeDirection
  }

  switch (chainId) {
    case ChainId.MAINNET:
      return BridgeDirection.ETH_TO_FUSE
    case BINANCE_CHAIN_ID:
      return BridgeDirection.BSC_TO_FUSE
    default:
      return undefined
  }
}

export function useDefaultsFromURLSearch() {
  const parsedQs = useParsedQueryString()

  const inputCurrencyId = parsedQs.inputCurrencyId?.toString()
  const amount = parsedQs.amount?.toString()
  const recipient = parsedQs.recipient?.toString()
  const sourceChain = Number(parsedQs.sourceChain)

  return {
    inputCurrencyId,
    amount,
    sourceChain,
    recipient,
  }
}

export function useAddBridgeTransaction() {
  const dispatch = useDispatch()

  const addBridgeTransactionCallback = useCallback(
    (bridgeTransaction) => {
      dispatch(addBridgeTransaction(bridgeTransaction))
    },
    [dispatch]
  )

  return addBridgeTransactionCallback
}

function useUserErc20HomeBridgeTransactions() {
  const { account } = useWeb3()

  const [transactions, setTransactions] = useState<any>([])

  const blockNumber = useBlockNumber()

  useEffect(() => {
    getUserRequests(account).then((txns) => {
      const flatTransactions = txns.map(({ id, timestamp, message: { signatures, msgData, msgId } }) => ({
        id,
        msgId,
        timestamp,
        msgData,
        signatures,
        message: {
          msgData: msgData,
          signatures: signatures,
        },
      }))
      setTransactions(flatTransactions)
    })
  }, [account, blockNumber])

  return useMemo(
    () =>
      transactions.map((transaction: any) => ({
        ...transaction,
        ...decodeErc20BridgeTransaction(transaction.msgData),
        foreignTokenAddress: transaction.tokenAddress,
      })),
    [transactions]
  )
}

function useUserErc20ForeignBridgeTransactions(homeBridgeTransactions: Array<any>) {
  const [homeTransactions, setHomeTransactions] = useState(homeBridgeTransactions)
  const [transactions, setTransactions] = useState<any>([])

  useEffect(() => {
    if (!isEqual(homeTransactions, homeBridgeTransactions)) {
      setHomeTransactions(homeBridgeTransactions)
    }
  }, [homeBridgeTransactions, homeTransactions])

  const getTransactions = useCallback(async () => {
    const messageIds = homeTransactions.map((txn) => txn.msgId)

    if (messageIds && messageIds.length > 0) {
      const txns = await getUserRelayedMessages(messageIds)
      return txns
    }

    return []
  }, [homeTransactions])

  useEffect(() => {
    const fetchTransactions = async () => {
      const txns = await getTransactions()
      if (txns && txns.length) {
        setTransactions(txns)
      }
    }

    fetchTransactions()
  }, [getTransactions])

  return transactions
}

export function decodeErc20BridgeTransaction(data: string) {
  if (!data) return
  const encodedData = data.slice(172)

  const tokenAddress = hexStripZeros('0x' + encodedData.slice(0, 64))
  const recipient = hexStripZeros('0x' + encodedData.slice(64, 128))
  const amount = hexStripZeros('0x' + encodedData.slice(128, 192))

  return { tokenAddress, recipient, amount }
}

export function useErc20BridgeTransactions() {
  const homeBridgeTransactions = useUserErc20HomeBridgeTransactions()

  const foreignBridgeTransactions = useUserErc20ForeignBridgeTransactions(homeBridgeTransactions)

  return useMemo(() => {
    if (!homeBridgeTransactions.length) return []

    return homeBridgeTransactions.map((transaction) => {
      const foreignTransaction = foreignBridgeTransactions.find(
        (foreignTransaction) => foreignTransaction.messageId === transaction.msgId
      )
      return {
        ...transaction,
        homeTxHash: transaction.id,
        foreignTxHash: foreignTransaction ? foreignTransaction.id : undefined,
        isNative: false,
      }
    })
  }, [foreignBridgeTransactions, homeBridgeTransactions])
}

function useUserNativeHomeBridgeTransactions() {
  const { account } = useWeb3()

  const [transactions, setTransactions] = useState<any>([])

  const blockNumber = useBlockNumber()

  useEffect(() => {
    getNativeUserRequests(account).then((txns) => {
      const result = txns.map(
        ({ id, timestamp, recipient, value, txHash: homeTxHash, signatures, message: msgData }) => ({
          id,
          recipient,
          value,
          homeTxHash,
          timestamp,
          message: {
            msgData,
            signatures,
          },
        })
      )
      setTransactions(result)
    })
  }, [account, blockNumber])

  return transactions
}

function useUserNativeForeignBridgeTransactions(homeBridgeTransactions: Array<any>) {
  const [homeTransactions, setHomeTransactions] = useState(homeBridgeTransactions)
  const [transactions, setTransactions] = useState<any>([])

  useEffect(() => {
    if (!isEqual(homeTransactions, homeBridgeTransactions)) {
      setHomeTransactions(homeBridgeTransactions)
    }
  }, [homeBridgeTransactions, homeTransactions])

  const getTransactions = useCallback(async () => {
    const txHashes = homeTransactions.map((txn) => txn.homeTxHash)

    if (txHashes && txHashes.length > 0) {
      const txns = await getNativeUserRelayedMessages(txHashes)
      return txns
    }

    return []
  }, [homeTransactions])

  useEffect(() => {
    const fetchTransactions = async () => {
      const txns = await getTransactions()
      if (txns && txns.length) {
        setTransactions(txns)
      }
    }

    fetchTransactions()
  }, [getTransactions])

  return transactions
}

export function useNativeBridgeTransactions() {
  const homeBridgeTransactions = useUserNativeHomeBridgeTransactions()

  const foreignBridgeTransactions = useUserNativeForeignBridgeTransactions(homeBridgeTransactions)

  return useMemo(() => {
    if (!homeBridgeTransactions.length) return []

    return homeBridgeTransactions.map((transaction) => {
      const foreignTransaction = foreignBridgeTransactions.find(
        (foreignTransaction) => foreignTransaction.homeTxHash === transaction.homeTxHash
      )
      return {
        ...transaction,
        amount: transaction.value,
        foreignTxHash: foreignTransaction ? foreignTransaction.id : undefined,
        isNative: true,
      }
    })
  }, [foreignBridgeTransactions, homeBridgeTransactions])
}

export function useBridgeTransactions() {
  const nativeBridgeTransactions = useNativeBridgeTransactions()
  const erc20BridgeTransactions = useErc20BridgeTransactions()

  return nativeBridgeTransactions
    .concat(erc20BridgeTransactions)
    .sort(
      (a: any, b: any) =>
        new Date(parseInt(b.timestamp) * 1000).getTime() - new Date(parseInt(a.timestamp) * 1000).getTime()
    )
}

export function useErc20BridgeHomeTokenAddress(foreignTokenAddress?: string) {
  const [address, setAddress] = useState()

  const getAddress = useCallback(async () => {
    if (!foreignTokenAddress) return

    const contract = getReadContract(FUSE_ERC20_TO_ERC677_BRIDGE_HOME_ADDRESS, HomeBridgeABI, fuseReadProvider)
    return contract.homeTokenAddress(foreignTokenAddress)
  }, [foreignTokenAddress])

  useEffect(() => {
    getAddress().then((addr) => {
      if (addr) {
        setAddress(addr)
      }
    })
  }, [getAddress])

  return useMemo(() => address, [address])
}
