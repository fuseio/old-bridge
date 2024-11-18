import { useEffect, useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { FeeAmount } from '@voltage-finance/v3-sdk'
import { Box, Flex, Text } from 'rebass/styled-components'

import { formatFeeAmount } from '../../../../utils'

interface ChooseFeeTierProps {
  feeUserInput
  setFeeUserInput
}

const AddLiquidityV3FeeTierButton = ({ feeUserInput, feeAmount, description, setFeeUserInput }: any) => {
  const history = useHistory()
  const location = useLocation()

  const search = location.search

  const feeAmountFromUrl = useMemo(() => {
    if (!search) {
      return
    }
    const feeAmountFromUrlRaw = new URLSearchParams(search).get('feeAmount')

    if (!feeAmountFromUrlRaw || !Object.values(FeeAmount).includes(parseFloat(feeAmountFromUrlRaw))) {
      return undefined
    }

    return parseFloat(feeAmountFromUrlRaw)
  }, [search])

  const isActive = feeAmount === feeUserInput
  const value = formatFeeAmount(feeAmount.toString())

  useEffect(() => {
    if (feeAmountFromUrl && feeAmountFromUrl !== feeUserInput) {
      setFeeUserInput(feeAmountFromUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (feeUserInput !== feeAmountFromUrl) {
      const newUrlParams = new URLSearchParams(search)
      if (feeUserInput) {
        newUrlParams.set('feeAmount', feeUserInput)
      } else {
        newUrlParams.delete('feeAmount')
      }

      history.replace({
        pathname: location.pathname,
        search: newUrlParams.toString(),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeUserInput])

  return (
    <Box
      sx={{
        backgroundColor: isActive ? 'gray70' : 'white',
        fontWeight: 500,
        cursor: 'pointer',
        border: 'solid',
        borderColor: isActive ? 'gray95' : 'gray70',
        borderRadius: '10px',
        borderWidth: '1px',

        minWidth: ['125px', '120px', '280px'],
        height: ['82px', '82px', '82px'],
        alignContent: 'center',
      }}
      onClick={() => {
        setFeeUserInput(feeAmount)
      }}
    >
      <Flex flexDirection={'column'} mx={[2, 3, 4]}>
        <Text fontSize={'18px'} fontWeight={600}>
          {value}% Fee
        </Text>
        <Text fontSize={'14px'} fontWeight={200}>
          {description}
        </Text>
      </Flex>
    </Box>
  )
}

export default function ChooseFeeTier({ feeUserInput, setFeeUserInput }: ChooseFeeTierProps) {
  return (
    <Flex sx={{ gap: 3 }} flexDirection={'column'}>
      <Flex
        sx={{
          borderRadius: 'default',
          gap: 3,
          opacity: 1,
          pointerEvents: 'all',
        }}
        width={'100%'}
      >
        <Flex flexDirection={'column'} sx={{ gap: 3 }}>
          <AddLiquidityV3FeeTierButton
            feeAmount={FeeAmount.LOWEST}
            description={'Best for very stable pairs.'}
            feeUserInput={feeUserInput}
            setFeeUserInput={setFeeUserInput}
          />
          <AddLiquidityV3FeeTierButton
            feeAmount={FeeAmount.MEDIUM}
            description={'Best for most pairs.'}
            feeUserInput={feeUserInput}
            setFeeUserInput={setFeeUserInput}
          />
        </Flex>

        <Flex flexDirection={'column'} sx={{ gap: 3 }}>
          <AddLiquidityV3FeeTierButton
            feeAmount={FeeAmount.LOW}
            description={'Best for less volatile pairs.'}
            feeUserInput={feeUserInput}
            setFeeUserInput={setFeeUserInput}
          />

          <AddLiquidityV3FeeTierButton
            feeAmount={FeeAmount.HIGH}
            description={'Best for volatile pairs.'}
            feeUserInput={feeUserInput}
            setFeeUserInput={setFeeUserInput}
          />
        </Flex>
      </Flex>
    </Flex>
  )
}
