import { Flex, Text } from 'rebass/styled-components'

import { NUMBER_OF_DAYS } from '..'
import { ComponentLoader } from '../../../../wrappers/ComponentLoader'

const TimeFilter = ({ text, active, onClick }: any) => {
  return (
    <Flex
      py={2}
      height={['15.25px', '28.07px']}
      width={['21.69px', '39.94px']}
      onClick={onClick}
      alignItems={'center'}
      justifyContent={'center'}
      sx={
        active
          ? {
              backgroundColor: 'gray70',
              opacity: 1,
              fontWeight: 600,
              borderRadius: '99999px',
              cursor: 'pointer',
            }
          : {
              fontWeight: 500,
              cursor: 'pointer',
              opacity: 0.6,
            }
      }
    >
      <Text fontSize={['8px', '10px', '14px']} textAlign={'center'} color={'black'}>
        {text}
      </Text>
    </Flex>
  )
}

export const TimeFilters = ({ setNumberOfDays, numberOfDays, loading = false }: any) => {
  const timeFilterOptions = [
    { period: NUMBER_OF_DAYS.WEEK, text: '1W' },
    { period: NUMBER_OF_DAYS.MONTH, text: '1M' },
    { period: NUMBER_OF_DAYS.YEAR, text: '1Y' },
  ]

  return (
    <ComponentLoader width={200} height={28.8} loading={loading}>
      <Flex
        pb={1}
        mr={3}
        alignItems={'start '}
        style={{
          gap: 1,
          opacity: loading ? 0.5 : 1,
        }}
      >
        {timeFilterOptions.map((option) => (
          <TimeFilter
            key={option.text}
            text={option.text}
            active={numberOfDays === option.period}
            onClick={() => setNumberOfDays(option.period)}
          />
        ))}
      </Flex>
    </ComponentLoader>
  )
}
