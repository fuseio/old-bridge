import React, { useMemo } from 'react'
import styled from 'styled-components'
import numeral from 'numeral'
import LendingMarket from './LendingMarket'
import href from '../../assets/svg/href.svg'
import { Market, useLendingMarkets } from '../../state/lending/hooks'
import Loader from '../Loaders/table'
import { isMobile } from 'react-device-detect'
import LendingMarketMobile from './LendingMarketMobile'

const Container = styled('div')`
  width: 100%;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  border-radius: 16px;
`

export const TableWrapper = styled.div`
  overflow-x: auto;
  width: 100%;
`

export const Table = styled.table`
  border-radius: 14px;
  font-size: 16px;
  width: 100%;
  border-spacing: 0px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    table-layout: fixed;
    width: 1000px;
  `}
`

export const Th = styled.th`
  border-bottom: 2.5px solid ${({ theme }) => theme.secondary4};
  padding: 23px 22px;
  font-weight: 500;

  :nth-child(1) {
    padding-left: 25px;
  }
  :hover {
    cursor: pointer;
  }
`

export const TBodyTr = styled.tr`
  :hover {
    background-color: ${({ theme }) => theme.black};
    cursor: pointer;
  }
`

export const TBodyTd = styled.td`
  padding: 0px 20px;
  border-bottom: 2.75px solid black;
`

const Selector = styled('div')`
  display: flex;
  position: relative;
  width: 100%;
  margin-top: 32px;
  margin-bottom: 24px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row;
    flex-wrap: wrap;
  justify-content: space-evenly;

  `}
`
const Tr = styled('tr')`
  border-bottom: 3.5px outset ${({ theme }) => theme.black};
`
const Card = styled('div')`
  position: relative;
  min-width: 330px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 12px;
  background: #242637;
  padding: 15px;
  margin-right: 10px;
  > p {
    margin: 0;
    font-family: Inter;
    font-size: 24px;
    font-weight: 400;
    line-height: 29px;
    letter-spacing: 0px;
    text-align: left;
  }
  > span {
    color: white;
    font-family: Inter;
    font-size: 18px;
    font-weight: 500;
    line-height: 22px;
    letter-spacing: 0px;
    text-align: left;
  }
  :hover {
    filter: brightness(120%);
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-bottom: 1rem;
    margin-right: 0;
    width: 48.5%
  `}
`

export default function Lending() {
  const lendingMarkets = useLendingMarkets()
  const [supplyBalance, borrowBalance] = useMemo(
    () =>
      lendingMarkets.reduce(
        (memo: any, market: any) => [memo[0] + market.supplyBalance, memo[1] + market.borrowBalance],
        [0, 0]
      ),
    [lendingMarkets]
  )

  return (
    <div>
      <Selector>
        <Card>
          <span>Network Supply Balance</span>

          <p>{numeral(supplyBalance).format('$0,0')} USD</p>
        </Card>
        <Card>
          <span>Network Borrow Balance</span>
          <p>{numeral(borrowBalance).format('$0,0')} USD</p>
        </Card>
        <Card>
          <img
            src="https://app.ola.finance/assets/images/ola/ola_symbol_clear.png"
            width="121px;"
            alt="Ola.finance logo"
          />
          <span style={{ marginTop: '20px' }}>Get more stats on Ola Finance </span>{' '}
          <img
            style={{ width: '20px', position: 'absolute', top: '3%', right: '3%' }}
            src={href}
            alt="Go to Ola.finance"
          />
        </Card>
      </Selector>
      <Container>
        {isMobile ? (
          <>
            {lendingMarkets.length
              ? lendingMarkets.map((lendingMarket: Market) => (
                  <LendingMarketMobile key={lendingMarket.underlyingAssetAddress} market={lendingMarket} />
                ))
              : 'Loading...'}
          </>
        ) : (
          <TableWrapper>
            <Table>
              <thead>
                <Tr>
                  <Th>Asset</Th>
                  <Th>Market Size</Th>
                  <Th>Total Borrowed</Th>
                  <Th>Deposit APY</Th>
                  <Th>Borrow APY</Th>
                  <Th style={{ width: '250px' }}>&nbsp;</Th>
                </Tr>
              </thead>
              <tbody>
                {lendingMarkets.length ? (
                  lendingMarkets.map((lendingMarket: Market) => (
                    <LendingMarket key={lendingMarket.underlyingAssetAddress} market={lendingMarket} />
                  ))
                ) : (
                  <tr>
                    <td>
                      <Loader />
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableWrapper>
        )}
      </Container>
    </div>
  )
}
