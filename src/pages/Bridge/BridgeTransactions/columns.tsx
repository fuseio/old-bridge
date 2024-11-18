import { useMemo } from 'react'
import { ChevronDown, X } from 'react-feather'
import { Box, Flex, Text } from 'rebass/styled-components'
import { BridgeTransactionStatus } from '../'
import { capitalizeFirstLetter } from '../../../utils'
import BridgeTransactionAmount from './Amount'
import { Hidden } from '../../../wrappers/Hidden'

export const useBridgeTransactionColumn = () => {
  return useMemo(
    () => [
      {
        Header: () => (
          <Box fontSize={[0]} textAlign={'left'}>
            Home Txn
          </Box>
        ),
        id: 'txn',
        width: [13 / 16, 7 / 16],
        accessor: ({ homeTxHash }) => {
          return (
            <Text fontSize={[1]}>
              {homeTxHash.slice(0, 4)}...{homeTxHash.slice(-4)}
            </Text>
          )
        },
      },
      {
        Header: () => (
          <Hidden mobile>
            <Box fontSize={[0]} textAlign={'left'}>
              Amount
            </Box>
          </Hidden>
        ),
        id: 'amount',
        width: [0 / 16, 6 / 16],

        accessor: ({ tokenAddress, amount, isNative }) => {
          return (
            <Hidden mobile>
              <BridgeTransactionAmount amount={amount} foreignTokenAddress={tokenAddress} isNative={isNative} />
            </Hidden>
          )
        },
      },
      {
        Header: () => (
          <Box fontSize={[0]} textAlign={'left'}>
            Status
          </Box>
        ),
        id: 'status',
        width: [4 / 16, 2 / 16],

        accessor: ({ foreignTxHash }) => {
          if (foreignTxHash) {
            return (
              <Box fontSize={1} ml={2}>
                {capitalizeFirstLetter(BridgeTransactionStatus.SUCCESS.toLowerCase())}
              </Box>
            )
          } else {
            return (
              <Box fontSize={1} ml={2}>
                {capitalizeFirstLetter(BridgeTransactionStatus.PENDING.toLowerCase())}
              </Box>
            )
          }
        },
      },

      {
        // Build our expander column
        id: 'expander', // Make sure it has an ID
        width: [2 / 16],
        Cell: ({ row }: { row: any }) => {
          return (
            <Flex justifyContent={'end'} width="100%">
              <Box mt={1} ml={3} width={'fit-content'}>
                {row.isExpanded ? <X style={{ cursor: 'pointer' }} /> : <ChevronDown style={{ cursor: 'pointer' }} />}
              </Box>
            </Flex>
          )
        },
      },
    ],
    []
  )
}
