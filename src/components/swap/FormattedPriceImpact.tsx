import { Percent } from '@voltage-finance/sdk-core'
import { Text } from 'rebass/styled-components'
import { ONE_BIPS } from '../../constants'
import { usePriceImpactColor } from '../../hooks/usePriceImpactColor'

/**
 * Formatted version of price impact text with warning colors
 */

export default function FormattedPriceImpact({ priceImpact }: { priceImpact?: Percent }) {
  const color = usePriceImpactColor(priceImpact)
  return (
    <Text color={color}>
      ({priceImpact ? (priceImpact.lessThan(ONE_BIPS) ? '<0.01%' : `${priceImpact.toFixed(2)}%`) : '-'})
    </Text>
  )
}
