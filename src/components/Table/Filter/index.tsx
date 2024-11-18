import { Box, Flex } from 'rebass/styled-components'

interface FilterItemProps {
  name: string
  key: string
}

interface FilterProps {
  filters: Array<FilterItemProps>
  onFilter: (args: FilterItemProps) => void
  activeIndex: number
}

const Filter = ({ filters = [], activeIndex = 0, onFilter }: FilterProps) => {
  return (
    <Box>
      <Flex width={'100%'} sx={{ gap: 4 }}>
        {filters.map(({ name, key }, index) => (
          <Flex key={index} flexDirection={'column'}>
            <Box
              onClick={() => {
                onFilter({ name, key })
              }}
              opacity={activeIndex === index ? 1 : 0.5}
              fontSize={3}
              fontWeight={activeIndex === index ? 600 : 500}
              sx={{ cursor: 'pointer' }}
            >
              {name}
            </Box>
            {activeIndex === index && <Box color="black" variant={'border'}></Box>}
          </Flex>
        ))}
      </Flex>
      <Box py={2}></Box>
    </Box>
  )
}
export default Filter
