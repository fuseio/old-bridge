import { chunk } from 'lodash'
import React, { useState } from 'react'
import { Box, Flex, Text } from 'rebass/styled-components'
import Table from '../../../components/Table'
import Pagination from '../../../wrappers/Pagination'
import Positions from './Positions'
import { useBridgeTransactionColumn } from './columns'
import Card from '../../../collections/Card'
const BridgeTransactions = (props: any) => {
  const { transactions } = props
  const [page, setPage] = useState(1)
  const column = useBridgeTransactionColumn()
  const renderSubComponent = React.useCallback(({ row }) => {
    return (
      <Box height={[140, 140]} width={['100%']}>
        <Positions row={row?.original} />
      </Box>
    )
  }, [])
  const numOfPages = chunk(transactions, 5)?.length || 0
  return transactions.length !== 0 ? (
    <Card>
      <Card.Header fontSize={4}>
        <Flex pb={3} justifyContent={'space-between'}>
          <Text>Recent Transactions</Text>
        </Flex>
      </Card.Header>
      <Card.Body>
        <Flex pb={3} justifyContent={'end'}>
          <Pagination
            page={page}
            numOfPages={numOfPages}
            onNextPage={() => {
              if (page < numOfPages) {
                const p = page + 1
                setPage(p)
              }
            }}
            onPrevPage={() => {
              if (page > 1) {
                const p = page - 1
                setPage(p)
              }
            }}
          />
        </Flex>
        <Table
          renderRowSubComponent={renderSubComponent}
          columns={column}
          data={transactions.length !== 0 ? chunk(transactions, 5)[page - 1] : []}
        />
      </Card.Body>
    </Card>
  ) : (
    <Card>
      <Card.Header fontSize={4}>
        <Text pb={4}>Recent Transactions</Text>
      </Card.Header>

      <Text textAlign={'center'}>No Recent Transactions</Text>
    </Card>
  )
}
export default BridgeTransactions
