import { NativeCurrency, ChainId, Token } from "@voltage-finance/sdk-core"
import { useMemo } from "react"
import { useWeb3 } from "."
import { nativeOnChain } from "../constants/token"

export default function useNativeCurrency(): NativeCurrency | Token {
    const { chainId } = useWeb3()
    return useMemo(() => {
      try {
        return nativeOnChain(chainId)
      } catch (e) {
        return nativeOnChain(ChainId.FUSE)
      }
    }, [chainId])
  }
