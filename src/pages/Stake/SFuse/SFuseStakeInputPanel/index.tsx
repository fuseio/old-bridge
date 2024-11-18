import { useEffect, useState } from 'react'
import { Box, Card, Flex, Text } from 'rebass/styled-components'
import { Currency, CurrencyAmount } from '@voltage-finance/sdk-core'

import Tabs from '../../../../wrappers/Tabs'
import { StakingOptions } from '../../constants'
import { formatSignificant } from '../../../../utils'
import { SFuseCurrencyInput } from '../SFuseCurrencyInput'
import { ApprovalButton } from '../../../../wrappers/ApprovalButton'
import { useApproveCallback } from '../../../../hooks/useApproveCallback'
import tryParseCurrencyAmount from '../../../../utils/tryParseCurrencyAmount'
import { CheckConnectionWrapper } from '../../../../wrappers/CheckConnectionWrapper'

interface SFuseStakingInputItemProps {
  balance: CurrencyAmount<Currency>
  currency: any
  icon?: any
  onClick: (amount: string) => Promise<unknown>
}

interface SFuseStakedInputPanelProps {
  staked: SFuseStakingInputItemProps
  priceRatio: any
  unstaked: SFuseStakingInputItemProps
  contract: any
  value: string
  setValue: any
  deprecated?: boolean
}

export const SFuseStakeInputPanel = ({
  value,
  setValue,
  staked,
  priceRatio,
  unstaked,
  contract,
  deprecated,
}: SFuseStakedInputPanelProps) => {
  const [activeTab, setActiveTab] = useState(StakingOptions.Stake)
  const [active, setActive] = useState(null)
  const [inactive, setInactive] = useState(null)
  const parsedAmount = tryParseCurrencyAmount(value.toString(), active?.balance?.currency)
  const [approval, approveCallback] = useApproveCallback(parsedAmount, contract?.address)

  useEffect(() => {
    if (activeTab === StakingOptions.Stake) {
      setActive(staked)
      setInactive(unstaked)
    } else {
      setActive(unstaked)
      setInactive(staked)
    }
  }, [activeTab, staked, unstaked])

  const stakedInputError = parsedAmount && active?.balance && active?.balance.lessThan(parsedAmount)

  return (
    <Card maxHeight={'400px'}>
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

        <Flex flexDirection={'column'}>
          <SFuseCurrencyInput
            value={value}
            onUserInput={setValue}
            priceRatio={priceRatio}
            activeCurrency={active}
            inactiveCurrency={inactive}
            onMax={(balance) => {
              setValue(balance)
            }}
          />
        </Flex>

        <Box py={3}>
          <Text color={'black'} fontWeight={500} textAlign={'left'} fontSize={'14px'}>
            {priceRatio &&
              `1 ${unstaked.currency?.symbol} = ${formatSignificant({ value: priceRatio })} ${staked.currency?.symbol}`}
          </Text>
        </Box>

        <Flex style={{ gap: '8px' }} justifyContent={'flex-end'}>
          <CheckConnectionWrapper>
            <ApprovalButton
              approval={approval}
              approveCallback={approveCallback}
              error={stakedInputError && `Insufficient ${active?.currency?.symbol} Balance`}
              onClick={() => {
                active?.onClick(parsedAmount?.quotient?.toString())
              }}
            >
              {activeTab}
            </ApprovalButton>
          </CheckConnectionWrapper>
        </Flex>
      </Flex>
    </Card>
  )
}
