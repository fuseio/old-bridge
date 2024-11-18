import { useWeb3Onboard } from '@web3-onboard/react/dist/context'

import { Chain } from '../constants/chains'

export default function useAddChain() {
  const { setChain } = useWeb3Onboard()

  const addChain = async (chain: Chain) => {
    await setChain({
      chainId: chain?.chainId,
      rpcUrl: chain?.rpc,
      label: chain?.chainName,
      token: chain?.nativeCurrency?.symbol,
    })
  }

  return {
    addChain,
    isAddChainEnabled: false,
  }
}
