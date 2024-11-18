import { gql } from '@apollo/client/core'
import { ChevronDown } from 'react-feather'
import { useCallback, useState } from 'react'
import { Box, Flex, Text } from 'rebass/styled-components'
import { Currency, CurrencyAmount, Token } from '@voltage-finance/sdk-core'

import { useWeb3 } from '../../hooks'
import { VOLT, wFUSE } from '../../constants'
import { BasePair } from '../../data/Reserves'
import NoSelect from '../../wrappers/NoSelect'
import NumericalInput from '../NumericalInput'
import { ChainId } from '../../constants/chains'
import MultiCurrencyLogo from '../MultiCurrencyLogo'
import CurrencySearchModal from './CurrencySearchModal'
import { voltageSubgraphClient } from '../../graphql/client'

interface CurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: (res: number) => void
  showMaxButton: boolean
  hideModal?: boolean
  label?: string
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency
  disabled?: boolean
  tokenAmount?: CurrencyAmount<Token>
  currencyPriceUSD?: string | number | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  id: string
  pair?: BasePair
}

export const getVoltageFactoryData = async ({ address }: any) => {
  const result = await voltageSubgraphClient.query({
    query: gql`
    {
      pairs(first: 1, where: {id: "${address.toLowerCase()}"}) {
        id
        volumeToken0
        volumeToken1
        totalSupply
        volumeUSD
        reserve0
        reserve1
        token0 {
          address: id
          name
          symbol
          decimals
        }
        token1 {
          address: id
          name
          symbol
          decimals
        }
      }
    }
    `,
  })

  const pairs = result?.data?.pairs[0]

  // return result?.data?.uniswapFactory
  return pairs?.token0?.symbol + '-' + pairs?.token1?.symbol
}

export default function CurrencyInputPanel({ value, label, onCurrencySelect, pair }: CurrencyInputPanelProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const { chainId } = useWeb3()
  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])
  return (
    <Flex
      sx={
        chainId === ChainId.FUSE
          ? { opacity: 1, pointerEvents: 'all', gap: 2 }
          : { opacity: 0.7, pointerEvents: 'none', gap: 2 }
      }
      px={3}
      flexDirection={'column'}
    >
      <Flex pb={1} fontSize={0} fontWeight={600} justifyContent={'space-between'}>
        <Text color={'blk50'}>{label}</Text>
      </Flex>
      <Flex py={2} justifyContent={'space-between'} alignItems={'end'}>
        <Box opacity={0.6} sx={{ pointerEvents: 'none' }} maxWidth={240}>
          <NoSelect>
            <NumericalInput fontSize="32px" value={value} />
          </NoSelect>
        </Box>

        <Flex
          onClick={() => {
            setModalOpen(true)
          }}
          variant="badge"
          px={2}
          alignItems={'center'}
          width={'fit-content'}
          sx={{ gap: 2, cursor: 'pointer' }}
        >
          <MultiCurrencyLogo
            size={'24'}
            tokenAddresses={
              chainId !== ChainId.FUSE ? [wFUSE.address, VOLT.address] : [pair?.token0?.address, pair?.token1?.address]
            }
          />
          <Flex alignItems={'center'} sx={{ gap: 1 }}>
            <Text fontWeight={600} fontSize={1}>
              {chainId !== ChainId.FUSE ? wFUSE.symbol : pair?.token0.symbol} -{' '}
              {chainId !== ChainId.FUSE ? VOLT.symbol : pair?.token1.symbol}
            </Text>
            <ChevronDown size={16} />
          </Flex>
        </Flex>
      </Flex>

      {onCurrencySelect && (
        <CurrencySearchModal isOpen={modalOpen} onDismiss={handleDismissSearch} onCurrencySelect={onCurrencySelect} />
      )}
    </Flex>
  )
}
