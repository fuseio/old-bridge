import { ArrowLeft, ArrowRight } from 'react-feather'
import { Box, Flex } from 'rebass/styled-components'

interface PaginationProps {
  page?: number
  arrowSize?: number
  numOfPages?: number
  showNumber?: boolean
  onNextPage: () => void
  onPrevPage: () => void
}

export default function Pagination({
  page = 1,
  numOfPages = 3,
  arrowSize = 20,
  showNumber = true,
  onNextPage,
  onPrevPage,
}: PaginationProps) {
  const number = showNumber ? (
    <Box fontSize={2}>
      {page} of {numOfPages}
    </Box>
  ) : null

  return (
    <Flex minWidth={'fit-content'} alignItems={'center'} sx={{ gap: 2 }}>
      {number}

      <Flex minWidth={'fit-content'} alignItems={'center'} sx={{ gap: 2 }}>
        <Box onClick={onPrevPage} sx={{ cursor: 'pointer' }}>
          <ArrowLeft size={arrowSize} />
        </Box>

        <Box onClick={onNextPage} sx={{ cursor: 'pointer' }}>
          <ArrowRight size={arrowSize} />
        </Box>
      </Flex>
    </Flex>
  )
}
