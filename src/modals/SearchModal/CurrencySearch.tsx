import { Search } from 'react-feather'
import { FixedSizeList } from 'react-window'
import { useTranslation } from 'react-i18next'
import { Box, Flex } from 'rebass/styled-components'
import { Input } from '@rebass/forms/styled-components'
import { Currency, Token } from '@voltage-finance/sdk-core'
import { KeyboardEvent, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { isAddress } from '../../utils'
import CurrencyList from './CurrencyList'
import { filterTokens } from './filtering'
import { FUSE } from '../../data/Currency'
import { useTokenComparator } from './sorting'
import { useBridgeState } from '../../state/bridge/hooks'
import { WrappedTokenInfo } from '../../state/lists/hooks'
import { BridgeDirection } from '../../state/bridge/actions'
import { useAllBridgeTokens, useAllSwapTokens, useToken } from '../../hooks/Tokens'
import { getVoltageV3PopularTokensSwapList } from '../../graphql/queries/voltageV3Subgraph'
import { FUSD_ADDRESS_V3, FUSE_BNB, FUSE_BUSD, FUSE_USDT_V2, FUSE_WETH, USDC_V2 } from '../../constants'

interface CurrencySearchProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherSelectedCurrency?: Currency | null
  showCommonBases?: boolean
  showETH: boolean
  listType: CurrencyListType
}

const STABLESWAP_ADDRESSES = [
  USDC_V2.address.toLowerCase(), // USDT V2
  FUSE_USDT_V2.address.toLowerCase(), // USDC V2
  FUSD_ADDRESS_V3.toLowerCase(), // fUSDV3
  '0x4447863cddabbf2c3dac826f042e03c91927a196', //  USDM
  '0x830cfb18ae30b7d989f6950638be15816416ff5c', // asUSDC
  '0x2502f488d481df4f5054330c71b95d93d41625c2', // DAI V2
]

const getListType = (listType?: string) => {
  if (listType === 'Swap') {
    return useAllSwapTokens
  } else {
    return useAllBridgeTokens
  }
}

export function CurrencySearch({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  onDismiss,
  isOpen,
  showETH: showETHToken,
  listType,
}: CurrencySearchProps) {
  const { t } = useTranslation()
  const fixedList = useRef<FixedSizeList>()
  const { bridgeDirection } = useBridgeState()

  const useAllTokens = getListType(listType)
  const allTokens = useAllTokens()

  const [tokens, setTokens] = useState([])
  const [showETH, setShowEth] = useState(showETHToken)
  const [popularTokens, setPopularTokens] = useState([])
  const [invertSearchOrder] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')

  // if they input an address, use it
  const isAddressSearch = isAddress(searchQuery)
  const searchToken = useToken(searchQuery)

  const tokenComparator = useTokenComparator(invertSearchOrder, listType)
  const showMultiBridgeTokens = listType !== 'Swap' && bridgeDirection === BridgeDirection.FUSE_TO_BSC

  const filteredBridgeTokens: Token[] = useMemo(() => {
    const tokens = Object.values(allTokens)
    return showMultiBridgeTokens
      ? tokens.filter(
          (token) => (token as WrappedTokenInfo).tokenInfo?.isMultiBridge || token.address === FUSE_BNB.address
        )
      : listType === 'Bridge'
      ? tokens.filter(
          (token) =>
            token.address !== FUSE_BNB.address &&
            token.address !== FUSE_BUSD.address &&
            !(bridgeDirection === BridgeDirection.FUSE_TO_ETH && token.address === FUSE_WETH.address)
        )
      : tokens
  }, [allTokens, bridgeDirection, listType, showMultiBridgeTokens])

  const filteredTokens: Token[] = useMemo(() => {
    if (isAddressSearch) {
      return searchToken ? [searchToken] : []
    } else {
      return filterTokens(filteredBridgeTokens, searchQuery)
    }
  }, [isAddressSearch, searchToken, filteredBridgeTokens, searchQuery])

  const filteredSortedTokens: Token[] = useMemo(() => {
    if (searchToken) {
      return [searchToken]
    }

    const sorted = filteredTokens.sort(tokenComparator)
    const symbolMatch = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter((s) => s.length > 0)

    if (symbolMatch.length > 1) {
      return sorted
    }

    return [
      ...(searchToken ? [searchToken] : []),
      // sort any exact symbol matches first
      ...sorted.filter((token) => token.symbol?.toLowerCase() === symbolMatch[0]),
      ...sorted.filter((token) => token.symbol?.toLowerCase() !== symbolMatch[0]),
    ]
  }, [filteredTokens, searchQuery, searchToken, tokenComparator])

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency)
      onDismiss()
      setSearchQuery('')
    },
    [onDismiss, onCurrencySelect]
  )

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()
  const handleInput = useCallback((event) => {
    const input = event.target.value
    const checksummedInput = isAddress(input)

    setSearchQuery(checksummedInput || input)

    return fixedList?.current?.scrollTo(0)
  }, [])

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const s = searchQuery.toLowerCase().trim()
        if (s === 'fuse') {
          handleCurrencySelect(FUSE)
        } else if (filteredSortedTokens.length > 0) {
          if (
            filteredSortedTokens[0].symbol?.toLowerCase() === searchQuery.trim().toLowerCase() ||
            filteredSortedTokens.length === 1
          ) {
            handleCurrencySelect(filteredSortedTokens[0])
          }
        }
      }
    },
    [filteredSortedTokens, handleCurrencySelect, searchQuery]
  )

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery('')
  }, [isOpen])

  useEffect(() => {
    setTokens(filteredSortedTokens)
  }, [filteredSortedTokens])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [inputRef])

  useEffect(() => {
    const fetch = async () => {
      const v3query = await getVoltageV3PopularTokensSwapList()

      const listOfTokens = [...v3query]
      const sortedList = listOfTokens.sort((a, b) => parseFloat(b.volumeUSD) - parseFloat(a.volumeUSD))

      const sortedIds = sortedList.map((token) => token.id)

      const sortedTokens = sortedIds
        .map((id) => Object.values(allTokens).find((token) => token.address.toLowerCase() === id.toLowerCase()))
        .filter((token) => token !== undefined)

      setPopularTokens(sortedTokens)
    }
    fetch()
  }, [allTokens])

  return (
    <Flex
      minWidth={[370, 480]}
      flexDirection="column"
      justifyContent="flex-start"
      style={{ width: '100%', flex: '1 1', overflowX: 'hidden' }}
    >
      <Flex flexDirection={'column'}>
        <Flex py={2} px={3} sx={{ gap: 2, alignItems: 'center' }}>
          <Search size={22} color="#E8E8E8" />

          <Input
            fontSize={2}
            type="text"
            placeholder={t('tokenSearchPlaceholder')}
            value={searchQuery}
            ref={inputRef as RefObject<HTMLInputElement>}
            onChange={handleInput}
            onKeyDown={handleEnter}
          />
        </Flex>

        <Box variant={'border'}></Box>

        <Flex px={3} pt={3} pb={2} alignItems={'center'} justifyContent={'space-between'}>
          <Flex sx={{ gap: 1 }} fontSize={0}>
            <Box
              onClick={() => {
                setTokens(filteredSortedTokens)
                setShowEth(showETHToken)
              }}
              sx={{ cursor: 'pointer' }}
              variant={'badge'}
            >
              All
            </Box>

            <Box
              sx={{ cursor: 'pointer' }}
              onClick={() => {
                setTokens(popularTokens)
                setShowEth(showETHToken)
              }}
              variant={'badge'}
            >
              Popular
            </Box>

            <Box
              onClick={() => {
                setTokens(
                  Object.keys(allTokens)
                    .map((key) => allTokens[key])
                    .filter((token) => {
                      return STABLESWAP_ADDRESSES.includes(token?.address?.toLowerCase())
                    })
                )
                setShowEth(false)
              }}
              sx={{ cursor: 'pointer' }}
              variant={'badge'}
            >
              Stable coins
            </Box>
          </Flex>
        </Flex>
      </Flex>

      <CurrencyList
        showETH={showETH}
        currencies={tokens}
        onCurrencySelect={handleCurrencySelect}
        otherCurrency={otherSelectedCurrency}
        selectedCurrency={selectedCurrency}
        fixedListRef={fixedList}
        listType={listType}
      />
    </Flex>
  )
}
