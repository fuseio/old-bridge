import { useState } from 'react'
import { Flex, Box } from 'rebass/styled-components'
import { AnimatePresence, motion } from 'framer-motion'
import { useExpanded, useFilters, useTable } from 'react-table'

declare module 'framer-motion' {
  export interface AnimatePresenceProps {
    children?: React.ReactNode
  }
}
interface TableProps {
  data: any[]
  columns: any[]
  onSelectRow?: any
  renderRowSubComponent?: any
}

function Table({ columns, onSelectRow, renderRowSubComponent, data }: TableProps) {
  const [hover, setHover] = useState(null)
  const { getTableProps, visibleColumns, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data,
        autoResetExpanded: false,
      } as any,

      useFilters,

      useExpanded
    )

  return (
    <Flex flexDirection={'column'} {...getTableProps()}>
      {headerGroups.map((headerGroup, index) => (
        <Flex height={30} key={index} {...headerGroup.getHeaderGroupProps()}>
          {headerGroup.headers.map((column, key) => (
            <Box
              opacity={0.5}
              fontWeight={500}
              fontSize={0}
              color="black"
              width={column?.width}
              key={key}
              {...column.getHeaderProps()}
            >
              {column.render('Header')}
            </Box>
          ))}
        </Flex>
      ))}
      <Box {...getTableBodyProps()}>
        {rows.map((row, index) => {
          prepareRow(row)
          return (
            <Flex
              onClick={() => {
                if (onSelectRow) {
                  onSelectRow(row)
                }
              }}
              onMouseEnter={() => {
                setHover(row?.index)
              }}
              onMouseLeave={() => {
                setHover(null)
              }}
              style={onSelectRow ? { cursor: 'pointer' } : { cursor: 'default' }}
              opacity={onSelectRow && hover === row?.index ? 0.6 : undefined}
              flexDirection={'column'}
              width={'100%'}
              key={index}
              {...row.getRowProps()}
            >
              <Box opacity={0.5} variant={'border'} />
              <Flex
                {...(renderRowSubComponent && (row as any).getToggleRowExpandedProps())}
                height={74}
                style={{
                  userSelect: 'none',
                }}
                alignItems={'center'}
                width={'100%'}
              >
                {row.cells.map((cell) => {
                  return (
                    <Box
                      fontSize={2}
                      fontWeight={700}
                      width={cell?.column?.width}
                      key={cell.row.id}
                      {...cell.getCellProps()}
                    >
                      {cell.render('Cell')}
                    </Box>
                  )
                })}
              </Flex>
              <AnimatePresence>
                {(row as any)?.isExpanded ? (
                  <motion.div
                    initial={{
                      opacity: 0,
                      height: '0px',
                    }}
                    exit={{
                      opacity: 0,
                      height: '0px',
                      transition: {
                        duration: 0.4,
                      },
                    }}
                    animate={{
                      opacity: 1,
                      height: 'fit-content',
                      transition: {
                        duration: 0.3,
                      },
                    }}
                  >
                    <Box sx={{ borderRadius: 'default' }} bg="gray70" width="100%" colSpan={visibleColumns.length}>
                      {renderRowSubComponent({ row })}
                    </Box>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </Flex>
          )
        })}
      </Box>
    </Flex>
  )
}
export default Table
