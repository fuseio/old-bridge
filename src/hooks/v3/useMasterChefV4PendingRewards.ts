import { CurrencyAmount } from "@voltage-finance/sdk-core"
import { VOLT, wFUSE } from "../../constants"
import { useSingleCallResult } from "../../state/multicall/hooks"
import { useMasterChefV4 } from "../useContract"

export default function useMasterChefV4PendingRewards(tokenId) {
    const masterChefV4 = useMasterChefV4()

    const rewards = useSingleCallResult(masterChefV4, 'pendingRewards', [tokenId])?.result

    return {
        pendingVolt: CurrencyAmount.fromRawAmount(VOLT, rewards?.[0] ?? '0'),
        pendingWFuse: CurrencyAmount.fromRawAmount(wFUSE, rewards?.[1] ?? '0')
    }
}