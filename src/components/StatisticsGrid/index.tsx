import { chunk, flattenDeep } from 'lodash'
import { Box, Flex } from 'rebass/styled-components'
import { Statistic, StatisticsProps } from '../../components/Statistic'
interface OverviewProps {
  items: Array<Array<StatisticsProps>>
}

export const StatisticsGrid = ({ items = [] }: OverviewProps) => {
  const chunkedItems = chunk(flattenDeep(items), 2)
  return (
    <Box>
      <Box display={['none', 'none', 'block']}>
        <Flex style={{ gap: '8px' }} flexDirection={'column'}>
          {items.map((row, index) => (
            <Flex pb={items.length - 1 !== index && 3} mx={-2} key={index}>
              {row.map(({ name, ...props }) => (
                <Box px={2} width={1 / row.length} key={name}>
                  <Statistic name={name} {...props} />
                </Box>
              ))}
            </Flex>
          ))}
        </Flex>
      </Box>
      <Box display={['block', 'block', 'none']}>
        <Flex style={{ gap: '8px' }} flexDirection={'column'}>
          {chunkedItems.map((row, index) => (
            <Flex pb={chunkedItems.length - 1 !== index && 3} key={index} mx={-2}>
              {row.map(({ name, ...props }) => (
                <Box px={2} width={1 / row.length} key={name}>
                  <Statistic name={name} {...props} />
                </Box>
              ))}
            </Flex>
          ))}
        </Flex>
      </Box>
    </Box>
  )
}
