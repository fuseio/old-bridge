import { FeeAmount } from '@voltage-finance/v3-sdk'
import { Box, Flex, Text } from 'rebass/styled-components'

import { preset } from '../../../../../theme/preset'
import { ZOOM_LEVELS, ZoomLevels } from '../LiquidityChartRangeInput'

export const QUICK_ACTION_CONFIG: Record<FeeAmount, { [percentage: number]: ZoomLevels }> = {
  [FeeAmount.LOWEST]: {
    0.1: {
      initialMin: 0.999,
      initialMax: 1.001,
      min: 0.00001,
      max: 1.5,
    },
    0.5: {
      initialMin: 0.995,
      initialMax: 1.005,
      min: 0.00001,
      max: 1.5,
    },
    1: {
      initialMin: 0.99,
      initialMax: 1.01,
      min: 0.00001,
      max: 1.5,
    },
  },
  [FeeAmount.LOW]: {
    5: {
      initialMin: 0.95,
      initialMax: 1.054,
      min: 0.00001,
      max: 1.5,
    },
    10: {
      initialMin: 0.9,
      initialMax: 1.11,
      min: 0.00001,
      max: 1.5,
    },
    20: {
      initialMin: 0.8,
      initialMax: 1.25,
      min: 0.00001,
      max: 1.5,
    },
  },
  [FeeAmount.MEDIUM]: {
    10: {
      initialMin: 0.9,
      initialMax: 1.11,
      min: 0.00001,
      max: 20,
    },
    20: {
      initialMin: 0.8,
      initialMax: 1.25,
      min: 0.00001,
      max: 20,
    },
    50: ZOOM_LEVELS[FeeAmount.MEDIUM],
  },
  [FeeAmount.HIGH]: {
    10: {
      initialMin: 0.9,
      initialMax: 1.1,
      min: 0.00001,
      max: 1.5,
    },
    20: {
      initialMin: 0.8,
      initialMax: 1.25,
      min: 0.00001,
      max: 20,
    },
    50: ZOOM_LEVELS[FeeAmount.HIGH],
  },
}

export const QuickActions = ({ feeAmount, handleRefresh, handleSetFullRange }: any) => {
  const fontSize = ['14px', '10px', '14px']

  const items =
    QUICK_ACTION_CONFIG[feeAmount] &&
    Object.entries<ZoomLevels>(QUICK_ACTION_CONFIG[feeAmount])
      ?.sort(([a], [b]) => +a - +b)
      .map(([quickAction, zoomLevel], index) => {
        return (
          <Flex
            key={`quickActions-${index}`}
            sx={{
              color: 'secondary',
              cursor: 'pointer',
              borderRadius: 'rounded',
              backgroundColor: preset.colors.grayLt,
            }}
            fontSize={fontSize}
            fontWeight={600}
            textAlign={'center'}
            alignItems={'center'}
            px={[2, 2, 2]}
            py={[2, 1, 2]}
            onClick={() => {
              handleRefresh(zoomLevel)
            }}
          >
            <Text>{quickAction}%</Text>
          </Flex>
        )
      })

  return (
    <Flex justifyContent={['flex-start', 'flex-start', 'space-between']} sx={{ gap: [2, 2, 3] }}>
      {items}

      <Box
        sx={{
          color: 'secondary',
          cursor: 'pointer',
          borderRadius: 'rounded',
          backgroundColor: preset.colors.grayLt,
        }}
        fontSize={fontSize}
        fontWeight={600}
        textAlign={'center'}
        justifyItems={'center'}
        px={2}
        py={2}
        onClick={() => {
          handleSetFullRange()
        }}
      >
        Full Range
      </Box>
    </Flex>
  )
}
