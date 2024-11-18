import { Card, Flex, Text } from 'rebass/styled-components'

import NumericalInput from '../../../../../components/NumericalInput'

import plusIconSvg from '../../../../../assets/svg/liquidity/plus-icon.svg'
import minusIconSvg from '../../../../../assets/svg/liquidity/minus-icon.svg'

export const PriceSelector = ({ title, subTitle, value, onUserInput, onIncrement, onDecrement, currency }: any) => {
  return (
    <Card bg="gray70">
      <Flex flexDirection={'column'} justifyContent={'space-between'} sx={{ gap: 3 }}>
        <Flex flexDirection={'column'} width={'100%'} sx={{ gap: 1 }}>
          <Text fontSize={'18px'} fontWeight={700} color={'black'}>
            {title}
          </Text>

          <Text fontSize={'14px'} fontWeight={500} color={'blk70'}>
            {subTitle}
          </Text>
        </Flex>

        <Flex alignItems={'center'} justifyContent={'center'} sx={{ gap: 1 }}>
          <NumericalInput
            onUserInput={(val) => {
              if (onUserInput) {
                onUserInput(val)
              }
            }}
            fontSize={'30px'}
            decimals={currency?.decimals}
            value={value}
          />

          <img
            src={plusIconSvg}
            alt="Plus Icon"
            style={{ width: 24, height: 24, cursor: 'pointer' }}
            onClick={onIncrement}
          />

          <img
            src={minusIconSvg}
            alt="Plus Icon"
            style={{ width: 24, height: 24, cursor: 'pointer' }}
            onClick={onDecrement}
          />
        </Flex>
      </Flex>
    </Card>
  )
}
