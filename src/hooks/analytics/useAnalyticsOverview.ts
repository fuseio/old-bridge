import { flattenDeep } from "lodash"
import { useMemo } from "react"
import { useV3TopPairs } from "./useV3Pairs"
import { useVoltageExchange } from "./useVoltageExchangeHistorical"

export default function useAnalyticsOverview() {
    const data = useVoltageExchange(1)

    const v2Data = useMemo(() => {
        return flattenDeep(data).sort((poolA, poolB) => poolB.totalLiquidityUSD - poolA.totalLiquidityUSD)
    }, [data])

    const v3Data = useV3TopPairs()

    return { v2Data, v3Data }
}