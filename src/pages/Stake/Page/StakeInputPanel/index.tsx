import { useEffect, useState } from 'react'
import { Box, Card, Flex, Text } from 'rebass/styled-components'
import { CurrencyAmount, Currency } from '@voltage-finance/sdk-core'

import Tabs from '../../../../wrappers/Tabs'
import { StakingOptions } from '../../constants'
import { CurrencyInput } from '../../../../wrappers/CurrencyInput'
import { ApprovalButton } from '../../../../wrappers/ApprovalButton'
import { useApproveCallback } from '../../../../hooks/useApproveCallback'
import tryParseCurrencyAmount from '../../../../utils/tryParseCurrencyAmount'
import { CheckConnectionWrapper } from '../../../../wrappers/CheckConnectionWrapper'

interface StakingInputItemProps {
  balance: CurrencyAmount<Currency>
  currency: any
  icon?: any
  onClick: (amount: string) => Promise<unknown>
}

interface StakedInputPanelProps {
  staked: StakingInputItemProps
  priceRatio?: any
  unstaked: StakingInputItemProps
  contract: any
  value: string
  setValue: any
  deprecated?: boolean
}

export const StakeInputPanel = ({
  value,
  setValue,
  staked,
  priceRatio,
  unstaked,
  contract,
  deprecated,
}: StakedInputPanelProps) => {
  const [activeTab, setActiveTab] = useState(StakingOptions.Stake)
  const [active, setActive] = useState(null)
  const parsedAmount = tryParseCurrencyAmount(value, active?.balance?.currency)
  const [approval, approveCallback] = useApproveCallback(parsedAmount, contract?.address)

  useEffect(() => {
    if (activeTab === StakingOptions.Stake) {
      setActive(staked)
    } else {
      setActive(unstaked)
    }
  }, [activeTab, staked, unstaked])

  const stakedInputError = parsedAmount && active?.balance && active?.balance.lessThan(parsedAmount)

  return (
    <Card>
      <Flex flexDirection={'column'}>
        <Tabs
          onChange={(tab) => {
            if (tab === StakingOptions.Stake) {
              setActiveTab(StakingOptions.Stake)
            } else {
              setActiveTab(StakingOptions.Unstake)
            }
          }}
          items={
            !deprecated
              ? [
                  {
                    name: StakingOptions.Stake,
                  },
                  {
                    name: StakingOptions.Unstake,
                  },
                ]
              : [
                  {
                    name: StakingOptions.Unstake,
                  },
                ]
          }
        />

        <CurrencyInput
          onUserInput={setValue}
          value={value}
          icon={active?.icon}
          currency={active?.currency}
          onMax={(balance) => {
            setValue(balance?.toExact())
          }}
        />

        {priceRatio && (
          <Box py={3}>
            <Text opacity={0.6} fontWeight={500} textAlign={'right'} fontSize={1}>
              {priceRatio}
            </Text>
          </Box>
        )}

        <Flex style={{ gap: '8px' }} justifyContent={'flex-end'}>
          <CheckConnectionWrapper>
            <ApprovalButton
              onClick={() => {
                active?.onClick(parsedAmount?.quotient?.toString())
              }}
              error={stakedInputError && `Insufficient ${active?.currency?.symbol} Balance`}
              approval={approval}
              approveCallback={approveCallback}
            >
              {activeTab}
            </ApprovalButton>
          </CheckConnectionWrapper>
        </Flex>
      </Flex>
    </Card>
  )
}
