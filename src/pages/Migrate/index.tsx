import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import AppBody from '../AppBody'
import Row from '../../components/Row'
import { Flex } from 'rebass'
import { Pair } from '@voltage-finance/sdk'
import { useWeb3 } from '../../hooks'
import { ReactComponent as Dropdown } from '../../assets/svg/dropdown.svg'
import Migrator from './Migrator'
import { useFuseswapLiquidityPositions } from '../../graphql/hooks'

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  width: 100%;
  padding-left: 5%;
  padding-right: 5%;
  margin-top: 45px;
  margin-bottom: 45px;
  text-align: left;
  min-height: 80vh;
  justify-content: flex-start;
`

const Card = styled.div`
  width: 400px;
  display: flex;
  border-radius: 12px;
  padding: 12px 33px;
  flex-direction: column;
  align-items: flex-start;
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgb(64, 68, 79);
  color: white;
  padding: 10px 16px;
  margin: 0 2.5px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: 0 0 1rem 0;
  `}
  > h1 {
    font-family: Inter;
    font-style: normal;
    font-weight: 500;
    font-size: 18px;
    marign-bottom: 32px;
  }
`

const Header = styled.h1`
  font-size: 32px;
  font-weight: 600;
  margin: 0px;
`

const SubHeader = styled.div`
  font-size: 14px;
  font-weight: 400;
  margin-top: 0;
  line-height: 28px;
  width: 350px;
`
const DropDownContainer = styled('div')`
  margin: 0 auto;
`

const DropDownHeader = styled('div')`
  display: flex;
  align-items: center;
  position: relative;
  margin-bottom: 0.8em;
  padding: 0.4em 2em 0.4em 1em;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.15);
  font-weight: 300;
  font-size: 1rem;
  color: white;
  background: #0b0c13;
  border: 0.5px solid rgba(181, 185, 211, 0.5);
  box-sizing: border-box;
  border-radius: 10px;
  width: 355px;
  height: 50px;
  > svg {
    position: absolute;
    top: 45%;
    right: 18px;
  }
`

const DropDownListContainer = styled('div')``

const DropDownList = styled('ul')`
  width: 351px;
  position: absolute;
  padding: 0;
  margin: 0;
  padding-left: 1em;
  background: #12141e;
  border: 0.5px solid rgba(181, 185, 211, 0.5);
  border-radius: 10px;
  box-sizing: border-box;
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
  &:first-child {
    padding-top: 0.8em;
    z-index: 100;
  }
`

const ListItem = styled('li')`
  list-style: none;
  margin-bottom: 0.8em;
  padding: 12px 8px;
  width: 96%;
  :hover {
    cursor: pointer;
    background: gray;
  }
`

export default function Farms() {
  const { account } = useWeb3()

  const [selectedPair, setSelectedPair] = useState<any>()

  const [isOpen, setIsOpen] = useState(false)

  const toggling = () => setIsOpen(!isOpen)

  const onOptionClicked = (value: { pairName: string; pair: Pair }) => () => {
    setSelectedPair(value)
    setIsOpen(false)
  }

  const clearOption = () => {
    setSelectedPair(null)
    setIsOpen(false)
  }

  const liquidityPositions = useFuseswapLiquidityPositions({ account }, !!account)

  const pairs = useMemo(() => {
    if (!liquidityPositions) return []
    return liquidityPositions.map((position: any) => ({
      pairName: position.pair.token0.name + '/' + position.pair.token1.name,
      pair: position.pair
    }))
  }, [liquidityPositions])

  return (
    <AppBody>
      <Container>
        <Flex marginBottom={'45px'} width={'100%'}>
          <Row width={'50%'} flexDirection={'column'} align={'flex-start'}>
            <div style={{ width: '100%' }}>
              <Header>Migrate Fusefi Liquidity</Header>
              <SubHeader>
                Each of your pools will show up in the dropdown list below. Click migrate to remove your liquidty from
                FuseFi and deposit it to Voltage.
              </SubHeader>
            </div>
          </Row>
        </Flex>
        <Row justifyContent={'center'}>
          <Card>
            <h1> Your FuseFi Liquidity</h1>

            <DropDownContainer>
              <DropDownHeader onClick={toggling}>
                {selectedPair ? selectedPair?.pairName : 'Select Liquidity'}
                <Dropdown />
              </DropDownHeader>
              {isOpen && (
                <DropDownListContainer>
                  <DropDownList>
                    {pairs.map((pair: any) => (
                      <ListItem onClick={onOptionClicked(pair)} key={pair.pair.id}>
                        {pair.pairName}
                      </ListItem>
                    ))}
                  </DropDownList>
                </DropDownListContainer>
              )}
            </DropDownContainer>
          </Card>
        </Row>
        <Row justifyContent={'center'} marginTop={'15px'}>
          {selectedPair && account && (
            <Migrator selectedPair={selectedPair} account={account} onSuccess={() => clearOption()} />
          )}
        </Row>
      </Container>
    </AppBody>
  )
}
