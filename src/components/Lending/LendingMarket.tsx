import React from 'react'
import styled from 'styled-components'
import numeral from 'numeral'
import Icon from './icons'
import { Market } from '../../state/lending/hooks'
import { TBodyTd, TBodyTr } from '../Table'
import { TYPE } from '../../theme'

const ApyField = styled.div<{ color?: string }>`
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 19px;
  color: ${({ color }) => color};
`

const BorrowButton = styled.a`
  background: linear-gradient(93.58deg, #3ad8a4 -105.35%, #f3fc1f 103.54%);
  border-radius: 5px;
  font-family: Inter;
  font-size: 13.5px;
  font-style: normal;
  font-weight: 500;
  line-height: 15px;
  letter-spacing: 0px;
  text-align: center;
  text-decoration: none;
  color: black;
  padding: 4px 12px;
`
const DepositButton = styled(BorrowButton)`
  background: transparent;
  border: 1px solid #ffffff;
  color: #ffffff;
`
interface LendingMarketProps {
  market: Market
}

export default function LendingMarket({ market }: LendingMarketProps) {
  return (
    <TBodyTr>
      <TBodyTd>
        <Icon address={market.underlyingAssetAddress} />
      </TBodyTd>
      <TBodyTd>
        <TYPE.main>
          {numeral(market.liquidity).format('$0a')}
          <TYPE.main> USD</TYPE.main>
        </TYPE.main>
      </TBodyTd>
      <TBodyTd>
        <TYPE.main>
          {numeral(market.borrowBalance).format('$0a')}
          <TYPE.main> USD</TYPE.main>
        </TYPE.main>
      </TBodyTd>
      <TBodyTd>
        <ApyField color="#4BFC1F">{numeral(market.supplyApy).format('0.0000')}%</ApyField>
      </TBodyTd>
      <TBodyTd>
        <ApyField color="#F3FC1F">{numeral(market.borrowApy).format('0.0000')}%</ApyField>
      </TBodyTd>

      <TBodyTd>
        <BorrowButton
          target="_blank"
          href="https://app.ola.finance/networks/0x26a562B713648d7F3D1E1031DCc0860A4F3Fa340/markets"
          style={{ marginRight: '1rem' }}
        >
          Deposit
        </BorrowButton>
        <DepositButton
          target="_blank"
          href="https://app.ola.finance/networks/0x26a562B713648d7F3D1E1031DCc0860A4F3Fa340/markets"
        >
          Borrow
        </DepositButton>
      </TBodyTd>
    </TBodyTr>
  )
}
