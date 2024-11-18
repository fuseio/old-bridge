import { Card, Flex, Text } from 'rebass/styled-components'

import { formatSignificant } from '../../../../utils'
import { BalanceLoader } from '../../../../wrappers/BalanceLoader'

interface PositionProps {
  stake: { balance: number | string; symbol: string }
  lp: { balance: number | string; symbol: string }
}

export const Position = ({
  stake = { balance: 0, symbol: 'FUSE' },
  lp = { balance: 0, symbol: 'FUSE' },
}: PositionProps) => {
  return (
    <Card height={'100%'}>
      <Text variant="h4">Position</Text>
      <Flex justifyContent={'space-between'} flexDirection={'column'} sx={{ gap: 2 }}>
        <Flex alignItems={'center'} width={'100%'} justifyContent={'space-between'}>
          <Text variant={'label'}>Staked {stake?.symbol || ''}</Text>
          <BalanceLoader>
            <Text variant={'description'} fontSize={2} fontWeight={700}>
              {formatSignificant({
                value: stake.balance,
              })}
            </Text>
          </BalanceLoader>
        </Flex>
        <Flex alignItems={'center'} justifyContent={'space-between'}>
          <Text variant={'label'}>{lp?.symbol || ''} Balance</Text>
          <Text variant={'description'}>
            {formatSignificant({
              value: lp.balance,
            })}
          </Text>
        </Flex>
      </Flex>
    </Card>
  )
}
