import JSBI from 'jsbi'
import { useEffect, useState } from 'react'
import { Percent, Token } from '@voltage-finance/sdk-core'
import { Box, Button, Card, Flex, Text } from 'rebass/styled-components'

import { useWeb3 } from '../../../hooks'
import ModalLegacy from '../../../components/ModalLegacy'
import { useToken } from '../../../hooks/Tokens'
import FarmFundModal from '../../../modals/FarmFundModal'
import { useTotalSupply } from '../../../data/TotalSupply'
import { useTokenBalance } from '../../../state/wallet/hooks'
import { BalanceLoader } from '../../../wrappers/BalanceLoader'
import Submitted from '../../../modals/TransactionModalLegacy/Submitted'
import GetFarmLpToken from '../../../modals/FarmFundModal/GetFarmLpToken'
import { useFarmPositionPrice } from '../../../hooks/useFarmPositionPrice'
import tryParseCurrencyAmount from '../../../utils/tryParseCurrencyAmount'
import { FarmFundType, useAdjustFarmFunds } from '../../../hooks/useAdjustFarmFunds'
import { formatSignificant, tryFormatAmount, tryFormatDecimalAmount } from '../../../utils'

const Positions = ({ farm }: { farm: any }) => {
  const { account, connectWallet } = useWeb3()
  const token = useToken(farm?.LPToken)
  const positionPrice = useFarmPositionPrice(farm)

  const totalStakedAmount = formatSignificant({
    value: tryFormatDecimalAmount(farm.totalStaked, 18, 18),
  })

  const userPoolBalance = useTokenBalance(account ?? undefined, token)
  const totalPoolTokens = useTotalSupply(token)

  const poolTokenPercentage =
    !!userPoolBalance &&
    !!totalPoolTokens &&
    JSBI.greaterThanOrEqual(totalPoolTokens.quotient, userPoolBalance.quotient)
      ? new Percent(userPoolBalance.quotient, totalPoolTokens.quotient)
      : undefined

  const [farmFundType, setFarmFundType] = useState(null)

  const [depositAmount, setDepositAmount] = useState(null)
  const [depositParsedAmount, setDepositParsedAmount] = useState(null)

  const [depositBalance, setDepositBalance] = useState(null)

  const [withdrawAmount, setWithdrawAmount] = useState(null)
  const [withdrawParsedAmount, setWithdrawParsedAmount] = useState(null)

  const [withdrawBalance, setWithdrawBalance] = useState(null)

  const tokenBalance = useTokenBalance(account ?? undefined, token ?? undefined)
  const [deposit, depositTxHash, setDepositTxHash] = useAdjustFarmFunds(farm, depositParsedAmount, FarmFundType.DEPOSIT)
  const [withdraw, widthdrawTxHash, setWidthdrawTxHash] = useAdjustFarmFunds(
    farm,
    withdrawParsedAmount,
    FarmFundType.WITHDRAW
  )

  useEffect(() => {
    if (depositTxHash || widthdrawTxHash) {
      setFarmFundType(null)
    }
  }, [depositTxHash, widthdrawTxHash])

  useEffect(() => {
    setDepositBalance(tokenBalance?.toSignificant(18))
  }, [tokenBalance])

  useEffect(() => {
    const parsedTotalStaked = tryFormatAmount(farm?.totalStaked, 18)
    setWithdrawBalance(parsedTotalStaked)
  }, [farm])

  useEffect(() => {
    if (withdrawAmount) {
      setWithdrawParsedAmount(tryParseCurrencyAmount(withdrawAmount, token ?? undefined))
    }
  }, [token, withdrawAmount])

  useEffect(() => {
    if (depositAmount) {
      setDepositParsedAmount(tryParseCurrencyAmount(depositAmount, token ?? undefined))
    }
  }, [depositAmount, token])

  const lpToken = new Token(122, farm?.LPToken, 18, farm?.pairName, farm?.pairName)
  
  const getFormattedPositionPrice = (positionPrice) => {
    if (positionPrice === 0) {
      return formatSignificant({
        value: 0,
      })
    }
    if (positionPrice < 0.01) {
      return '<0.01'
    }
    return (
      totalStakedAmount +
      '/' +
      formatSignificant({
        prefix: '$',
        value: positionPrice,
      })
    )
  }

  return (
    <Card px={3} py={3} backgroundColor={'white'} width={'100%'} height={'100%'}>
      <Flex justifyContent={'space-between'}>
        <Text fontSize={1}>Position</Text>
        <GetFarmLpToken farm={farm} />
      </Flex>
      <Box py={1}></Box>

      <Flex justifyContent={'space-between'} flexDirection={'column'} style={{ gap: '8px' }} py={2}>
        <Flex alignItems={'center'} width={'100%'} justifyContent={'space-between'}>
          <Text opacity={0.7} fontSize={1}>
            % Share of Pool
          </Text>
          <BalanceLoader>
            <Text fontSize={2} fontWeight={600}>
              {formatSignificant({
                value: poolTokenPercentage?.toSignificant(18) || 0,
              })}
            </Text>
          </BalanceLoader>
        </Flex>
        <Flex alignItems={'center'} justifyContent={'space-between'}>
          <Text opacity={0.7} fontSize={1}>
            Staked
          </Text>

          <BalanceLoader>
            <Text fontSize={2} fontWeight={600}>
              {getFormattedPositionPrice(positionPrice)}
            </Text>
          </BalanceLoader>
        </Flex>
      </Flex>
      <Flex pt={3} justifyContent={'end'} width={'100%'} style={{ gap: '8px' }}>
        {!farm?.isExpired && (
          <Button
            variant="tertiary"
            bg="highlight"
            width={'fit-content'}
            height={'fit-content'}
            color="black"
            onClick={() => {
              if (!account) {
                connectWallet()
              } else {
                setFarmFundType(FarmFundType.DEPOSIT)
              }
            }}
            fontSize={0}
            fontWeight={600}
          >
            Deposit
          </Button>
        )}
        <Button
          variant="tertiary"
          onClick={() => {
            if (!account) {
              connectWallet()
            } else {
              setFarmFundType(FarmFundType.WITHDRAW)
            }
          }}
          fontSize={0}
          fontWeight={600}
        >
          Withdraw
        </Button>
      </Flex>
      <FarmFundModal
        type={farmFundType}
        amount={withdrawAmount}
        onTransfer={withdraw}
        setAmount={setWithdrawAmount}
        balance={withdrawBalance}
        parsedAmount={withdrawParsedAmount}
        modalOpen={farmFundType === FarmFundType.WITHDRAW}
        onClose={() => {
          setFarmFundType(null)
        }}
        farm={farm}
      />
      {!farm?.isExpired && (
        <FarmFundModal
          type={farmFundType}
          amount={depositAmount}
          setAmount={setDepositAmount}
          balance={depositBalance}
          onTransfer={deposit}
          parsedAmount={depositParsedAmount}
          modalOpen={farmFundType === FarmFundType.DEPOSIT}
          onClose={() => {
            setFarmFundType(null)
          }}
          farm={farm}
        />
      )}
      {!farm?.isExpired && (
        <ModalLegacy
          isOpen={depositTxHash}
          onDismiss={() => {
            setDepositTxHash(null)
          }}
          onClose={() => {
            setDepositTxHash(null)
          }}
        >
          <ModalLegacy.Content>
            <Submitted
              currency={lpToken}
              onClose={() => {
                setDepositTxHash(null)
              }}
              hash={depositTxHash}
            />
          </ModalLegacy.Content>
        </ModalLegacy>
      )}
      <ModalLegacy
        isOpen={widthdrawTxHash}
        onDismiss={() => {
          setWidthdrawTxHash(null)
        }}
        onClose={() => {
          setWidthdrawTxHash(null)
        }}
      >
        <ModalLegacy.Content>
          <Submitted
            currency={lpToken}
            onClose={() => {
              setWidthdrawTxHash(null)
            }}
            hash={widthdrawTxHash}
          />
        </ModalLegacy.Content>
      </ModalLegacy>
    </Card>
  )
}
export default Positions
