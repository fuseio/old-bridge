import { useContext } from 'react'

import { Token, CurrencyAmount } from '@voltage-finance/sdk-core'
import { RouteComponentProps, useHistory, withRouter } from 'react-router-dom'
import { Text } from 'rebass'
import { Button } from 'rebass/styled-components'
import { ThemeContext } from 'styled-components'
import { useWeb3 } from '../../hooks'
import { AutoColumn } from '../Column'
import DoubleCurrencyLogo from '../DoubleLogo'
import { RowBetween, RowFixed } from '../Row'
import { FixedHeightRow, HoverCard } from './index'
import { WRAPPED_NATIVE_CURRENCY } from '../../constants/token'

interface PositionCardProps extends RouteComponentProps<any> {
  token: Token
  V1LiquidityBalance: CurrencyAmount<Token>
}

function V1PositionCard({ token, V1LiquidityBalance }: PositionCardProps) {
  const theme = useContext(ThemeContext)

  const { chainId } = useWeb3()
  const history = useHistory()
  return (
    <HoverCard>
      <AutoColumn gap="12px">
        <FixedHeightRow>
          <RowFixed>
            <DoubleCurrencyLogo currency0={token} margin={true} size={20} />
            <Text fontWeight={500} fontSize={20} style={{ marginLeft: '' }}>
              {`${chainId && token.equals(WRAPPED_NATIVE_CURRENCY[chainId]) ? 'WETH' : token.symbol}/ETH`}
            </Text>
            <Text
              fontSize={12}
              fontWeight={500}
              ml="0.5rem"
              px="0.75rem"
              py="0.25rem"
              style={{ borderRadius: '1rem' }}
              backgroundColor={theme.yellow1}
              color={'black'}
            >
              V1
            </Text>
          </RowFixed>
        </FixedHeightRow>

        <AutoColumn gap="8px">
          <RowBetween marginTop="10px">
            <Button
              variant="secondary"
              width="68%"
              onClick={() => {
                history.push(`/migrate/v1/${V1LiquidityBalance.currency.address}`)
              }}
            >
              Migrate
            </Button>

            <Button
              width="28%"
              onClick={() => {
                history.push(`/remove/v1/${V1LiquidityBalance.currency.address}`)
              }}
            >
              Remove
            </Button>
          </RowBetween>
        </AutoColumn>
      </AutoColumn>
    </HoverCard>
  )
}

export default withRouter(V1PositionCard)
