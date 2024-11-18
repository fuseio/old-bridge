import { Percent } from '@voltage-finance/sdk-core'
import { Pair } from '@voltage-finance/sdk'
import JSBI from 'jsbi'
import { darken } from 'polished'
import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Button, Card, Flex } from 'rebass/styled-components'
import styled from 'styled-components'
import { useTotalSupply } from '../../data/TotalSupply'
import { useWeb3 } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { TYPE } from '../../theme'
import { currencyId } from '../../utils/currencyId'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../Logo/CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { RowBetween, RowFixed } from '../Row'
import { Dots } from '../swap/styleds'

export const FixedHeightRow = styled(RowBetween)`
  height: 24px;
`

export const HoverCard = styled(Card)`
  border: 1px solid ${({ theme }) => theme.bg2};
  :hover {
    border: 1px solid ${({ theme }) => darken(0.06, theme.bg2)};
  }
`

interface PositionCardProps {
  pair: Pair
  showUnwrapped?: boolean
}

export function MinimalPositionCard({ pair, showUnwrapped = false }: PositionCardProps) {
  const { account } = useWeb3()

  const currency0 = showUnwrapped ? pair.token0 : unwrappedToken(pair.token0)
  const currency1 = showUnwrapped ? pair.token1 : unwrappedToken(pair.token1)

  const [showMore, setShowMore] = useState(false)

  const userPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.quotient, userPoolBalance.quotient)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false),
        ]
      : [undefined, undefined]

  return (
    <>
      {userPoolBalance && (
        <Card>
          <AutoColumn gap="12px">
            <FixedHeightRow>
              <RowFixed>
                <TYPE.smallHeader>Your Position</TYPE.smallHeader>
              </RowFixed>
            </FixedHeightRow>
            <AutoColumn gap="4px" onClick={() => setShowMore(!showMore)}>
              <FixedHeightRow>
                <TYPE.main>{currency0.symbol}:</TYPE.main>
                {token0Deposited ? (
                  <RowFixed>
                    <TYPE.main>{token0Deposited?.toSignificant(6)}</TYPE.main>
                  </RowFixed>
                ) : (
                  '-'
                )}
              </FixedHeightRow>
              <FixedHeightRow>
                <TYPE.main>{currency1.symbol}:</TYPE.main>
                {token1Deposited ? (
                  <RowFixed>
                    <TYPE.main>{token1Deposited?.toSignificant(6)}</TYPE.main>
                  </RowFixed>
                ) : (
                  '-'
                )}
              </FixedHeightRow>
            </AutoColumn>
          </AutoColumn>
        </Card>
      )}
    </>
  )
}

export default function FullPositionCard({ pair }: PositionCardProps) {
  const { account } = useWeb3()

  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)

  const userPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)
  const history = useHistory()
  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.quotient, userPoolBalance.quotient)
      ? new Percent(userPoolBalance.quotient, totalPoolTokens.quotient)
      : undefined

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.quotient, userPoolBalance.quotient)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false),
        ]
      : [undefined, undefined]

  return (
    <Card>
      <Flex>
        <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={true} size={20} />
        <TYPE.main fontWeight={500} fontSize={20}>
          {!currency0 || !currency1 ? <Dots>Loading</Dots> : `${currency0.symbol}/${currency1.symbol}`}
        </TYPE.main>
      </Flex>

      <AutoColumn gap="8px">
        <FixedHeightRow>
          <RowFixed>
            <TYPE.main fontSize={16} fontWeight={500}>
              Pooled {currency0.symbol}:
            </TYPE.main>
          </RowFixed>
          {token0Deposited ? (
            <RowFixed>
              <TYPE.main fontSize={16} fontWeight={500} marginLeft={'6px'}>
                {token0Deposited?.toSignificant(6)}
              </TYPE.main>
              <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency0} />
            </RowFixed>
          ) : (
            '-'
          )}
        </FixedHeightRow>

        <FixedHeightRow>
          <RowFixed>
            <TYPE.main fontSize={16} fontWeight={500}>
              Pooled {currency1.symbol}:
            </TYPE.main>
          </RowFixed>
          {token1Deposited ? (
            <RowFixed>
              <TYPE.main fontSize={16} fontWeight={500} marginLeft={'6px'}>
                {token1Deposited?.toSignificant(6)}
              </TYPE.main>
              <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency1} />
            </RowFixed>
          ) : (
            '-'
          )}
        </FixedHeightRow>
        <FixedHeightRow>
          <TYPE.main fontSize={16} fontWeight={500}>
            Your pool tokens:
          </TYPE.main>
          <TYPE.main fontSize={16} fontWeight={500}>
            {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
          </TYPE.main>
        </FixedHeightRow>
        <FixedHeightRow>
          <TYPE.main fontSize={16} fontWeight={500}>
            Your pool share:
          </TYPE.main>
          <TYPE.main fontSize={16} fontWeight={500}>
            {poolTokenPercentage ? poolTokenPercentage.toFixed(2) + '%' : '-'}
          </TYPE.main>
        </FixedHeightRow>
        <RowBetween marginTop="10px">
          <Button
            variant="secondary"
            as={Link}
            onClick={() => {
              history.push(`/add/${currencyId(currency0)}/${currencyId(currency1)}`)
            }}
            width="48%"
          >
            Add
          </Button>
          <Button
            variant="secondary"
            width="48%"
            onClick={() => {
              history.push(`/remove/${currencyId(currency0)}/${currencyId(currency1)}`)
            }}
          >
            Remove
          </Button>
        </RowBetween>
      </AutoColumn>
    </Card>
  )
}
