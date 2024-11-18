import numeral from 'numeral'
import React, { useState } from 'react'
import styled from 'styled-components'
import dropdown from '../../assets/svg/dropdown.svg'
import { Market } from '../../state/lending/hooks'
import { Button } from 'rebass/styled-components'
import Icon from './icons'

const Container = styled.div`
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #242637;
  padding: 10px 12px;
  margin-bottom: 15px;
  > span {
    padding-right: 5px;
  }
`
const Farm = styled.p`
  width: 100%;
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: 0px;
  text-align: left;
  margin-block: 0px;
  margin-bottom: 12px;
`

const Header = styled.div<{ isOpen: boolean }>`
  display: flex;
  width: 100%;
  justify-content: space-between;
  > div {
    display: flex;
    align-items: center;
  }
  > img {
    padding-bottom: 28px;
    width: 22px;
    cursor: pointer;
    transform: ${({ isOpen }) => (isOpen ? 'translateY(-25px) rotate(180deg)' : 'rotate(0deg)')};
  }
`

const Details = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  > div {
    margin-top: 32px;
    width: 100%;
  }
`

const Title = styled.p`
  margin-block: 0px;
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: 0px;
  text-align: left;
`

const TVL = styled.div`
  position: relative;
  > div {
    display: none;
    > img {
      position: absolute;
      bottom: 2px;
      left: 2px;
    }
  }
  :hover > div {
    display: block;
    position: absolute;
    left: 195px;
    background: black;
    top: -55px;
    border-bottom-left-radius: 10px;
    padding: 13px;
    padding-bottom: 15px;
    border: solid 1px #298059;
  }
`
const Rewards = styled.div`
  display: flex;
  flex-direction: column;
`

const GreyText = styled.span`
  color: #a7a8af;
  padding-left: 4px;
`
interface LendingMarketProps {
  market: Market
}

export default function LendingMarketMobile({ market }: LendingMarketProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Container key={market.underlyingAssetAddress}>
      <Farm> Farm </Farm>
      <Header isOpen={isOpen}>
        <div>
          <Icon address={market.underlyingAssetAddress} />
        </div>
        <img
          src={dropdown}
          onClick={() => {
            setIsOpen(!isOpen)
          }}
        />
      </Header>

      {isOpen && (
        <Details>
          <div>
            <Title>Market Size</Title>
            <p style={{ textAlign: 'left' }}>
              {' '}
              {numeral(market.liquidity).format('$0a')}
              <GreyText> USD</GreyText>
            </p>
          </div>
          <div>
            <Title>Total Staked</Title>
            <p style={{ textAlign: 'left' }}>
              {numeral(market.borrowBalance).format('$0a')}
              <GreyText> USD</GreyText>
            </p>
          </div>
          <div style={{ display: 'flex' }}>
            <div style={{ width: '50%' }}>
              <Title>Supply APY</Title>
              <TVL>
                <p style={{ color: 'rgba(75, 252, 31, 1)', textAlign: 'left' }}>
                  {numeral(market.supplyApy).format('0.0000')}%
                </p>
              </TVL>
            </div>
            <div style={{ width: '50%' }}>
              <Title>Borrow APY</Title>
              <Rewards>
                <p style={{ color: 'rgba(243, 252, 31, 1)', textAlign: 'left' }}>
                  {numeral(market.borrowApy).format('0.0000')}%
                </p>
              </Rewards>
            </div>
          </div>
          <div style={{ display: 'flex', width: '100%' }}>
            <Button
              variant="primary"
              onClick={() => {
                window.open('https://app.ola.finance/networks/0x26a562B713648d7F3D1E1031DCc0860A4F3Fa340/markets')
              }}
            >
              {' '}
              Deposit{' '}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                window.open('https://app.ola.finance/networks/0x26a562B713648d7F3D1E1031DCc0860A4F3Fa340/markets')
              }}
              style={{ marginLeft: '10px', borderRadius: '5px', border: '1px solid white' }}
            >
              {' '}
              Borrow{' '}
            </Button>
          </div>
        </Details>
      )}
    </Container>
  )
}
