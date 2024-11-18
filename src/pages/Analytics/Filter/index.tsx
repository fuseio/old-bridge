import { Box, Flex, Text } from 'rebass'
import { formattedNum } from '../../../utils'
import moment from 'moment'

const Filter = ({ title = '', amount = 0, date, setNumberOfDays, numberOfDays = 360, version, showFilter = true }: any) => {
  return (
    <Flex px={4} width={'100%'} justifyContent="space-between">
      <Flex mb={3} sx={{ gap: 2 }} flexDirection="column">
        <Text color={'secondary'} fontSize={16} fontWeight={500}>
          {title}
        </Text>
        <Flex alignItems="flex-end" sx={{ gap: 2 }}>
          <Flex sx={{ gap: 2 }} flexDirection={'column'}>
            <Text color="secondary" fontSize={32} fontWeight={500}>
              {formattedNum(amount, true)}
            </Text>
            <Text color="secondary" fontSize={14} opacity={0.5} fontWeight={500}>
              {moment(date, 'YYYY-MM-DD').format('MMM D, YYYY')}
            </Text>
          </Flex>
        </Flex>
      </Flex>
      {showFilter && (
        <Flex pb={3} sx={{ gap: 3 }}>
          <Box
            onClick={() => {
              setNumberOfDays(7)
            }}
            sx={{ cursor: 'pointer', opacity: numberOfDays === 7 ? 1 : 0.5 }}
            color="secondary"
          >
            {version == 'v2' ? 'Week' : 'Daily'}
          </Box>
          <Box
            onClick={() => {
              setNumberOfDays(30)
            }}
            sx={{ cursor: 'pointer', opacity: numberOfDays === 30 ? 1 : 0.5 }}
            color="secondary"
          >
            {version == 'v2' ? 'Monthly' : 'Weekly'}
          </Box>
          <Box
            onClick={() => {
              setNumberOfDays(360)
            }}
            sx={{ cursor: 'pointer', opacity: numberOfDays === 360 ? 1 : 0.5 }}
            color="secondary"
          >
            {version == 'v2' ? 'Year' : 'Monthly'}
          </Box>
        </Flex>
      )}
    </Flex>
  )
}

export default Filter
