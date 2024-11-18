import React, { useCallback, useState } from 'react'
import { Flex } from 'rebass'
import { Button } from 'rebass/styled-components'
import Row from '../../components/Row'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useTokenBalance } from '../../state/wallet/hooks'
import styled from 'styled-components'
import { VOLT_ROLL_ADDRESS } from '../../constants'
import useVoltRoll from '../../hooks/useVoltRoll'
import { useToken } from '../../hooks/Tokens'
import { TYPE } from '../../theme'
import tryParseCurrencyAmount from '../../utils/tryParseCurrencyAmount'

const StyledBalanceMax = styled.button`
  display: flex;
  align-items: center;
  width: 70px;
  height: 28px;
  display: flex;
  position: relative;
  margin: 5px 0;
  background: transparent;
  border-radius: 5px;
  border: 0;
  color: white;
  padding: 4px 18px;
  cursor: pointer;
  font-size: 14px;
  border: 1px solid #ffffff;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
`
const Input = styled.input`
  border: none;
  height: 35px;
  width: 78%;
  background: rgba(0, 0, 0, 0.003);
  box-shadow: inset 0 -2px 1px rgba(0, 0, 0, 0.03);
  font-weight: 300;
  font-size: 15px;
  color: white;
  :focus-visible {
    border: 0px black solid;
    box-shadow: none;
  }
  ::placeholder,
  ::-webkit-input-placeholder {
    color: gray;
  }
  :-ms-input-placeholder {
    color: gray;
  }
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

interface MigratorProps {
  account: string
  selectedPair: any
  onSuccess: () => void
}

export default function Migrator({ selectedPair, account, onSuccess }: MigratorProps) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<any>(null)

  const liquidityToken = useToken(selectedPair.pair.id)

  const tokenBalance = useTokenBalance(account, liquidityToken ?? undefined)

  const parsedAmount = tryParseCurrencyAmount(amount, liquidityToken ?? undefined)

  const [approval, approveCallback] = useApproveCallback(parsedAmount, VOLT_ROLL_ADDRESS)

  const { migrate } = useVoltRoll()

  const onMigrate = useCallback(async () => {
    setError(null)

    if (!parsedAmount) return

    try {
      await migrate(selectedPair.pair, parsedAmount.quotient.toString())
      onSuccess()
    } catch (error) {
      setError(error)
      console.error(error)
    }
  }, [parsedAmount, migrate, selectedPair.pair, onSuccess])

  function onMax() {
    if (tokenBalance) {
      setAmount(tokenBalance.toSignificant())
    }
  }

  return (
    <Card>
      <h1>Amount of Tokens</h1>
      <Row backgroundColor={'black'} padding={'8px'} borderRadius={'10px'} border={'0.5px solid rgba(181,185,211,0.5)'}>
        <Input value={amount} onChange={e => setAmount(e.target.value)} />
        <StyledBalanceMax onClick={onMax}>Max</StyledBalanceMax>
      </Row>
      <Row
        backgroundColor={'black'}
        padding={'15px'}
        marginTop={'10px'}
        borderRadius={'10px'}
        border={'0.5px solid rgba(181,185,211,0.5)'}
        flexDirection={'column'}
      >
        <span style={{ marginBottom: '15px', width: '100%' }}>
          {selectedPair?.pair?.token0?.name + '/' + selectedPair?.pair?.token1?.name}
        </span>
        <Flex width={'100%'} justifyContent={'space-around'}>
          {(approval === ApprovalState.NOT_APPROVED || approval === ApprovalState.PENDING) && (
            <Button
              variant="primary"
              width={'48%'}
              ml={1}
              onClick={approveCallback}
              disabled={approval === ApprovalState.PENDING}
            >
              {approval === ApprovalState.PENDING ? <span>Approving</span> : 'Approve '}
            </Button>
          )}
          <Button
            variant="primary"
            width={'150px'}
            disabled={approval === ApprovalState.NOT_APPROVED || approval === ApprovalState.PENDING}
            onClick={() => onMigrate()}
          >
            Migrate
          </Button>
        </Flex>{' '}
        <TYPE.error error={error} textAlign="left" marginTop="15px" width="100%">
          {error?.message}
        </TYPE.error>
      </Row>
    </Card>
  )
}
